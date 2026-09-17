import type { UserDigimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { calculateFinalStats } from './digimonStatCalculation';

/** General-purpose ranking; type matchups and team composition can still favor other picks. */
export function selectStrongestTeam(party: UserDigimon[]): UserDigimon[] {
  const seen = new Set<string>();
  return party
    .filter((pet) => {
      if (pet.is_in_storage || seen.has(pet.id)) return false;
      seen.add(pet.id);
      return !!(pet.digimon ?? DIGIMON_LOOKUP_TABLE[pet.digimon_id]);
    })
    .map((pet) => {
      const stats = calculateFinalStats({
        ...pet,
        digimon: pet.digimon ?? DIGIMON_LOOKUP_TABLE[pet.digimon_id],
      });
      return {
        pet,
        score: stats.hp / 10 + stats.sp + stats.atk + stats.def + stats.int + stats.spd,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.pet.current_level - a.pet.current_level ||
        a.pet.id.localeCompare(b.pet.id)
    )
    .slice(0, 3)
    .map(({ pet }) => pet);
}
