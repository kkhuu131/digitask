import { describe, expect, it, vi } from 'vitest';
import {
  simulateArena,
  simulateArenaV1,
  simulateArenaV2,
  createReplayPlayer,
  seededRandom,
  ARENA_TIME_LIMIT_MS,
} from '../../engine/arenaReplay';
import {
  initArenaDigimon,
  runFrame,
  CURRENT_TECHNIQUE_RULES,
  PREVIOUS_TECHNIQUE_RULES,
} from '../../engine/arenaEngine';
import { convertToBattleDigimon } from '../../utils/convertToBattleDigimon';
import type { ArenaEvent } from '../../engine/arenaTypes';

const team = (isUser: boolean) =>
  [18, 23, 24].map((id, index) =>
    convertToBattleDigimon(
      {
        id: `${isUser ? 'user' : 'opponent'}-${index}`,
        digimon_id: id,
        current_level: 25,
        hp_bonus: 0,
        atk_bonus: 0,
        def_bonus: 0,
        int_bonus: 0,
        sp_bonus: 0,
        spd_bonus: 0,
      },
      isUser
    )
  );

describe('saved arena simulation and playback', () => {
  it('finishes simultaneous committed skills on time while preserving engine-2 hit-stun', () => {
    for (const rules of [CURRENT_TECHNIQUE_RULES, PREVIOUS_TECHNIQUE_RULES]) {
      const state = initArenaDigimon(
        team(true).slice(0, 1),
        team(false).slice(0, 1),
        ['balanced'],
        ['balanced'],
        () => 0.5,
        'techniques'
      );
      state.forEach((actor, index) => {
        actor.x = 600 + index * 50;
        actor.y = 350;
        actor.hp = actor.maxHp = 100000;
        actor.battleSp = 80;
        actor.desiredTechniqueId = 'ember-burst';
      });
      const events: ArenaEvent[] = [];
      for (let t = 16; t <= 736; t += 16)
        events.push(...runFrame(state, 16, () => 0.5, 'techniques', t, rules));
      const hits = events.filter((event) => event.type === 'technique_hit');
      expect(events.filter((event) => event.type === 'technique_start')).toHaveLength(2);
      expect(hits).toHaveLength(rules === CURRENT_TECHNIQUE_RULES ? 2 : 1);
      expect(hits.every((event) => event.atMs === 736)).toBe(true);
    }
  });
  it('preserves old prepared requests and recorded playback while new SP gain is one-third', () => {
    const strategies = ['balanced', 'balanced', 'balanced'] as const;
    const previous = simulateArenaV2(team(true), team(false), [...strategies], 21);
    const current = simulateArena(team(true), team(false), [...strategies], 21);
    expect(previous).toMatchObject({ version: 2, engineVersion: 2 });
    expect(current).toMatchObject({ version: 2, engineVersion: 3 });
    const spIndex = current.fieldSchema.indexOf('battleSp');
    expect(current.frames[0].s[0][spIndex] as number).toBeCloseTo(
      (previous.frames[0].s[0][spIndex] as number) / 3,
      2
    );
    const player = createReplayPlayer(previous);
    expect(player.advance(previous.durationMs)).toEqual(
      previous.frames.flatMap((frame) => frame.e)
    );
  });
  it('reproduces the entire battle from its seed without ambient randomness', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Unseeded combat randomness');
    });
    try {
      const first = simulateArena(
        team(true),
        team(false),
        ['aggressive', 'balanced', 'defensive'],
        1234
      );
      const second = simulateArena(
        team(true),
        team(false),
        ['aggressive', 'balanced', 'defensive'],
        1234
      );
      expect(second).toEqual(first);
      expect(first.frames.at(-1)?.e).toContainEqual({ type: 'battle_end', winner: first.winner });
    } finally {
      random.mockRestore();
    }
  });
  it('different seeds produce different combat paths', () => {
    const first = simulateArena(team(true), team(false), ['balanced', 'balanced', 'balanced'], 1);
    const second = simulateArena(team(true), team(false), ['balanced', 'balanced', 'balanced'], 2);
    expect(first.frames).not.toEqual(second.frames);
  });
  it('spends battle SP once and emits a stable semantic technique sequence', () => {
    const random = seededRandom(7);
    const state = initArenaDigimon(
      team(true).slice(0, 1),
      team(false).slice(0, 1),
      ['balanced'],
      ['balanced'],
      random,
      'techniques'
    );
    state[0].x = 600;
    state[0].y = 350;
    state[1].x = 650;
    state[1].y = 350;
    state[0].battleSp = 80;
    const events = runFrame(state, 16, random, 'techniques', 16);
    const start = events.find((event) => event.type === 'technique_start');
    expect(start).toMatchObject({
      type: 'technique_start',
      visualVersion: 1,
      windupMs: expect.any(Number),
    });
    if (start?.type !== 'technique_start') throw new Error('Expected a technique start');
    expect(state[0].battleSp).toBeLessThan(1);
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'technique_commit',
        effectInstanceId: start.effectInstanceId,
      })
    );
    for (let tick = 2; tick < 80; tick += 1) {
      events.push(...runFrame(state, 16, random, 'techniques', tick * 16));
    }
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'technique_hit',
          effectInstanceId: start.effectInstanceId,
        }),
        expect.objectContaining({
          type: 'technique_end',
          effectInstanceId: start.effectInstanceId,
        }),
      ])
    );
  });
  it('keeps legacy replay generation and playback available', () => {
    const replay = simulateArenaV1(
      team(true),
      team(false),
      ['balanced', 'balanced', 'balanced'],
      21
    );
    expect(replay.version).toBe(1);
    const player = createReplayPlayer(JSON.parse(JSON.stringify(replay)));
    expect(() => player.advance(replay.durationMs)).not.toThrow();
  });
  it('replays identical events and final health at different animation frame rates', () => {
    const replay = simulateArena(
      team(true),
      team(false),
      ['balanced', 'aggressive', 'defensive'],
      42
    );
    const source = structuredClone(replay);
    for (const frameMs of [7, 16, 50, 1000]) {
      const player = createReplayPlayer(JSON.parse(JSON.stringify(replay)));
      const events: ArenaEvent[] = [];
      for (let t = 0; t < replay.durationMs; t += frameMs) events.push(...player.advance(frameMs));
      expect(events).toEqual(replay.frames.flatMap((frame) => frame.e));
      expect(player.state.map((d) => d.hp)).toEqual(replay.frames.at(-1)!.s.map((s) => s[4]));
      expect(player.advance(1000)).toEqual([]);
    }
    expect(replay).toEqual(source);
  });
  it('bounds a stalemate and records its time-limit result', () => {
    const user = team(true);
    const opponent = team(false);
    [...user, ...opponent].forEach((d) => {
      d.stats.hp = 1e12;
      d.stats.max_hp = 1e12;
    });
    const before = performance.now();
    const replay = simulateArena(user, opponent, ['balanced', 'balanced', 'balanced'], 99);
    console.info(
      `Worst-case 120-second simulation: ${Math.round(performance.now() - before)}ms; replay ${Math.round(JSON.stringify(replay).length / 1024)}KiB`
    );
    expect(replay.durationMs).toBe(ARENA_TIME_LIMIT_MS);
    expect(replay.reason).toBe('time_limit');
    expect(replay.frames.length).toBeLessThanOrEqual(4000);
    expect(replay.frames.at(-1)!.e).toContainEqual({ type: 'battle_end', winner: replay.winner });
  });
});
