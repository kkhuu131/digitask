import type { EvolutionOption, UserDigimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { calculateFinalStats } from './digimonStatCalculation';

/** Use the displayed, rounded stats, including trained bonuses and personality, for every check. */
export const getEvolutionStatRequirements = (
  digimon: UserDigimon,
  requirements: EvolutionOption['stat_requirements']
) => {
  const stats = {
    ...calculateFinalStats({
      ...digimon,
      digimon: digimon.digimon ?? DIGIMON_LOOKUP_TABLE[digimon.digimon_id],
    }),
    abi: digimon.abi ?? 0,
  };
  return Object.entries(requirements ?? {})
    .filter(([, required]) => required > 0)
    .map(([stat, required]) => {
      const current = stats[stat as keyof typeof stats];
      return { name: stat.toUpperCase(), current, required, meets: current >= required };
    });
};
