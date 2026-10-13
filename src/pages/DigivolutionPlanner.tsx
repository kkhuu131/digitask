import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { ChevronDown, Search, X } from 'lucide-react';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { useDigimonStore, type Digimon } from '../store/petStore';
import { getPlannerPredecessors } from '../utils/digivolutionPlanner';
import DigivolutionPlannerBranch, { PlannerSprite } from '../components/DigivolutionPlannerBranch';

const speciesCatalog = Object.values(DIGIMON_LOOKUP_TABLE).sort((a, b) =>
  a.name.localeCompare(b.name)
);
const stageOrder = [
  'Ultra',
  'Mega',
  'Ultimate',
  'Champion',
  'Armor',
  'Rookie',
  'In-Training',
  'Baby',
  'Other',
];

export default function DigivolutionPlanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const discoveredDigimon = useDigimonStore((state) => state.discoveredDigimon);
  const discoveredIds = useMemo(() => new Set(discoveredDigimon), [discoveredDigimon]);
  const target = DIGIMON_LOOKUP_TABLE[Number(searchParams.get('target'))] ?? null;
  const stageGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    const groups = new Map<string, Digimon[]>();
    for (const species of speciesCatalog) {
      if (!species.name.toLowerCase().includes(search)) continue;
      const stage = species.stage && species.stage !== 'None' ? species.stage : 'Other';
      const group = groups.get(stage) ?? [];
      group.push(species);
      groups.set(stage, group);
    }
    const rank = (stage: string) => {
      const index = stageOrder.indexOf(stage);
      return index === -1 ? stageOrder.length : index;
    };
    return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [query]);
  const routes = target ? getPlannerPredecessors(target.id) : [];

  const selectTarget = (species: Digimon | null) => {
    setSearchParams(species ? { target: String(species.id) } : {});
    setQuery('');
  };

  return (
    <div className="ui-page max-w-3xl">
      <div className="ui-page-header">
        <div>
          <h1 className="ui-page-title">Digivolution Planner</h1>
          <p className="ui-description">
            Choose a target Digimon and trace its evolution and form-change routes backward.
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <label
          htmlFor="planner-target"
          className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Target Digimon
        </label>
        <div className="flex items-start gap-2">
          <div className="relative min-w-0 flex-1">
            <Combobox
              value={target}
              by="id"
              onChange={selectTarget}
              onClose={() => setQuery('')}
              immediate
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  id="planner-target"
                  className="input pl-10 pr-12"
                  aria-describedby="planner-search-help"
                  placeholder="Search any species by name"
                  displayValue={(species: Digimon | null) => species?.name ?? ''}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <ComboboxButton
                  className="ui-icon-button absolute right-0 top-0"
                  aria-label="Show Digimon species"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </ComboboxButton>
              </div>
              <ComboboxOptions className="absolute left-0 right-0 z-dropdown mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg empty:hidden dark:border-dark-100 dark:bg-dark-200">
                {stageGroups.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-600 dark:text-gray-400">
                    No species match your search.
                  </div>
                ) : (
                  stageGroups.map(([stage, species]) => (
                    <div
                      key={stage}
                      role="group"
                      aria-labelledby={`planner-stage-${stage.replace(/\s+/g, '-')}`}
                    >
                      <div
                        id={`planner-stage-${stage.replace(/\s+/g, '-')}`}
                        className="sticky top-0 z-sticky bg-gray-100 px-3 py-2 text-xs font-heading font-semibold text-gray-600 dark:bg-dark-100 dark:text-gray-300"
                      >
                        {stage}
                      </div>
                      {species.map((digimon) => (
                        <ComboboxOption
                          key={digimon.id}
                          value={digimon}
                          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-900 data-[focus]:bg-accent-50 data-[selected]:font-semibold dark:text-gray-100 dark:data-[focus]:bg-accent-900/30"
                        >
                          <PlannerSprite
                            species={digimon}
                            discovered={discoveredIds.has(digimon.id)}
                            compact
                          />
                          <span className="min-w-0 break-words">{digimon.name}</span>
                        </ComboboxOption>
                      ))}
                    </div>
                  ))
                )}
              </ComboboxOptions>
            </Combobox>
          </div>
          {target && (
            <button
              type="button"
              className="ui-icon-button"
              aria-label="Clear target Digimon"
              onClick={() => selectTarget(null)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p id="planner-search-help" className="ui-description">
          All species names are visible. Undiscovered Digimon appear as silhouettes.
        </p>
      </div>

      {target ? (
        <section key={target.id} aria-labelledby="planner-routes-heading">
          <div className="card mb-4 flex items-center gap-3 border-l-4 border-l-accent-500">
            <PlannerSprite species={target} discovered={discoveredIds.has(target.id)} />
            <div className="min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400">Your target</p>
              <h2 id="planner-routes-heading" className="ui-section-title break-words">
                {target.name}
              </h2>
            </div>
          </div>
          {routes.length > 0 ? (
            <>
              <p className="ui-description mb-4">
                These Digimon can become {target.name}. Expand a branch to see earlier steps.
              </p>
              <div
                className="overflow-x-auto rounded-lg pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
                role="region"
                aria-label="Evolution route tree"
                tabIndex={0}
              >
                <ul className="space-y-3" aria-label={`Evolution routes to ${target.name}`}>
                  {routes.map((route) => (
                    <DigivolutionPlannerBranch
                      key={route.key}
                      route={route}
                      target={target}
                      ancestors={[target.id]}
                      discoveredIds={discoveredIds}
                    />
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="ui-empty">
              No evolution or form-change routes lead to {target.name} in the current catalog.
              Choose another target to explore its routes.
            </div>
          )}
        </section>
      ) : (
        <div className="ui-empty">
          Search for the Digimon you want to raise, then follow its routes back to a familiar
          species.
        </div>
      )}
    </div>
  );
}
