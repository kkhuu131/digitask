import type { UserTournament } from '../types/tournament';

/** Historical final placements also work for older entries without round results. */
export function tournamentProgress(
  tournament: Pick<UserTournament, 'status' | 'final_placement' | 'round_results'>
): number {
  const placement =
    tournament.status === 'completed'
      ? { champion: 3, gf_loss: 2, sf_loss: 1, qf_loss: 0 }[tournament.final_placement ?? 'qf_loss']
      : 0;
  let rounds = 0;
  for (let round = 1; round <= 3; round++) {
    if (
      !tournament.round_results?.some((result) => result.round === round && result.result === 'win')
    )
      break;
    rounds = round;
  }
  return Math.max(placement, rounds);
}
