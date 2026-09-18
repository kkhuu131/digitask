import { getDigidexProgress } from '../utils/digidexProgress';
import ContentSkeleton from './ContentSkeleton';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useDigimonStore, Digimon } from '../store/petStore';
import { useDigimonData } from '../hooks/useDigimonData';
import DigimonSprite from './DigimonSprite';
import DigimonDetails from './DigimonDetails';
import DigimonDetailsDrawer from './DigimonDetailsDrawer';
import { Search, X } from 'lucide-react';

// ── Inline sub-components ─────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Vaccine: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Virus: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Data: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Free: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const STAGE_COLORS: Record<string, string> = {
  Baby: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'In-Training': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Rookie: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Champion: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Ultimate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Mega: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STAGES = ['All', 'Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega'] as const;
type StageFilter = (typeof STAGES)[number];

// ── Main component ────────────────────────────────────────────────────────────

const DigimonDex = () => {
  const { digimon: allDigimon, loading } = useDigimonData();
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const { discoveredDigimon } = useDigimonStore();
  const discoveryProgress = getDigidexProgress(discoveredDigimon);
  const [statLevel, setStatLevel] = useState<1 | 50 | 99>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');
  const rowRefs = useRef(new Map<number, HTMLDivElement>());
  const [scrollTargetId, setScrollTargetId] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isDiscovered = (digimonId: number) => discoveredDigimon.includes(digimonId);

  const handleDigimonSelect = async (digimon: Digimon) => {
    if (!isDiscovered(digimon.id)) return;

    setSelectedDigimon(digimon);
  };

  const closeDetails = () => {
    setSelectedDigimon(null);
    setStatLevel(1);
  };

  // ── Derived lists ─────────────────────────────────────────────────────────

  const sortedDigimon = useMemo(() => [...allDigimon].sort((a, b) => a.id - b.id), [allDigimon]);

  const filteredDigimon = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sortedDigimon.filter((d) => {
      const discovered = isDiscovered(d.id);
      const stageOk = stageFilter === 'All' || d.stage === stageFilter;
      if (!stageOk) return false;
      if (!q) return true;
      // For undiscovered entries we allow filtering by stage but not by name/type
      if (!discovered) return false;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.stage || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        (d.attribute || '').toLowerCase().includes(q)
      );
    });
  }, [sortedDigimon, searchQuery, stageFilter, discoveredDigimon]);

  const navigateEvolution = (digimon: Digimon) => {
    if (!isDiscovered(digimon.id)) return;
    if (stageFilter !== 'All' && stageFilter !== digimon.stage) setStageFilter('All');
    const query = searchQuery.toLowerCase().trim();
    if (
      query &&
      ![digimon.name, digimon.stage, digimon.type, digimon.attribute].some((value) =>
        value?.toLowerCase().includes(query)
      )
    )
      setSearchQuery('');
    handleDigimonSelect(digimon);
    setScrollTargetId(digimon.id);
  };

  // Wait for any cleared filters to render the destination row before scrolling.
  useEffect(() => {
    if (scrollTargetId === null) return;
    const frame = requestAnimationFrame(() => {
      rowRefs.current.get(scrollTargetId)?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      setScrollTargetId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTargetId, filteredDigimon, reducedMotion]);

  // Max Lv99 stats across ALL digimon, used to normalise stat bars
  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading && allDigimon.length === 0) {
    return <ContentSkeleton label="Loading DigiDex…" count={6} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={`relative flex flex-col min-h-0 ${selectedDigimon ? 'md:pr-[360px]' : ''} transition-all duration-300`}
    >
      {/* ── Header bar ── */}
      <div className="card mb-0 rounded-b-none border-b-0 pb-3">
        <p className="text-sm font-body text-gray-500 dark:text-gray-400 mb-3">
          Discovered:{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {discoveryProgress.count}
          </span>{' '}
          /{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {discoveryProgress.total}
          </span>
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, stage, type or attribute…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-body rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stage filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1 rounded-full text-xs font-body font-semibold border transition-colors ${
                stageFilter === stage
                  ? 'bg-blue-500 dark:bg-amber-500 text-white border-transparent'
                  : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-amber-400'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dex list ── */}
      <div className="card rounded-t-none pt-0 overflow-hidden">
        {filteredDigimon.length === 0 ? (
          <p className="py-12 text-center text-sm font-body text-gray-400 dark:text-gray-500">
            No Digimon match your search.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredDigimon.map((digimon, idx) => {
              const discovered = isDiscovered(digimon.id);
              const isSelected = selectedDigimon?.id === digimon.id;
              const typeColor =
                TYPE_COLORS[digimon.type || ''] ||
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
              const stageColor =
                STAGE_COLORS[digimon.stage || ''] ||
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

              return (
                <div
                  key={digimon.id}
                  ref={(element) => {
                    if (element) rowRefs.current.set(digimon.id, element);
                    else rowRefs.current.delete(digimon.id);
                  }}
                  onClick={() => discovered && handleDigimonSelect(digimon)}
                  className={`scroll-mt-24 flex items-center gap-3 px-3 py-2 transition-colors
                    ${idx % 2 === 0 ? 'bg-white dark:bg-dark-300' : 'bg-gray-50 dark:bg-dark-200/60'}
                    ${discovered ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-dark-100' : 'opacity-60 cursor-default'}
                    ${isSelected ? 'bg-blue-50 dark:bg-dark-100 ring-1 ring-inset ring-blue-300 dark:ring-amber-500/50' : ''}
                  `}
                >
                  {/* Dex number */}
                  <span className="text-xs font-body text-gray-400 dark:text-gray-500 w-9 shrink-0 text-right tabular-nums">
                    #{String(digimon.id).padStart(3, '0')}
                  </span>

                  {/* Sprite */}
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    {digimon.sprite_url ? (
                      <DigimonSprite
                        digimonName={digimon.name}
                        fallbackSpriteUrl={digimon.sprite_url}
                        size="sm"
                        silhouette={!discovered}
                        showHappinessAnimations={false}
                        enableHopping={false}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                        ?
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`font-heading text-sm font-semibold flex-1 min-w-0 truncate ${
                      discovered
                        ? 'text-gray-800 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {discovered ? digimon.name : '???'}
                  </span>

                  {/* Stage badge */}
                  <span
                    className={`hidden sm:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? stageColor
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                    }`}
                  >
                    {discovered ? digimon.stage || '—' : '??????'}
                  </span>

                  {/* Type badge */}
                  <span
                    className={`hidden md:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? typeColor
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                    }`}
                  >
                    {discovered ? digimon.type || '—' : '??????'}
                  </span>

                  {/* Attribute badge */}
                  <span
                    className={`hidden lg:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                    }`}
                  >
                    {discovered ? digimon.attribute || '—' : '??????'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail panel: fixed right on md+, bottom sheet on mobile ── */}
      {selectedDigimon && (
        <DigimonDetailsDrawer onClose={closeDetails}>
          <DigimonDetails
            selectedDigimon={selectedDigimon}
            allDigimon={allDigimon}
            isDiscovered={isDiscovered}
            statLevel={statLevel}
            setStatLevel={setStatLevel}
            onClose={closeDetails}
            navigateEvolution={navigateEvolution}
          />
        </DigimonDetailsDrawer>
      )}
    </div>
  );
};

export default DigimonDex;
