import { describe, expect, it, vi } from 'vitest';
import { simulateArena, createReplayPlayer, ARENA_TIME_LIMIT_MS } from '../../engine/arenaReplay';
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
    expect(replay.frames.length).toBeLessThanOrEqual(1875);
    expect(replay.frames.at(-1)!.e).toContainEqual({ type: 'battle_end', winner: replay.winner });
  });
});
