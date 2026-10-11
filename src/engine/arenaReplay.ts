import {
  initArenaDigimon,
  runFrame,
  CURRENT_TECHNIQUE_RULES,
  PREVIOUS_TECHNIQUE_RULES,
  type ArenaEngineMode,
} from './arenaEngine';
import { DEFAULT_BATTLE_SP_CAPACITY } from './battleSp';
import type { ArenaDigimon, ArenaEvent, Strategy } from './arenaTypes';
import type { BattleDigimon } from '../types/battle';

export const ARENA_ENGINE_VERSION = 3;
export const PREVIOUS_ARENA_ENGINE_VERSION = 2;
export const LEGACY_ARENA_ENGINE_VERSION = 1;
export const ARENA_STEP_MS = 16;
export const ARENA_TIME_LIMIT_MS = 120_000;
const SAMPLE_INTERVAL = 4;

export const ARENA_REPLAY_V1_FIELDS = [
  'x',
  'y',
  'vx',
  'vy',
  'hp',
  'state',
  'spriteState',
  'skillCooldownMs',
  'skillWindupTimerMs',
  'currentTargetId',
] as const satisfies readonly (keyof ArenaDigimon)[];

export const ARENA_REPLAY_V2_FIELDS = [
  ...ARENA_REPLAY_V1_FIELDS,
  'battleSp',
  'battleSpCapacity',
  'desiredTechniqueId',
  'techniqueRecoveryMs',
  'activeTechniqueEffectId',
] as const satisfies readonly (keyof ArenaDigimon)[];

type SampleValue = number | string | boolean | null;
type Sample = SampleValue[];
interface ReplayFrame {
  t: number;
  s: Sample[];
  e: ArenaEvent[];
}

interface ArenaReplayBase {
  engineVersion: number;
  seed: number;
  initial: ArenaDigimon[];
  frames: ReplayFrame[];
  durationMs: number;
  winner: 'user' | 'opponent';
  reason: 'knockout' | 'time_limit';
}
export interface ArenaReplayV1 extends ArenaReplayBase {
  version: 1;
}
export interface ArenaReplayV2 extends ArenaReplayBase {
  version: 2;
  fieldSchema: typeof ARENA_REPLAY_V2_FIELDS;
}
export type ArenaReplay = ArenaReplayV1 | ArenaReplayV2;

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate(
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  strategies: Strategy[],
  seed: number,
  mode: ArenaEngineMode,
  engineVersion: number
): ArenaReplay {
  const isV2 = mode === 'techniques';
  const fields = isV2 ? ARENA_REPLAY_V2_FIELDS : ARENA_REPLAY_V1_FIELDS;
  const random = seededRandom(seed);
  const state = initArenaDigimon(userTeam, opponentTeam, strategies, undefined, random, mode);
  const initial = structuredClone(state);
  const frames: ReplayFrame[] = [];
  let events: ArenaEvent[] = [];
  let winner: ArenaReplay['winner'] | undefined;
  let reason: ArenaReplay['reason'] = 'knockout';
  let t = 0;
  for (let tick = 1; !winner && t < ARENA_TIME_LIMIT_MS; tick += 1) {
    t = tick * ARENA_STEP_MS;
    const emitted = runFrame(
      state,
      ARENA_STEP_MS,
      random,
      mode,
      t,
      engineVersion === PREVIOUS_ARENA_ENGINE_VERSION
        ? PREVIOUS_TECHNIQUE_RULES
        : CURRENT_TECHNIQUE_RULES
    );
    events.push(...emitted);
    const end = emitted.find((event) => event.type === 'battle_end');
    if (end?.type === 'battle_end') winner = end.winner;
    if (!winner && t >= ARENA_TIME_LIMIT_MS) {
      const health = (isUser: boolean) => {
        const team = state.filter((d) => d.isUserTeam === isUser);
        return team.reduce((sum, d) => sum + d.hp, 0) / team.reduce((sum, d) => sum + d.maxHp, 0);
      };
      winner = health(true) > health(false) ? 'user' : 'opponent';
      reason = 'time_limit';
      events.push({ type: 'battle_end', winner });
    }
    if (tick % SAMPLE_INTERVAL === 0 || winner || (isV2 && emitted.length > 0)) {
      frames.push({
        t,
        s: state.map((d) =>
          fields.map((field) => {
            const value = d[field];
            return typeof value === 'number' ? Math.round(value * 1000) / 1000 : value;
          })
        ),
        e: events,
      });
      events = [];
    }
  }
  const common = { seed, initial, frames, durationMs: t, winner: winner!, reason };
  return isV2
    ? {
        version: 2,
        engineVersion,
        fieldSchema: ARENA_REPLAY_V2_FIELDS,
        ...common,
      }
    : { version: 1, engineVersion: LEGACY_ARENA_ENGINE_VERSION, ...common };
}

export function simulateArenaV1(
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  strategies: Strategy[],
  seed: number
): ArenaReplayV1 {
  return simulate(
    userTeam,
    opponentTeam,
    strategies,
    seed,
    'legacy',
    LEGACY_ARENA_ENGINE_VERSION
  ) as ArenaReplayV1;
}

/** Resume already-prepared version 2 requests with their original charging rules. */
export function simulateArenaV2(
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  strategies: Strategy[],
  seed: number
): ArenaReplayV2 {
  return simulate(
    userTeam,
    opponentTeam,
    strategies,
    seed,
    'techniques',
    PREVIOUS_ARENA_ENGINE_VERSION
  ) as ArenaReplayV2;
}

export function simulateArena(
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  strategies: Strategy[],
  seed: number
): ArenaReplayV2 {
  return simulate(
    userTeam,
    opponentTeam,
    strategies,
    seed,
    'techniques',
    ARENA_ENGINE_VERSION
  ) as ArenaReplayV2;
}

function hydrateReplayState(replay: ArenaReplay): ArenaDigimon[] {
  return structuredClone(replay.initial).map((digimon) => ({
    ...digimon,
    battleSp: Number.isFinite(digimon.battleSp) ? digimon.battleSp : 0,
    battleSpCapacity: Number.isFinite(digimon.battleSpCapacity)
      ? digimon.battleSpCapacity
      : DEFAULT_BATTLE_SP_CAPACITY,
    desiredTechniqueId: digimon.desiredTechniqueId ?? 'impact-strike',
    techniqueRecoveryMs: Number.isFinite(digimon.techniqueRecoveryMs)
      ? digimon.techniqueRecoveryMs
      : 0,
    techniqueUseCount: Number.isFinite(digimon.techniqueUseCount) ? digimon.techniqueUseCount : 0,
    activeTechniqueEffectId: digimon.activeTechniqueEffectId ?? null,
  }));
}

/** Replays recorded states, independent of current combat rules or randomness. */
export function createReplayPlayer(replay: ArenaReplay) {
  if (replay.version !== 1 && replay.version !== 2) throw new Error('Unsupported replay format');
  const fields = replay.version === 2 ? ARENA_REPLAY_V2_FIELDS : ARENA_REPLAY_V1_FIELDS;
  const state = hydrateReplayState(replay);
  let elapsed = 0;
  let index = -1;
  return {
    state,
    advance(deltaMs: number): ArenaEvent[] {
      elapsed = Math.min(replay.durationMs, elapsed + Math.max(0, deltaMs));
      const events: ArenaEvent[] = [];
      while (index + 1 < replay.frames.length && replay.frames[index + 1].t <= elapsed) {
        const frame = replay.frames[++index];
        state.forEach((d, i) =>
          fields.forEach((field, j) => {
            Object.assign(d, { [field]: frame.s[i][j] });
          })
        );
        events.push(...frame.e);
      }
      const previous = index >= 0 ? replay.frames[index] : null;
      const next = replay.frames[index + 1];
      if (next) {
        const start = previous?.t ?? 0;
        const fraction = (elapsed - start) / (next.t - start);
        state.forEach((d, i) => {
          const x = previous ? Number(previous.s[i][0]) : replay.initial[i].x;
          const y = previous ? Number(previous.s[i][1]) : replay.initial[i].y;
          d.x = x + (Number(next.s[i][0]) - x) * fraction;
          d.y = y + (Number(next.s[i][1]) - y) * fraction;
          if (replay.version === 2) {
            const spIndex = ARENA_REPLAY_V2_FIELDS.indexOf('battleSp');
            const previousSp = previous
              ? Number(previous.s[i][spIndex])
              : replay.initial[i].battleSp;
            const nextSp = Number(next.s[i][spIndex]);
            const commitsAtNextFrame = next.e.some(
              (event) => event.type === 'technique_commit' && event.attackerId === d.id
            );
            d.battleSp = commitsAtNextFrame
              ? previousSp
              : previousSp + (nextSp - previousSp) * fraction;
          }
        });
      }
      return events;
    },
  };
}
