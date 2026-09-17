import { initArenaDigimon, runFrame } from './arenaEngine';
import type { ArenaDigimon, ArenaEvent, Strategy } from './arenaTypes';
import type { BattleDigimon } from '../types/battle';

export const ARENA_ENGINE_VERSION = 1;
export const ARENA_STEP_MS = 16;
export const ARENA_TIME_LIMIT_MS = 120_000;
const SAMPLE_INTERVAL = 4;
// Only fields consumed by presentation need to be retained for playback.
const fields = [
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
type Sample = (number | string | boolean | null)[];
export interface ArenaReplay {
  version: 1;
  engineVersion: number;
  seed: number;
  initial: ArenaDigimon[];
  frames: { t: number; s: Sample[]; e: ArenaEvent[] }[];
  durationMs: number;
  winner: 'user' | 'opponent';
  reason: 'knockout' | 'time_limit';
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateArena(
  userTeam: BattleDigimon[],
  opponentTeam: BattleDigimon[],
  strategies: Strategy[],
  seed: number
): ArenaReplay {
  const random = seededRandom(seed);
  const state = initArenaDigimon(userTeam, opponentTeam, strategies, undefined, random);
  const initial = structuredClone(state);
  const frames: ArenaReplay['frames'] = [];
  let events: ArenaEvent[] = [];
  let winner: ArenaReplay['winner'] | undefined;
  let reason: ArenaReplay['reason'] = 'knockout';
  let t = 0;
  for (let tick = 1; !winner && t < ARENA_TIME_LIMIT_MS; tick++) {
    t = tick * ARENA_STEP_MS;
    const emitted = runFrame(state, ARENA_STEP_MS, random);
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
    if (tick % SAMPLE_INTERVAL === 0 || winner) {
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
  return {
    version: 1,
    engineVersion: ARENA_ENGINE_VERSION,
    seed,
    initial,
    frames,
    durationMs: t,
    winner: winner!,
    reason,
  };
}

/** Replays recorded states, independent of current combat rules or randomness. */
export function createReplayPlayer(replay: ArenaReplay) {
  if (replay.version !== 1) throw new Error('Unsupported replay format');
  const state = structuredClone(replay.initial);
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
        });
      }
      return events;
    },
  };
}
