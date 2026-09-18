import type { BracketSlot, RoundResult, UserTournament } from '../types/tournament';
import { calculateBaseDigimonPowerRating } from './digimonStatCalculation';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';

/** CPU results follow the saved opponent path; filler results are stable across reloads. */
export function getTournamentMatches(tournament: UserTournament | null, results: RoundResult[]) {
  const slots = tournament?.bracket.visual_bracket.slots ?? [];
  const slot = (number: number): BracketSlot => {
    const saved = slots.find((item) => item.slot === number);
    const round = ({ 2: '1', 4: '2', 8: '3' } as const)[number as 2 | 4 | 8];
    const opponent = round ? tournament?.bracket.rounds[round]?.opponent : undefined;
    return {
      ...saved,
      slot: number,
      name: opponent?.display_name ?? saved?.name ?? '???',
      team: opponent?.team ?? saved?.team ?? [],
      is_user: number === 1,
      is_boss: number === 8,
    };
  };
  const power = (team: BracketSlot) =>
    (team.team ?? []).reduce((sum, member) => {
      const species = DIGIMON_LOOKUP_TABLE[member.digimon_id];
      return sum + (species ? calculateBaseDigimonPowerRating(species, member.current_level) : 0);
    }, 0);
  const otherWinner = power(slot(5)) >= power(slot(6)) ? slot(5) : slot(6);
  const completed = (round: number) => results.some((result) => result.round === round);
  const userWinner = (round: number, first: BracketSlot, second: BracketSlot) =>
    results.find((result) => result.round === round)?.result === 'win' ? first : second;
  const qfWinner = completed(1) ? userWinner(1, slot(1), slot(2)) : undefined;
  const sfWinner = completed(2) ? userWinner(2, qfWinner ?? slot(1), slot(4)) : undefined;
  return [
    [
      { teams: [slot(1), slot(2)], winner: qfWinner },
      { teams: [slot(3), slot(4)], winner: completed(1) ? slot(4) : undefined },
      { teams: [slot(5), slot(6)], winner: completed(1) ? otherWinner : undefined },
      { teams: [slot(7), slot(8)], winner: completed(1) ? slot(8) : undefined },
    ],
    [
      { teams: [qfWinner, completed(1) ? slot(4) : undefined], winner: sfWinner },
      {
        teams: [completed(1) ? otherWinner : undefined, completed(1) ? slot(8) : undefined],
        winner: completed(2) ? slot(8) : undefined,
      },
    ],
    [
      {
        teams: [sfWinner, completed(2) ? slot(8) : undefined],
        winner: completed(3) ? userWinner(3, sfWinner ?? slot(1), slot(8)) : undefined,
      },
    ],
  ];
}
