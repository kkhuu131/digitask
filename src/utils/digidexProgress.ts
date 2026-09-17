import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';

const catalogIds = new Set(Object.values(DIGIMON_LOOKUP_TABLE).map((digimon) => digimon.id));
export const DIGIDEX_TOTAL = catalogIds.size;

export function getDigidexPercentage(discoveredCount: number): number {
  return DIGIDEX_TOTAL ? Math.round((discoveredCount / DIGIDEX_TOTAL) * 100) : 0;
}

/** Only unique species present in the playable Digidex count toward completion. */
export function getDigidexProgress(discoveredIds: Iterable<number>) {
  const count = new Set([...discoveredIds].filter((id) => catalogIds.has(id))).size;
  return { count, total: DIGIDEX_TOTAL, percentage: getDigidexPercentage(count) };
}
