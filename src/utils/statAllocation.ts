import { getRemainingStatPoints, type UserDigimon } from '../store/petStore';

export const BONUS_STATS = ['HP', 'SP', 'ATK', 'DEF', 'INT', 'SPD'] as const;
export type BonusStat = (typeof BONUS_STATS)[number];
export type StatAllocation = Record<BonusStat, number>;
export interface BatchAllocationResult {
  success: boolean;
  reason?: 'changed' | 'cap' | 'points';
  saved_stats: Record<string, number>;
  digimon: UserDigimon;
}
export const EMPTY_ALLOCATION: StatAllocation = { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 };
export const BONUS_FIELDS = {
  HP: 'hp_bonus',
  SP: 'sp_bonus',
  ATK: 'atk_bonus',
  DEF: 'def_bonus',
  INT: 'int_bonus',
  SPD: 'spd_bonus',
} as const;

export const allocationTotal = (draft: StatAllocation) =>
  BONUS_STATS.reduce((total, stat) => total + draft[stat], 0);

export const bonusSnapshot = (digimon: UserDigimon): StatAllocation => ({
  HP: digimon.hp_bonus,
  SP: digimon.sp_bonus,
  ATK: digimon.atk_bonus,
  DEF: digimon.def_bonus,
  INT: digimon.int_bonus,
  SPD: digimon.spd_bonus,
});

export const previewAllocation = (digimon: UserDigimon, draft: StatAllocation): UserDigimon => {
  const preview = { ...digimon };
  for (const stat of BONUS_STATS) preview[BONUS_FIELDS[stat]] += draft[stat];
  return preview;
};

// Functional state updates use this guard so even taps within one render obey
// both the per-stat saved balance and the combined ABI cap.
export function adjustAllocation(
  draft: StatAllocation,
  stat: BonusStat,
  delta: 1 | -1,
  digimon: UserDigimon,
  savedStats: Record<string, number>
): StatAllocation {
  const available = savedStats[stat] ?? 0;
  if (
    delta === -1
      ? draft[stat] <= 0
      : draft[stat] >= available || allocationTotal(draft) >= getRemainingStatPoints(digimon)
  )
    return draft;
  return { ...draft, [stat]: draft[stat] + delta };
}
