import { TOURNAMENT_TEAM_POOL } from '../../constants/tournamentBossTeams';
import { describe, expect, it, vi } from 'vitest';
import {
  pickTournamentOpponent,
  createTournamentDraw,
  TOURNAMENT_MATCHING_POOL,
  TOURNAMENT_POWER_MULTIPLIERS,
} from '../../utils/tournamentMatching';
import { calculateBaseDigimonPowerRating } from '../../utils/digimonStatCalculation';
import { DIGIMON_LOOKUP_TABLE } from '../../constants/digimonLookup';
import { getTournamentMatches } from '../../utils/tournamentBracket';
import type { UserTournament, RoundResult } from '../../types/tournament';

const power = (team: ReturnType<typeof pickTournamentOpponent>['team']) =>
  team.reduce(
    (sum, pet) =>
      sum +
      calculateBaseDigimonPowerRating(DIGIMON_LOOKUP_TABLE[pet.digimon_id], pet.current_level),
    0
  );
describe('tournament matching', () => {
  it.each([600, 1500, 3000, 100000])(
    'draws seven unique names and compositions at power %i',
    (total) => {
      const draw = createTournamentDraw();
      const favorite = pickTournamentOpponent(total, 'hard', draw, true);
      const teams = [
        favorite,
        ...Array.from({ length: 6 }, (_, index) =>
          pickTournamentOpponent(total, index % 2 ? 'medium' : 'easy', draw)
        ),
      ];
      expect(draw.names.size).toBe(7);
      expect(draw.compositions.size).toBe(7);
      expect(new Set(teams.map((team) => team.display_name)).size).toBe(7);
      if (total <= 3000) {
        expect(power(favorite.team)).toBeGreaterThan(
          Math.max(...teams.slice(1).map((team) => power(team.team)))
        );
        teams.forEach((team) =>
          expect(new Set(team.team.map((member) => member.digimon_id)).size).toBeGreaterThan(0)
        );
      }
    }
  );
  it('prefers matching presets before using generated squads', () => {
    const draw = createTournamentDraw();
    const presets = new Set(TOURNAMENT_TEAM_POOL.map((team) => team.name));
    expect(presets.has(pickTournamentOpponent(1500, 'medium', draw).display_name)).toBe(true);
    TOURNAMENT_TEAM_POOL.forEach((team) => draw.names.add(team.name));
    const fallback = pickTournamentOpponent(1500, 'medium', draw);
    expect(fallback.display_name).toMatch(/^[A-Za-z]+ Squad$/);
    expect(Math.abs(power(fallback.team) - 1500) / 1500).toBeLessThanOrEqual(0.05);
  });
  it('uses the strongest attainable template when the target exceeds catalog power', () => {
    const maximum = Math.max(
      ...TOURNAMENT_MATCHING_POOL.map((template) =>
        template.digimon.reduce(
          (sum, pet) =>
            sum + calculateBaseDigimonPowerRating(DIGIMON_LOOKUP_TABLE[pet.digimon_id], 99),
          0
        )
      )
    );
    expect(power(pickTournamentOpponent(100000, 'hard').team)).toBe(maximum);
  });
  it.each([600, 900, 1500, 2100, 3000])(
    'matches total team power %i across all rounds and varied templates',
    (total) => {
      const random = vi.spyOn(Math, 'random');
      try {
        for (const difficulty of ['easy', 'medium', 'hard'] as const)
          for (const roll of [0, 0.25, 0.5, 0.75, 0.99]) {
            random.mockReturnValue(roll);
            const opponent = pickTournamentOpponent(total, difficulty);
            const target = total * TOURNAMENT_POWER_MULTIPLIERS[difficulty];
            expect(Math.abs(power(opponent.team) - target) / target).toBeLessThanOrEqual(0.05);
            expect(
              opponent.team.every((pet) => pet.current_level >= 1 && pet.current_level <= 99)
            ).toBe(true);
          }
      } finally {
        random.mockRestore();
      }
    }
  );
});

describe('tournament bracket progression', () => {
  const tournament = {
    bracket: {
      rounds: {
        '1': { opponent: { display_name: 'Quarter opponent', team: [] } },
        '2': { opponent: { display_name: 'Semi opponent', team: [] } },
        '3': { opponent: { display_name: 'Final opponent', team: [] } },
      },
      visual_bracket: {
        slots: Array.from({ length: 8 }, (_, i) => ({
          slot: i + 1,
          name: `Team ${i + 1}`,
          team: [],
        })),
      },
    },
  } as unknown as UserTournament;
  const win = (round: number): RoundResult => ({ round, result: 'win', placement_bits: 0 });
  it('leaves future matches undecided before any results', () => {
    const rounds = getTournamentMatches(tournament, []);
    expect(rounds[0].every((match) => !match.winner)).toBe(true);
    expect(rounds[1].every((match) => match.teams.every((team) => !team))).toBe(true);
  });
  it('advances all four quarterfinal winners after the first result', () => {
    const rounds = getTournamentMatches(tournament, [win(1)]);
    expect(rounds[0].map((match) => match.winner?.slot)).toEqual([1, 4, 5, 8]);
    expect(rounds[1].map((match) => match.teams.map((team) => team?.slot))).toEqual([
      [1, 4],
      [5, 8],
    ]);
    expect(rounds[1].every((match) => !match.winner)).toBe(true);
  });
  it('advances both finalists after the semifinal and records the champion', () => {
    const rounds = getTournamentMatches(tournament, [win(1), win(2), win(3)]);
    expect(rounds[1].map((match) => match.winner?.slot)).toEqual([1, 8]);
    expect(rounds[2][0].teams.map((team) => team?.slot)).toEqual([1, 8]);
    expect(rounds[2][0].winner?.slot).toBe(1);
    expect(
      getTournamentMatches(tournament, [win(1), win(2), { ...win(3), result: 'loss' }])[2][0].winner
        ?.slot
    ).toBe(8);
  });
  it('does not invent later results after the user is eliminated', () => {
    const rounds = getTournamentMatches(tournament, [{ ...win(1), result: 'loss' }]);
    expect(rounds[0][0].winner?.slot).toBe(2);
    expect(rounds[1][0].teams[0]?.slot).toBe(2);
    expect(rounds[1].every((match) => !match.winner)).toBe(true);
  });
});
