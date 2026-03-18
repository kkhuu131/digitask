// ─── World / Viewport dimensions ──────────────────────────────────────────────

/** Full scrollable world size (world units). Engine logic runs in these coords. */
export const WORLD_W = 1300;
export const WORLD_H = 700;

/** Clipped viewport rendered to the user. Camera pans the world within this. */
export const VIEWPORT_W = 900;
export const VIEWPORT_H = 480;

/** Minimum distance Digimon must stay from world edges. */
export const ARENA_MARGIN = 40;

// ─── Combat constants ──────────────────────────────────────────────────────────

/** Distance (world units) at which a Digimon can land a normal attack. */
export const ATTACK_RADIUS = 55;

/** Maximum distance (world units) at which a Digimon may begin a skill windup.
 *  Beyond this range the skill cooldown simply waits — the Digimon must close in first. */
export const SKILL_RANGE = 200;

/** Duration (ms) of the skill charge-up before damage fires. */
export const SKILL_WINDUP_MS = 700;

/** Skill damage multiplier over a normal attack. */
export const SKILL_DAMAGE_MULTIPLIER = 2.5;

/** Duration (ms) the attacking sprite is shown before reverting to idle. */
export const ATTACK_SPRITE_MS = 400;

/** Duration (ms) the hit sprite is shown after taking damage. */
export const HIT_SPRITE_MS = 300;

// ─── Physics constants ─────────────────────────────────────────────────────────

/** Radius (world units) within which allied Digimon repel each other. */
export const SEPARATION_RADIUS = 68;

/** Base force magnitude applied to velocity each frame (world units / ms²). */
export const BASE_FORCE = 0.006;

/** Velocity damping factor applied each frame (0 = instant stop, 1 = no friction). */
export const DAMPING = 0.88;

/** Maximum velocity (world units / ms). Prevents runaway acceleration. */
export const MAX_SPEED = 0.5;

/** Impulse magnitude applied to a Digimon's knockback velocity on a normal hit. */
export const KNOCKBACK_IMPULSE = 0.8;

/** Knockback impulse multiplier for skill hits (larger push). */
export const KNOCKBACK_SKILL_MULTIPLIER = 2.2;

/** Additional knockback multiplier applied when the hit kills the target. */
export const KNOCKBACK_DEATH_MULTIPLIER = 6;

// ─── Death bounce constants ────────────────────────────────────────────────────

/** Initial upward velocity on death (world units / ms, negative = up). */
export const DEATH_BOUNCE_VY_INIT = -0.28;

/** Gravity pulling the Digimon back down after the death bounce (world units / ms²). */
export const DEATH_GRAVITY = 0.001;

// ─── Strategy ──────────────────────────────────────────────────────────────────

export type Strategy = 'aggressive' | 'balanced' | 'defensive';

export interface StrategyConfig {
  /** Overall movement speed multiplier. */
  speedMultiplier: number;
  /** Base ms between normal attacks. */
  attackCooldownBase: number;
  /** Base ms between skill uses (reduced by sp stat). */
  skillCooldownBase: number;
  /** World-unit radius at which the Digimon begins orbiting instead of charging. */
  orbitRadius: number;
  /** Duration (ms) of the retreat after being hit. */
  fleeDuration: number;
  /** Base duration (ms) of the wandering/recovery phase after retreat. +0–2000ms random. */
  wanderDurationBase: number;
  /** Force weight for seek behaviour. */
  seekWeight: number;
  /** Force weight for orbit behaviour. */
  orbitWeight: number;
  /** Force weight for wander behaviour. */
  wanderWeight: number;
}

export const STRATEGY_CONFIGS: Record<Strategy, StrategyConfig> = {
  aggressive: {
    speedMultiplier: 1.35,
    attackCooldownBase: 2800,   // noticeably spaced attacks
    skillCooldownBase: 12000,
    orbitRadius: 65,            // closes in quickly before circling
    fleeDuration: 900,          // retreats firmly after a hit
    wanderDurationBase: 1200,   // brief recovery before charging again
    seekWeight: 1.05,
    orbitWeight: 0.25,
    wanderWeight: 0.18,
  },
  balanced: {
    speedMultiplier: 1.0,
    attackCooldownBase: 4000,   // clear rhythm between attacks
    skillCooldownBase: 13000,
    orbitRadius: 110,
    fleeDuration: 1400,
    wanderDurationBase: 2000,   // decent recovery gap
    seekWeight: 0.75,
    orbitWeight: 0.75,
    wanderWeight: 0.28,
  },
  defensive: {
    speedMultiplier: 0.82,
    attackCooldownBase: 5500,   // deliberate, patient
    skillCooldownBase: 15000,
    orbitRadius: 145,
    fleeDuration: 2000,
    wanderDurationBase: 3000,   // long recovery — very patient re-engagement
    seekWeight: 0.55,
    orbitWeight: 0.9,
    wanderWeight: 0.38,
  },
};

// ─── Arena Digimon state machine ───────────────────────────────────────────────

export type ArenaDigimonState =
  | 'approaching'   // moving toward the nearest enemy
  | 'circling'      // within orbit radius — looping around before closing in
  | 'attacking'     // brief lock while the attack animation plays
  | 'retreating'    // fleeing after landing a hit or taking damage
  | 'wandering'     // idle recovery phase between retreat and next approach
  | 'skill_windup'  // charging up the skill — no movement
  | 'dead';         // out of HP — playing death bounce then frozen

export type SpriteState = 'idle' | 'attacking' | 'hit' | 'dead';

// ─── ArenaDigimon ──────────────────────────────────────────────────────────────

/**
 * The live game-state record for a single Digimon in the arena.
 * Lives in a React ref (not state) and is mutated directly by the engine each frame.
 */
export interface ArenaDigimon {
  // Identity
  id: string;
  name: string;
  digimon_name: string;
  sprite_url: string;
  /** DigimonType string — fed directly into calculateDamage type matchup. */
  type: string;
  /** DigimonAttribute string — fed directly into calculateDamage attribute matchup. */
  attribute: string;
  isUserTeam: boolean;

  // Physics (world units)
  x: number;
  y: number;
  /** Horizontal velocity (world units / ms). */
  vx: number;
  /** Vertical velocity (world units / ms). */
  vy: number;
  /** Knockback horizontal velocity — decays independently from steering velocity. */
  knockbackVx: number;
  /** Knockback vertical velocity — decays independently from steering velocity. */
  knockbackVy: number;

  // Combat stats — mirrors BattleDigimon.stats fields for calculateDamage adapter
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
  sp: number;

  // State machine
  state: ArenaDigimonState;
  /** ms remaining before next normal attack is allowed. */
  attackCooldownMs: number;
  /** ms remaining before skill fires (enters skill_windup when this hits 0). */
  skillCooldownMs: number;
  /** ms remaining in retreat state. */
  retreatTimerMs: number;
  /** ms remaining in wandering (recovery) state before re-engaging. */
  wanderTimerMs: number;
  /** ms remaining in hit-stun — no steering forces applied, Digimon slides on knockback only. */
  stunTimerMs: number;
  /** ms remaining in skill_windup state. Fires skill when this hits 0. */
  skillWindupTimerMs: number;

  // Death animation
  /** Vertical velocity during the death bounce. Set to DEATH_BOUNCE_VY_INIT on death. */
  deathBounceVy: number;
  /** Y position at the moment of death — the Digimon lands back here. */
  deathOriginY: number;
  /** True once the bounce has settled. Engine stops updating position. */
  deathLanded: boolean;

  // Steering
  /** Current wander angle offset in radians. Jittered each frame. */
  wanderAngle: number;
  currentTargetId: string | null;
  /** Which team last attacked this Digimon — used to determine flee direction. */
  lastAttackerTeam: 'user' | 'opponent' | null;

  // Strategy
  strategy: Strategy;

  // Sprite state — mutated by engine, consumed by React renderer
  spriteState: SpriteState;
  /** ms remaining before spriteState reverts to 'idle'. 0 means no active timer. */
  spriteTimerMs: number;
}

// ─── Events ────────────────────────────────────────────────────────────────────

/**
 * Discrete events emitted by runFrame each tick.
 * The React component consumes these to update HP bars, trigger Framer Motion effects,
 * and detect battle completion — without needing to read the full digimon ref each frame.
 */
export type ArenaEvent =
  | {
      type: 'damage';
      attackerId: string;
      targetId: string;
      damage: number;
      isCritical: boolean;
      isMiss: boolean;
      /** True when this is a skill hit (2.5× multiplier applied). */
      isSkill: boolean;
      /** World-space X of the target — for positioning damage number effects. */
      targetX: number;
      /** World-space Y of the target — for positioning damage number effects. */
      targetY: number;
    }
  | { type: 'death'; digimonId: string }
  | { type: 'battle_end'; winner: 'user' | 'opponent' };

// ─── Utility ───────────────────────────────────────────────────────────────────

/** Lightweight force vector returned by all steering behaviour functions. */
export interface Force {
  fx: number;
  fy: number;
}
