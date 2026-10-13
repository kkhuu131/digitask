import type { EvolutionPath } from '../constants/evolutionLookup';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import type { Digimon } from '../store/petStore';
import { getDevolutions } from './evolutionsHelper';

export interface PlannerEvolution {
  path: EvolutionPath;
  species: Digimon;
  repeatsInRoute: boolean;
}

/** Expand one incoming step at a time; cycle detection belongs to each route. */
export function getPlannerPredecessors(
  targetId: number,
  ancestors: readonly number[] = []
): PlannerEvolution[] {
  const routeIds = new Set([...ancestors, targetId]);
  return getDevolutions(targetId)
    .flatMap((path) => {
      const species = DIGIMON_LOOKUP_TABLE[path.from_digimon_id];
      return species ? [{ path, species, repeatsInRoute: routeIds.has(species.id) }] : [];
    })
    .sort((a, b) => a.species.name.localeCompare(b.species.name) || a.path.id - b.path.id);
}
