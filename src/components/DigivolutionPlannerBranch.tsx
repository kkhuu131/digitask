import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DigimonSprite from './DigimonSprite';
import EvolutionRequirements from './EvolutionRequirements';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import type { Digimon } from '../store/petStore';
import { getPlannerPredecessors, type PlannerRoute } from '../utils/digivolutionPlanner';

interface PlannerSpriteProps {
  species: Digimon;
  discovered: boolean;
}

export function PlannerSprite({ species, discovered }: PlannerSpriteProps) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-200">
      <DigimonSprite
        digimonName={species.name}
        fallbackSpriteUrl={species.sprite_url}
        size="xs"
        silhouette={!discovered}
        showHappinessAnimations={false}
      />
    </div>
  );
}

interface BranchProps {
  route: PlannerRoute;
  target: Digimon;
  ancestors: readonly number[];
  discoveredIds: ReadonlySet<number>;
}

export default function DigivolutionPlannerBranch({
  route,
  target,
  ancestors,
  discoveredIds,
}: BranchProps) {
  const { species, repeatsInRoute } = route;
  const path = route.kind === 'evolution' ? route.path : null;
  const [expanded, setExpanded] = useState(false);
  const branchId = useId();
  const lineage = [...ancestors, species.id];
  const earlierRoutes = repeatsInRoute ? [] : getPlannerPredecessors(species.id, lineage);
  const partner = path?.dna_requirement ? DIGIMON_LOOKUP_TABLE[path.dna_requirement] : null;
  const canExpand = earlierRoutes.length > 0;

  const identity = (
    <>
      <PlannerSprite species={species} discovered={discoveredIds.has(species.id)} />
      <span className="min-w-0 flex-1">
        <span className="block break-words font-heading text-sm font-semibold text-gray-900 dark:text-gray-100">
          {species.name}
        </span>
        <span className="block text-xs text-gray-600 dark:text-gray-400 [overflow-wrap:anywhere]">
          {route.kind === 'form' ? 'Transforms into' : 'Evolves into'} {target.name}
        </span>
      </span>
      {canExpand && (
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      )}
    </>
  );

  return (
    <li className="min-w-[220px] space-y-3">
      <div className="ui-panel overflow-hidden">
        {canExpand ? (
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
            aria-label={`${expanded ? 'Hide' : 'Show'} earlier evolutions for ${species.name}`}
            aria-expanded={expanded}
            aria-controls={expanded ? branchId : undefined}
            onClick={() => setExpanded((value) => !value)}
          >
            {identity}
          </button>
        ) : (
          <div className="flex items-center gap-3 px-3 py-3">{identity}</div>
        )}

        <div className="space-y-2 border-t border-gray-200 px-3 py-3 dark:border-dark-100">
          {path ? (
            <div
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              aria-label={`Requirements to evolve ${species.name} into ${target.name}`}
            >
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Level {path.level_required}
              </span>
              <EvolutionRequirements
                statRequirements={path.stat_requirements}
                itemRequirement={path.item_requirement}
              />
            </div>
          ) : route.kind === 'form' ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {route.form.formType} transformation
              </p>
              {route.form.formType === 'X-Antibody' && (
                <>
                  <EvolutionRequirements statRequirements={{}} itemRequirement="x_antibody" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Apply once to this Digimon to unlock form changes.
                  </p>
                </>
              )}
              {route.form.unlockCondition && (
                <p className="text-xs text-gray-600 dark:text-gray-400 [overflow-wrap:anywhere]">
                  {route.form.unlockCondition}
                </p>
              )}
            </div>
          ) : null}
          {path?.dna_requirement && (
            <div className="flex items-center gap-3">
              {partner && (
                <PlannerSprite species={partner} discovered={discoveredIds.has(partner.id)} />
              )}
              <p className="min-w-0 text-xs text-gray-600 dark:text-gray-400 [overflow-wrap:anywhere]">
                DNA partner: {partner?.name ?? 'Required partner'}
              </p>
            </div>
          )}
          {repeatsInRoute ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This species already appears in this route.
            </p>
          ) : !canExpand ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              No earlier evolution or form-change routes.
            </p>
          ) : null}
        </div>
      </div>

      {expanded && (
        <ul
          id={branchId}
          aria-label={`Earlier evolutions for ${species.name}`}
          className="ml-2 space-y-3 border-l border-gray-200 pl-2 sm:ml-3 sm:pl-3 dark:border-dark-100"
        >
          {earlierRoutes.map((earlierRoute) => (
            <DigivolutionPlannerBranch
              key={earlierRoute.key}
              route={earlierRoute}
              target={species}
              ancestors={lineage}
              discoveredIds={discoveredIds}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
