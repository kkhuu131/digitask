import { simulateArena } from '../engine/arenaReplay';
import type { Strategy } from '../engine/arenaTypes';
import type { UserDigimon } from '../store/petStore';
import type { TournamentOpponentDigimon } from '../types/tournament';
import { convertToBattleDigimon } from './convertToBattleDigimon';

/** Tournament combat uses the same current simulator and recording as daily arena combat. */
export const prepareTournamentBattle = (
  selectedTeam: UserDigimon[],
  opponentTeam: TournamentOpponentDigimon[],
  seed: number
) => {
  const userBattle = selectedTeam.map((digimon) => convertToBattleDigimon(digimon, true));
  const opponentBattle = opponentTeam.map((digimon) => convertToBattleDigimon(digimon, false));
  const strategies: Strategy[] = selectedTeam.map(() => 'balanced');
  return {
    userTeam: userBattle,
    opponentTeam: opponentBattle,
    replay: simulateArena(userBattle, opponentBattle, strategies, seed),
  };
};
