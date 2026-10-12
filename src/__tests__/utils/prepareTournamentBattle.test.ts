import { describe, expect, it } from 'vitest';
import { ARENA_ENGINE_VERSION, createReplayPlayer, simulateArena } from '../../engine/arenaReplay';
import { DIGIMON_LOOKUP_TABLE } from '../../constants/digimonLookup';
import type { UserDigimon } from '../../store/petStore';
import { convertToBattleDigimon } from '../../utils/convertToBattleDigimon';
import { prepareTournamentBattle } from '../../utils/prepareTournamentBattle';

describe('tournament combat consistency', () => {
  it('uses the current daily arena rules and recording for the selected party and bracket opponent', () => {
    const selectedTeam = [18, 23].map((digimon_id, index) => ({
      id: `user-${index}`,
      digimon_id,
      current_level: 25,
      hp_bonus: 8,
      atk_bonus: 4,
      sp_bonus: 0,
      def_bonus: 0,
      int_bonus: 0,
      spd_bonus: 0,
      personality: 'Fighter',
    })) as UserDigimon[];
    const opponentTeam = [23, 24, 18].map((digimon_id, index) => {
      const species = DIGIMON_LOOKUP_TABLE[digimon_id];
      return {
        id: `opponent-${index}`,
        digimon_id,
        name: species.name,
        current_level: 25,
        sprite_url: species.sprite_url,
        type: species.type,
        attribute: species.attribute,
      };
    });
    const original = structuredClone({ selectedTeam, opponentTeam });
    const battle = prepareTournamentBattle(selectedTeam, opponentTeam, 1234);
    const dailyArenaReplay = simulateArena(
      selectedTeam.map((digimon) => convertToBattleDigimon(digimon, true)),
      opponentTeam.map((digimon) => convertToBattleDigimon(digimon, false)),
      ['balanced', 'balanced'],
      1234
    );

    expect(battle.replay).toEqual(dailyArenaReplay);
    expect(battle.replay).toMatchObject({ version: 2, engineVersion: ARENA_ENGINE_VERSION });
    expect(battle.replay.initial.every((fighter) => fighter.strategy === 'balanced')).toBe(true);
    expect(battle.replay.frames.flatMap((frame) => frame.e)).toContainEqual(
      expect.objectContaining({ type: 'technique_start' })
    );
    expect({ selectedTeam, opponentTeam }).toEqual(original);

    // Watching at a different speed/frame rate cannot change the tournament result.
    for (const frameMs of [16, 1000]) {
      const player = createReplayPlayer(battle.replay);
      const events = [];
      for (let elapsed = 0; elapsed < battle.replay.durationMs; elapsed += frameMs)
        events.push(...player.advance(frameMs));
      expect(events).toEqual(battle.replay.frames.flatMap((frame) => frame.e));
      expect(events.at(-1)).toEqual({ type: 'battle_end', winner: battle.replay.winner });
    }
  });
});
