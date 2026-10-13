import type { EvolutionPath } from '../constants/evolutionLookup';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { BASE_TO_FORMS_MAP, type DigimonFormInfo } from '../constants/digimonFormsLookup';
import type { Digimon } from '../store/petStore';
import { getDevolutions } from './evolutionsHelper';

interface PlannerRouteBase {
  key: string;
  species: Digimon;
  repeatsInRoute: boolean;
}

export type PlannerRoute = PlannerRouteBase &
  ({ kind: 'evolution'; path: EvolutionPath } | { kind: 'form'; form: DigimonFormInfo });

const incomingForms = new Map<number, { species: Digimon; form: DigimonFormInfo }[]>();
for (const [sourceId, forms] of Object.entries(BASE_TO_FORMS_MAP)) {
  const species = DIGIMON_LOOKUP_TABLE[Number(sourceId)];
  if (!species) continue;
  for (const form of forms) {
    const target = DIGIMON_LOOKUP_TABLE[form.formDigimonId];
    if (!target || form.formType === 'Base') continue;
    // One catalog return-to-base row is labeled X-Antibody. Only include
    // transformations into an X species, never from X back to its base.
    if (
      form.formType === 'X-Antibody' &&
      (!target.name.endsWith(' X') || species.name.endsWith(' X'))
    )
      continue;
    const routes = incomingForms.get(target.id) ?? [];
    routes.push({ species, form });
    incomingForms.set(target.id, routes);
  }
}

/** Expand one incoming step at a time; cycle detection belongs to each route. */
export function getPlannerPredecessors(
  targetId: number,
  ancestors: readonly number[] = []
): PlannerRoute[] {
  const routeIds = new Set([...ancestors, targetId]);
  const evolutionRoutes: PlannerRoute[] = getDevolutions(targetId).flatMap((path) => {
    const species = DIGIMON_LOOKUP_TABLE[path.from_digimon_id];
    return species
      ? [
          {
            kind: 'evolution' as const,
            key: `evolution:${path.id}`,
            path,
            species,
            repeatsInRoute: routeIds.has(species.id),
          },
        ]
      : [];
  });
  const formRoutes: PlannerRoute[] = (incomingForms.get(targetId) ?? []).map(
    ({ species, form }) => ({
      kind: 'form',
      key: `form:${species.id}:${targetId}:${form.formType}`,
      species,
      form,
      repeatsInRoute: routeIds.has(species.id),
    })
  );
  return [...evolutionRoutes, ...formRoutes].sort(
    (a, b) =>
      a.species.name.localeCompare(b.species.name) ||
      (a.kind === 'evolution' && b.kind === 'evolution'
        ? a.path.id - b.path.id
        : a.key.localeCompare(b.key))
  );
}
