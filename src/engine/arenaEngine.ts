import { BattleDigimon } from '../types/battle';
import { calculateDamage } from '../utils/battleCalculations';
import { seek, wander, separation, orbit, flee, dist } from './steeringBehaviors';
import {
  ArenaDigimon,
  ArenaEvent,
  Strategy,
  STRATEGY_CONFIGS,
  WORLD_W,
  WORLD_H,
  ARENA_MARGIN,
  ATTACK_RADIUS,
  SKILL_WINDUP_MS,
  SKILL_DAMAGE_MULTIPLIER,
  ATTACK_SPRITE_MS,
  HIT_SPRITE_MS,
  SEPARATION_RADIUS,
  BASE_FORCE,
  DAMPING,
  MAX_SPEED,
  DEATH_BOUNCE_VY_INIT,
  DEATH_GRAVITY,
  KNOCKBACK_IMPULSE,
  KNOCKBACK_SKILL_MULTIPLIER,
  KNOCKBACK_DEATH_MULTIPLIER,
} from './arenaTypes';

// ─── Internal adapter ──────────────────────────────────────────────────────────

/**
 * Wraps an ArenaDigimon in the BattleDigimon shape expected by calculateDamage.
 * ArenaDigimon uses flat stat fields; BattleDigimon uses a nested stats object.
 */
const toCalcDigimon = (d: ArenaDigimon): BattleDigimon => ({
  id: d.id,
  name: d.name,
  digimon_name: d.digimon_name,
  current_level: 1,
  sprite_url: d.sprite_url,
  type: d.type,
  attribute: d.attribute,
  stats: {
    hp: d.hp,
    max_hp: d.maxHp,
    atk: d.atk,
    def: d.def,
    int: d.int,
    spd: d.spd,
    sp: d.sp,
  },
  isAlive: d.state !== 'dead',
  isOnUserTeam: d.isUserTeam,
});

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Returns { x, y } centroid of all alive Digimon on the given team. */
const getTeamCentroid = (
  digimon: ArenaDigimon[],
  team: 'user' | 'opponent',
): { x: number; y: number } => {
  const alive = digimon.filter(
    d => d.isUserTeam === (team === 'user') && d.state !== 'dead',
  );
  if (alive.length === 0) return { x: WORLD_W / 2, y: WORLD_H / 2 };
  return {
    x: alive.reduce((s, d) => s + d.x, 0) / alive.length,
    y: alive.reduce((s, d) => s + d.y, 0) / alive.length,
  };
};

/** Returns the nearest living enemy to a given Digimon, or null if none remain. */
const findNearestEnemy = (
  attacker: ArenaDigimon,
  all: ArenaDigimon[],
): ArenaDigimon | null => {
  const enemies = all.filter(
    d => d.isUserTeam !== attacker.isUserTeam && d.state !== 'dead',
  );
  if (enemies.length === 0) return null;

  let nearest = enemies[0];
  let nearestDist = dist(attacker.x, attacker.y, nearest.x, nearest.y);
  for (let i = 1; i < enemies.length; i++) {
    const d = dist(attacker.x, attacker.y, enemies[i].x, enemies[i].y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = enemies[i];
    }
  }
  return nearest;
};

/** Spawns N Digimon vertically centred in the arena, with a small y jitter. */
const spawnPositions = (
  count: number,
  xMin: number,
  xMax: number,
): Array<{ x: number; y: number }> => {
  const ySpacing = (WORLD_H * 0.5) / Math.max(count, 1);
  const yStart = WORLD_H * 0.25;
  return Array.from({ length: count }, (_, i) => ({
    x: xMin + Math.random() * (xMax - xMin),
    y: yStart + i * ySpacing + (Math.random() - 0.5) * 30,
  }));
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Converts two BattleDigimon teams into ArenaDigimon[], ready for the engine.
 * Assigns spawn positions and initialises all timers.
 *
 * @param userTeam        User's team as BattleDigimon[] (use convertToBattleDigimon from interactiveBattleStore)
 * @param opponentTeam    Opponent's team as BattleDigimon[]
 * @param userStrategies  One Strategy per user Digimon (index-aligned)
 * @param opponentStrategies  One Strategy per opponent Digimon (defaults to 'balanced')
 */
export const initArenaDigimon = (
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  userStrategies: Strategy[],
  opponentStrategies: Strategy[] = opponentTeam.map(() => 'balanced'),
): ArenaDigimon[] => {
  const userSpawns = spawnPositions(userTeam.length, 100, 250);
  const opponentSpawns = spawnPositions(opponentTeam.length, 1150, 1300);

  const make = (
    bd: BattleDigimon,
    spawn: { x: number; y: number },
    strategy: Strategy,
    isUserTeam: boolean,
  ): ArenaDigimon => {
    const config = STRATEGY_CONFIGS[strategy];
    // Stagger skill cooldown so all Digimon don't charge at the same moment
    const initialSkillCooldown = config.skillCooldownBase + Math.random() * 5000;
    const attackCooldown = config.attackCooldownBase / Math.max(bd.stats.spd / 100, 0.5);
    // SP no longer reduces initial cooldown — it now directly increases drain rate each frame
    const skillCooldown = Math.max(6000, initialSkillCooldown);

    return {
      // Identity
      id: bd.id,
      name: bd.name,
      digimon_name: bd.digimon_name,
      sprite_url: bd.sprite_url,
      type: bd.type,
      attribute: bd.attribute,
      isUserTeam,

      // Physics
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      knockbackVx: 0,
      knockbackVy: 0,

      // Combat
      hp: bd.stats.hp,
      maxHp: bd.stats.max_hp,
      atk: bd.stats.atk,
      def: bd.stats.def,
      int: bd.stats.int,
      spd: bd.stats.spd,
      sp: bd.stats.sp,

      // State machine
      state: 'approaching',
      attackCooldownMs: attackCooldown,
      skillCooldownMs: skillCooldown,
      retreatTimerMs: 0,
      skillWindupTimerMs: 0,

      // Death
      deathBounceVy: 0,
      deathOriginY: spawn.y,
      deathLanded: false,

      // Steering
      wanderAngle: Math.random() * Math.PI * 2,
      currentTargetId: null,
      lastAttackerTeam: null,

      // Strategy
      strategy,

      // Sprite
      spriteState: 'idle',
      spriteTimerMs: 0,
    };
  };

  return [
    ...userTeam.map((bd, i) =>
      make(bd, userSpawns[i], userStrategies[i] ?? 'balanced', true),
    ),
    ...opponentTeam.map((bd, i) =>
      make(bd, opponentSpawns[i], opponentStrategies[i] ?? 'balanced', false),
    ),
  ];
};

// ─── Game loop ────────────────────────────────────────────────────────────────

/**
 * Advances the arena simulation by deltaMs milliseconds.
 * Mutates the digimon array in place — it lives in a React ref, so this is correct.
 * Returns a (possibly empty) list of events that occurred this frame.
 * The caller should stop invoking runFrame after receiving a 'battle_end' event.
 */
export const runFrame = (digimon: ArenaDigimon[], deltaMs: number): ArenaEvent[] => {
  const events: ArenaEvent[] = [];

  // ── Per-Digimon update ───────────────────────────────────────────────────────
  for (const d of digimon) {

    // ── Decrement all timers ──────────────────────────────────────────────────
    d.attackCooldownMs -= deltaMs;
    // SP drives skill charge rate: higher SP = faster charge. SP=0 → 1× rate, SP=300 → 2× rate
    d.skillCooldownMs -= deltaMs * (1 + d.sp / 300);
    d.retreatTimerMs -= deltaMs;
    d.skillWindupTimerMs -= deltaMs;
    if (d.spriteTimerMs > 0) {
      d.spriteTimerMs -= deltaMs;
      if (d.spriteTimerMs <= 0) {
        // Revert timed sprite states back to idle (dead is permanent)
        if (d.spriteState === 'attacking' || d.spriteState === 'hit') {
          d.spriteState = 'idle';
          d.spriteTimerMs = 0;
        }
      }
    }

    // ── Dead: handle bounce only ──────────────────────────────────────────────
    if (d.state === 'dead') {
      if (!d.deathLanded) {
        d.deathBounceVy += DEATH_GRAVITY * deltaMs;
        d.y += d.deathBounceVy * deltaMs;
        if (d.y >= d.deathOriginY) {
          d.y = d.deathOriginY;
          d.deathLanded = true;
          d.spriteState = 'dead';
          d.spriteTimerMs = 0;
        }
      }
      continue;
    }

    // ── Find nearest enemy ────────────────────────────────────────────────────
    const target = findNearestEnemy(d, digimon);
    if (!target) continue; // no enemies left — battle_end check handles this below

    d.currentTargetId = target.id;
    const distToTarget = dist(d.x, d.y, target.x, target.y);
    const config = STRATEGY_CONFIGS[d.strategy];

    // ── State machine ─────────────────────────────────────────────────────────

    // Priority a: skill_windup — no movement, wait for windup to complete
    if (d.state === 'skill_windup') {
      if (d.skillWindupTimerMs <= 0) {
        // Fire the skill
        const calcAttacker = toCalcDigimon(d);
        const calcTarget = toCalcDigimon(target);
        const result = calculateDamage(calcAttacker, calcTarget);
        const rawDamage = result.isMiss ? 0 : Math.round(result.damage * SKILL_DAMAGE_MULTIPLIER);

        target.hp = Math.max(0, target.hp - rawDamage);

        events.push({
          type: 'damage',
          attackerId: d.id,
          targetId: target.id,
          damage: rawDamage,
          isCritical: result.isCritical,
          isMiss: result.isMiss,
          isSkill: true,
          targetX: target.x,
          targetY: target.y,
        });

        // Update target sprite + knockback on skill hit
        if (!result.isMiss && rawDamage > 0) {
          target.spriteState = 'hit';
          target.spriteTimerMs = HIT_SPRITE_MS;
          target.lastAttackerTeam = d.isUserTeam ? 'user' : 'opponent';

          // Apply heavy knockback away from attacker
          const kbDx = target.x - d.x;
          const kbDy = target.y - d.y;
          const kbDist = Math.sqrt(kbDx * kbDx + kbDy * kbDy);
          if (kbDist > 0.001) {
            const kbMag = KNOCKBACK_IMPULSE * KNOCKBACK_SKILL_MULTIPLIER;
            target.knockbackVx = (kbDx / kbDist) * kbMag;
            target.knockbackVy = (kbDy / kbDist) * kbMag;
          }

          // Force target into retreat
          const targetConfig = STRATEGY_CONFIGS[target.strategy];
          if (target.state !== 'dead') {
            target.state = 'retreating';
            target.retreatTimerMs = targetConfig.fleeDuration;
          }
        }

        // Check if target died
        if (target.hp <= 0) {
          // Massively amplify knockback on the killing blow for dramatic impact
          target.knockbackVx *= KNOCKBACK_DEATH_MULTIPLIER;
          target.knockbackVy *= KNOCKBACK_DEATH_MULTIPLIER;
          target.state = 'dead';
          target.deathBounceVy = DEATH_BOUNCE_VY_INIT;
          target.deathOriginY = target.y;
          target.deathLanded = false;
          events.push({ type: 'death', digimonId: target.id });
        }

        // Attacker returns to approaching after skill
        d.state = 'approaching';
        d.spriteState = 'attacking';
        d.spriteTimerMs = ATTACK_SPRITE_MS;

        // Reset skill cooldown — SP now affects drain rate, not base value
        d.skillCooldownMs = config.skillCooldownBase + Math.random() * 3000;
      }
      // No movement while winding up
      continue;
    }

    // Priority b: enter skill_windup when skillCooldown expires
    if (d.skillCooldownMs <= 0) {
      d.state = 'skill_windup';
      d.skillWindupTimerMs = SKILL_WINDUP_MS;
      // No movement this frame — will be handled as 'skill_windup' next frame
      continue;
    }

    // Priority c: finish retreating
    if (d.state === 'retreating' && d.retreatTimerMs <= 0) {
      d.state = 'approaching';
    }

    // Priority d: normal attack
    if (
      d.state !== 'retreating' &&
      distToTarget < ATTACK_RADIUS &&
      d.attackCooldownMs <= 0
    ) {
      // ── Speed race: only one Digimon attacks at a time ─────────────────────
      // If the target is also ready to attack, use SPD probability to decide who strikes.
      let attackerWins = true;
      const targetReadyToAttack =
        target.attackCooldownMs <= 0 &&
        target.state !== 'retreating' &&
        target.state !== 'dead' &&
        target.state !== 'skill_windup';

      if (targetReadyToAttack) {
        const totalSpd = d.spd + target.spd;
        attackerWins = Math.random() < d.spd / totalSpd;
        if (!attackerWins) {
          // Loser hesitates — gives the winner time to land their hit
          d.attackCooldownMs = 350 + Math.random() * 200;
        }
      }

      if (attackerWins) {
        const calcAttacker = toCalcDigimon(d);
        const calcTarget = toCalcDigimon(target);
        const result = calculateDamage(calcAttacker, calcTarget);

        target.hp = Math.max(0, target.hp - result.damage);

        events.push({
          type: 'damage',
          attackerId: d.id,
          targetId: target.id,
          damage: result.damage,
          isCritical: result.isCritical,
          isMiss: result.isMiss,
          isSkill: false,
          targetX: target.x,
          targetY: target.y,
        });

        // Update sprites
        d.spriteState = 'attacking';
        d.spriteTimerMs = ATTACK_SPRITE_MS;

        if (!result.isMiss && result.damage > 0) {
          target.spriteState = 'hit';
          target.spriteTimerMs = HIT_SPRITE_MS;
          target.lastAttackerTeam = d.isUserTeam ? 'user' : 'opponent';

          // Apply knockback — push target away from attacker
          const kbDx = target.x - d.x;
          const kbDy = target.y - d.y;
          const kbDist = Math.sqrt(kbDx * kbDx + kbDy * kbDy);
          if (kbDist > 0.001) {
            target.knockbackVx = (kbDx / kbDist) * KNOCKBACK_IMPULSE;
            target.knockbackVy = (kbDy / kbDist) * KNOCKBACK_IMPULSE;
          }

          // Force target to retreat on a solid hit
          if (target.state !== 'dead') {
            const targetConfig = STRATEGY_CONFIGS[target.strategy];
            target.state = 'retreating';
            target.retreatTimerMs = targetConfig.fleeDuration;
          }
        }

        // Check if target died
        if (target.hp <= 0) {
          // Massively amplify knockback on the killing blow for dramatic impact
          target.knockbackVx *= KNOCKBACK_DEATH_MULTIPLIER;
          target.knockbackVy *= KNOCKBACK_DEATH_MULTIPLIER;
          target.state = 'dead';
          target.deathBounceVy = DEATH_BOUNCE_VY_INIT;
          target.deathOriginY = target.y;
          target.deathLanded = false;
          events.push({ type: 'death', digimonId: target.id });
        }

        // Attacker backs off briefly
        d.state = 'retreating';
        d.retreatTimerMs = config.fleeDuration * 0.4;
        d.attackCooldownMs = Math.max(
          500,
          config.attackCooldownBase / Math.max(d.spd / 100, 0.5),
        );
      }
    }

    // Priority e: set movement state based on distance (only if not retreating)
    if (d.state !== 'retreating') {
      d.state = distToTarget < config.orbitRadius ? 'circling' : 'approaching';
    }

    // ── Compute steering forces ───────────────────────────────────────────────
    let totalFx = 0;
    let totalFy = 0;

    const allies = digimon.filter(
      other => other.isUserTeam === d.isUserTeam && other.id !== d.id,
    );
    const allyPositions = allies.map(a => ({ x: a.x, y: a.y }));

    // Separation — always active
    const sepForce = separation(
      d.x, d.y,
      allyPositions,
      SEPARATION_RADIUS,
      BASE_FORCE * 0.8,
    );
    totalFx += sepForce.fx;
    totalFy += sepForce.fy;

    if (d.state === 'approaching') {
      const seekForce = seek(d.x, d.y, target.x, target.y, BASE_FORCE * config.seekWeight);
      totalFx += seekForce.fx;
      totalFy += seekForce.fy;

      const { force: wanderForce, newWanderAngle } = wander(
        d.x, d.y, d.vx, d.vy, d.wanderAngle, BASE_FORCE * config.wanderWeight,
      );
      d.wanderAngle = newWanderAngle;
      totalFx += wanderForce.fx;
      totalFy += wanderForce.fy;

    } else if (d.state === 'circling') {
      // Moderate seek + strong orbit + wander — closes to attack range while circling
      const seekForce = seek(d.x, d.y, target.x, target.y, BASE_FORCE * 0.35);
      totalFx += seekForce.fx;
      totalFy += seekForce.fy;

      const orbitForce = orbit(
        d.x, d.y, target.x, target.y, config.orbitRadius, BASE_FORCE * config.orbitWeight,
      );
      totalFx += orbitForce.fx;
      totalFy += orbitForce.fy;

      const { force: wanderForce, newWanderAngle } = wander(
        d.x, d.y, d.vx, d.vy, d.wanderAngle, BASE_FORCE * config.wanderWeight,
      );
      d.wanderAngle = newWanderAngle;
      totalFx += wanderForce.fx;
      totalFy += wanderForce.fy;

    } else if (d.state === 'retreating') {
      // Flee from the team that last hit us; fall back to fleeing from the target
      const fleeFrom =
        d.lastAttackerTeam !== null
          ? getTeamCentroid(digimon, d.lastAttackerTeam)
          : { x: target.x, y: target.y };

      // Flee strength linearly decays as the retreat timer runs down
      const fleeDecay = d.retreatTimerMs > 0
        ? Math.min(1, d.retreatTimerMs / config.fleeDuration)
        : 0;

      const fleeForce = flee(d.x, d.y, fleeFrom.x, fleeFrom.y, BASE_FORCE * fleeDecay);
      totalFx += fleeForce.fx;
      totalFy += fleeForce.fy;

      const { force: wanderForce, newWanderAngle } = wander(
        d.x, d.y, d.vx, d.vy, d.wanderAngle, BASE_FORCE * config.wanderWeight * 0.6,
      );
      d.wanderAngle = newWanderAngle;
      totalFx += wanderForce.fx;
      totalFy += wanderForce.fy;
    }

    // ── Apply forces → velocity → position ───────────────────────────────────
    const speedScale = config.speedMultiplier * Math.max(d.spd / 150, 0.5);
    d.vx += totalFx * deltaMs * speedScale;
    d.vy += totalFy * deltaMs * speedScale;

    // Friction / damping
    d.vx *= DAMPING;
    d.vy *= DAMPING;

    // Clamp to max speed
    const currentSpeed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
    if (currentSpeed > MAX_SPEED) {
      const scale = MAX_SPEED / currentSpeed;
      d.vx *= scale;
      d.vy *= scale;
    }

    // Update position from steering velocity
    d.x += d.vx * deltaMs;
    d.y += d.vy * deltaMs;

    // ── Knockback position update (decays independently from steering) ────────
    // Time-normalised decay: consistent feel regardless of frame rate
    const dampFactor = Math.pow(DAMPING, deltaMs / 16);
    d.knockbackVx *= dampFactor;
    d.knockbackVy *= dampFactor;
    d.x += d.knockbackVx * deltaMs;
    d.y += d.knockbackVy * deltaMs;

    // ── Clamp to world bounds ─────────────────────────────────────────────────
    d.x = Math.max(ARENA_MARGIN, Math.min(WORLD_W - ARENA_MARGIN, d.x));
    d.y = Math.max(ARENA_MARGIN, Math.min(WORLD_H - ARENA_MARGIN, d.y));
  }

  // ── Battle-end check ────────────────────────────────────────────────────────
  const userAlive = digimon.filter(d => d.isUserTeam && d.state !== 'dead').length;
  const opponentAlive = digimon.filter(d => !d.isUserTeam && d.state !== 'dead').length;

  if (userAlive === 0) {
    events.push({ type: 'battle_end', winner: 'opponent' });
  } else if (opponentAlive === 0) {
    events.push({ type: 'battle_end', winner: 'user' });
  }

  return events;
};
