import { useMemo } from 'react';
import type { Digimon } from '../store/petStore';
import { getEvolutions, getDevolutions } from '../utils/evolutionsHelper';
import DigimonSprite from './DigimonSprite';
import EvolutionRequirements from './EvolutionRequirements';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
const StatBar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number | null;
  max: number;
  color: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-body font-medium w-8 text-right text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <div className="flex-1 bg-gray-200 dark:bg-dark-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(100, ((value || 0) / max) * 100)}%` }}
      />
    </div>
    <span className="text-xs font-body w-8 text-gray-700 dark:text-gray-300">{value ?? '—'}</span>
  </div>
);

// ── Color maps ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Vaccine: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Virus: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Data: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Free: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
};

const STAGE_COLORS: Record<string, string> = {
  Baby: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'In-Training': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Rookie: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Champion: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Ultimate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Mega: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STAT_BARS = [
  { key: 'hp', label: 'HP', color: 'bg-red-500' },
  { key: 'sp', label: 'SP', color: 'bg-blue-500' },
  { key: 'atk', label: 'ATK', color: 'bg-orange-500' },
  { key: 'def', label: 'DEF', color: 'bg-yellow-500' },
  { key: 'int', label: 'INT', color: 'bg-indigo-500' },
  { key: 'spd', label: 'SPD', color: 'bg-green-500' },
] as const;

const DigimonDetails = ({
  selectedDigimon,
  allDigimon,
  isDiscovered,
  statLevel,
  setStatLevel,
  onClose,
  navigateEvolution,
}: {
  selectedDigimon: Digimon;
  allDigimon: Digimon[];
  isDiscovered: (id: number) => boolean;
  statLevel: 1 | 50 | 99;
  setStatLevel: (level: 1 | 50 | 99) => void;
  onClose: () => void;
  navigateEvolution: (digimon: Digimon) => void;
}) => {
  const discovered = isDiscovered(selectedDigimon.id);
  const evolutionPathsData = {
    evolvesFrom: getDevolutions(selectedDigimon.id)
      .map((path) => ({
        ...path,
        from_digimon: allDigimon.find((d) => d.id === path.from_digimon_id)!,
      }))
      .filter((path) => path.from_digimon),
    evolvesTo: getEvolutions(selectedDigimon.id)
      .map((path) => ({
        ...path,
        to_digimon: allDigimon.find((d) => d.id === path.to_digimon_id)!,
      }))
      .filter((path) => path.to_digimon),
  };
  const getStatsForLevel = (digimon: Digimon, level: 1 | 50 | 99) => {
    if (level === 1) {
      return {
        hp: digimon.hp_level1 || digimon.hp,
        sp: digimon.sp_level1 || digimon.sp,
        atk: digimon.atk_level1 || digimon.atk,
        def: digimon.def_level1 || digimon.def,
        int: digimon.int_level1 || digimon.int,
        spd: digimon.spd_level1 || digimon.spd,
      };
    } else if (level === 99) {
      return {
        hp: digimon.hp_level99,
        sp: digimon.sp_level99,
        atk: digimon.atk_level99,
        def: digimon.def_level99,
        int: digimon.int_level99,
        spd: digimon.spd_level99,
      };
    } else {
      const mid = (val1: number | null, val99: number | null) => {
        if (val1 === null || val99 === null) return null;
        return Math.floor(val1 + (val99 - val1) * 0.5);
      };
      return {
        hp: mid(digimon.hp_level1, digimon.hp_level99),
        sp: mid(digimon.sp_level1, digimon.sp_level99),
        atk: mid(digimon.atk_level1, digimon.atk_level99),
        def: mid(digimon.def_level1, digimon.def_level99),
        int: mid(digimon.int_level1, digimon.int_level99),
        spd: mid(digimon.spd_level1, digimon.spd_level99),
      };
    }
  };

  const globalMaxStats = useMemo(() => {
    const maxes = { hp: 1, sp: 1, atk: 1, def: 1, int: 1, spd: 1 };
    for (const d of allDigimon) {
      if (d.hp_level99 && d.hp_level99 > maxes.hp) maxes.hp = d.hp_level99;
      if (d.sp_level99 && d.sp_level99 > maxes.sp) maxes.sp = d.sp_level99;
      if (d.atk_level99 && d.atk_level99 > maxes.atk) maxes.atk = d.atk_level99;
      if (d.def_level99 && d.def_level99 > maxes.def) maxes.def = d.def_level99;
      if (d.int_level99 && d.int_level99 > maxes.int) maxes.int = d.int_level99;
      if (d.spd_level99 && d.spd_level99 > maxes.spd) maxes.spd = d.spd_level99;
    }
    return maxes;
  }, [allDigimon]);

  const stats = getStatsForLevel(selectedDigimon, statLevel);
  const typeColor =
    TYPE_COLORS[selectedDigimon.type || ''] ||
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  const stageColor =
    STAGE_COLORS[selectedDigimon.stage || ''] ||
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return (
    <>
      {' '}
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-dark-200 shrink-0">
        <div>
          <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {discovered ? selectedDigimon.name : '???'}
          </h2>
          <p className="text-xs font-body text-gray-500 dark:text-gray-400">
            #{String(selectedDigimon.id).padStart(3, '0')} •{' '}
            <span className={`font-semibold px-1.5 py-0.5 rounded-full text-xs ${stageColor}`}>
              {selectedDigimon.stage}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Digimon details"
          className="ui-icon-button rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 p-4 space-y-5">
        {/* Large sprite */}
        <div className="flex justify-center py-2 bg-gray-50 dark:bg-dark-200 rounded-xl">
          {selectedDigimon.sprite_url && (
            <DigimonSprite
              digimonName={discovered ? selectedDigimon.name : '???'}
              fallbackSpriteUrl={selectedDigimon.sprite_url}
              size="md"
              silhouette={!discovered}
              showHappinessAnimations={true}
              enableHopping={false}
            />
          )}
        </div>

        {/* Type + Attribute badges */}
        <div className="flex flex-wrap gap-2">
          {selectedDigimon.type && (
            <span className={`font-body text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}>
              {discovered ? selectedDigimon.type : '???'}
            </span>
          )}
          {selectedDigimon.attribute && (
            <span className="font-body text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {discovered ? selectedDigimon.attribute : '???'}
            </span>
          )}
        </div>

        {/* Stat section */}
        {discovered && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-sm font-bold text-gray-700 dark:text-gray-300">
                Base Stats
              </h3>
              {/* Level toggle */}
              <div className="flex bg-gray-100 dark:bg-dark-200 rounded-lg p-0.5 gap-0.5">
                {([1, 50, 99] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setStatLevel(lv)}
                    className={`px-2.5 py-1 text-xs font-body font-semibold rounded-md transition-colors ${
                      statLevel === lv
                        ? 'bg-white dark:bg-dark-100 text-gray-800 dark:text-gray-200 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    Lv{lv}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {STAT_BARS.map(({ key, label, color }) => (
                <StatBar
                  key={key}
                  label={label}
                  value={stats[key as keyof typeof stats]}
                  max={globalMaxStats[key as keyof typeof globalMaxStats]}
                  color={color}
                />
              ))}
            </div>
          </div>
        )}
        {/* Evolution paths */}
        {(evolutionPathsData.evolvesFrom?.length > 0 ||
          evolutionPathsData.evolvesTo?.length > 0) && (
          <div>
            <h3 className="font-heading text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Evolution Paths
            </h3>

            <div className="space-y-4">
              {/* Evolves From */}
              {evolutionPathsData.evolvesFrom?.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-xs font-body font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                    <ArrowUp className="w-3 h-3" />
                    Evolves From
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {evolutionPathsData.evolvesFrom.map((path) => {
                      const disc = isDiscovered(path.from_digimon.id);
                      const target = allDigimon.find(
                        (digimon) => digimon.id === path.from_digimon.id
                      );
                      return (
                        <button
                          type="button"
                          key={path.id}
                          disabled={!disc || !target}
                          onClick={() => {
                            if (target) navigateEvolution(target);
                          }}
                          aria-label={disc ? `View ${target?.name}` : 'Undiscovered Digimon'}
                          className="flex min-w-0 flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 dark:bg-dark-200 transition-colors enabled:hover:bg-accent-50 dark:enabled:hover:bg-dark-100 enabled:hover:ring-1 enabled:hover:ring-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-default"
                        >
                          <div className="w-12 h-12 flex items-center justify-center">
                            <DigimonSprite
                              digimonName={path.from_digimon.name}
                              fallbackSpriteUrl={path.from_digimon.sprite_url}
                              size="sm"
                              silhouette={!disc}
                              showHappinessAnimations={false}
                              enableHopping={false}
                            />
                          </div>
                          <span className="text-xs font-body text-center text-gray-700 dark:text-gray-300 leading-tight">
                            {disc ? path.from_digimon.name : '???'}
                          </span>
                          <span className="text-xs font-body text-gray-400 dark:text-gray-500">
                            Lv {path.level_required}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Evolves To */}
              {evolutionPathsData.evolvesTo?.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-xs font-body font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                    <ArrowDown className="w-3 h-3" />
                    Evolves To
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {evolutionPathsData.evolvesTo.map((path) => {
                      const disc = isDiscovered(path.to_digimon.id);
                      const target = allDigimon.find(
                        (digimon) => digimon.id === path.to_digimon.id
                      );
                      return (
                        <button
                          type="button"
                          key={path.id}
                          disabled={!disc || !target}
                          onClick={() => {
                            if (target) navigateEvolution(target);
                          }}
                          aria-label={disc ? `View ${target?.name}` : 'Undiscovered Digimon'}
                          className="flex min-w-0 flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 dark:bg-dark-200 transition-colors enabled:hover:bg-accent-50 dark:enabled:hover:bg-dark-100 enabled:hover:ring-1 enabled:hover:ring-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-default"
                        >
                          <div className="w-12 h-12 flex items-center justify-center">
                            <DigimonSprite
                              digimonName={path.to_digimon.name}
                              fallbackSpriteUrl={path.to_digimon.sprite_url}
                              size="sm"
                              silhouette={!disc}
                              showHappinessAnimations={false}
                              enableHopping={false}
                            />
                          </div>
                          <span className="text-xs font-body text-center text-gray-700 dark:text-gray-300 leading-tight">
                            {disc ? path.to_digimon.name : '???'}
                          </span>
                          <span className="text-xs font-body text-gray-400 dark:text-gray-500">
                            Lv {path.level_required}
                          </span>
                          <span className="text-center">
                            <EvolutionRequirements
                              statRequirements={path.stat_requirements}
                              itemRequirement={path.item_requirement}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default DigimonDetails;
