import { useState, useMemo } from "react";
import { useDigimonStore, Digimon } from "../store/petStore";
import { useDigimonData } from "../hooks/useDigimonData";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { getDevolutions } from "@/utils/evolutionsHelper";
import { getEvolutions } from "@/utils/evolutionsHelper";
import DigimonSprite from "./DigimonSprite";
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";

// ── Inline sub-components ─────────────────────────────────────────────────────

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
    <span className="text-xs font-body w-8 text-gray-700 dark:text-gray-300">
      {value ?? "—"}
    </span>
  </div>
);

// ── Color maps ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Vaccine: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Virus: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Data: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Free: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const STAGE_COLORS: Record<string, string> = {
  Baby: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "In-Training": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Rookie: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Champion: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Ultimate: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Mega: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STAT_BARS = [
  { key: "hp", label: "HP", color: "bg-red-500" },
  { key: "sp", label: "SP", color: "bg-blue-500" },
  { key: "atk", label: "ATK", color: "bg-orange-500" },
  { key: "def", label: "DEF", color: "bg-yellow-500" },
  { key: "int", label: "INT", color: "bg-indigo-500" },
  { key: "spd", label: "SPD", color: "bg-green-500" },
] as const;

const STAGES = ["All", "Baby", "In-Training", "Rookie", "Champion", "Ultimate", "Mega"] as const;
type StageFilter = (typeof STAGES)[number];

// ── Main component ────────────────────────────────────────────────────────────

const DigimonDex = () => {
  const { digimon: allDigimon, loading } = useDigimonData();
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [evolutionPathsData, setEvolutionPaths] = useState<any>({});
  const { discoveredDigimon } = useDigimonStore();
  const [statLevel, setStatLevel] = useState<1 | 50 | 99>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("All");

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isDiscovered = (digimonId: number) => discoveredDigimon.includes(digimonId);

  const handleDigimonSelect = async (digimon: Digimon) => {
    if (!isDiscovered(digimon.id)) return;

    setSelectedDigimon(digimon);

    try {
      const evolutionPaths = getEvolutions(digimon.id);
      const devolutionPaths = getDevolutions(digimon.id);
      const allPaths = [...evolutionPaths, ...devolutionPaths];

      const evolvesFrom = allPaths
        .filter((path) => path.to_digimon_id === digimon.id)
        .map((path) => ({
          id: path.id,
          from_digimon: {
            id: DIGIMON_LOOKUP_TABLE[path.from_digimon_id].id,
            digimon_id: DIGIMON_LOOKUP_TABLE[path.from_digimon_id].digimon_id,
            name: DIGIMON_LOOKUP_TABLE[path.from_digimon_id].name,
            stage: DIGIMON_LOOKUP_TABLE[path.from_digimon_id].stage,
            sprite_url: DIGIMON_LOOKUP_TABLE[path.from_digimon_id].sprite_url,
          },
          level_required: path.level_required,
        }));

      const evolvesTo = allPaths
        .filter((path) => path.from_digimon_id === digimon.id)
        .map((path) => ({
          id: path.id,
          to_digimon: {
            id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].id,
            digimon_id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].digimon_id,
            name: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].name,
            stage: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].stage,
            sprite_url: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].sprite_url,
          },
          level_required: path.level_required,
        }));

      setEvolutionPaths({ evolvesFrom, evolvesTo });
    } catch (err) {
      console.error("Error fetching evolution paths:", err);
    }
  };

  const closeDetails = () => {
    setSelectedDigimon(null);
    setEvolutionPaths({});
    setStatLevel(1);
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

  // ── Derived lists ─────────────────────────────────────────────────────────

  const sortedDigimon = useMemo(
    () => [...allDigimon].sort((a, b) => a.id - b.id),
    [allDigimon]
  );

  const filteredDigimon = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sortedDigimon.filter((d) => {
      const discovered = isDiscovered(d.id);
      const stageOk = stageFilter === "All" || d.stage === stageFilter;
      if (!stageOk) return false;
      if (!q) return true;
      // For undiscovered entries we allow filtering by stage but not by name/type
      if (!discovered) return false;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.stage || "").toLowerCase().includes(q) ||
        (d.type || "").toLowerCase().includes(q) ||
        (d.attribute || "").toLowerCase().includes(q)
      );
    });
  }, [sortedDigimon, searchQuery, stageFilter, discoveredDigimon]);

  // Max Lv99 stats across ALL digimon, used to normalise stat bars
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

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-amber-500" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`relative flex flex-col min-h-0 ${selectedDigimon ? "md:pr-[360px]" : ""} transition-all duration-300`}>
      {/* ── Header bar ── */}
      <div className="card mb-0 rounded-b-none border-b-0 pb-3">
        <p className="text-sm font-body text-gray-500 dark:text-gray-400 mb-3">
          Discovered: <span className="font-semibold text-gray-700 dark:text-gray-300">{discoveredDigimon.length}</span> /{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{allDigimon.length}</span>
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
              onClick={() => setSearchQuery("")}
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
                  ? "bg-blue-500 dark:bg-amber-500 text-white border-transparent"
                  : "bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-amber-400"
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
                TYPE_COLORS[digimon.type || ""] ||
                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
              const stageColor =
                STAGE_COLORS[digimon.stage || ""] ||
                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

              return (
                <div
                  key={digimon.id}
                  onClick={() => discovered && handleDigimonSelect(digimon)}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors
                    ${idx % 2 === 0 ? "bg-white dark:bg-dark-300" : "bg-gray-50 dark:bg-dark-200/60"}
                    ${discovered ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-dark-100" : "opacity-60 cursor-default"}
                    ${isSelected ? "bg-blue-50 dark:bg-dark-100 ring-1 ring-inset ring-blue-300 dark:ring-amber-500/50" : ""}
                  `}
                >
                  {/* Dex number */}
                  <span className="text-xs font-body text-gray-400 dark:text-gray-500 w-9 shrink-0 text-right tabular-nums">
                    #{String(digimon.id).padStart(3, "0")}
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
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {discovered ? digimon.name : "???"}
                  </span>

                  {/* Stage badge */}
                  <span
                    className={`hidden sm:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? stageColor
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    }`}
                  >
                    {discovered ? (digimon.stage || "—") : "??????"}
                  </span>

                  {/* Type badge */}
                  <span
                    className={`hidden md:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? typeColor
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    }`}
                  >
                    {discovered ? (digimon.type || "—") : "??????"}
                  </span>

                  {/* Attribute badge */}
                  <span
                    className={`hidden lg:inline-flex shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      discovered
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    }`}
                  >
                    {discovered ? (digimon.attribute || "—") : "??????"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail panel: fixed right on md+, bottom sheet on mobile ── */}
      {selectedDigimon && (() => {
        const stats = getStatsForLevel(selectedDigimon, statLevel);
        const typeColor =
          TYPE_COLORS[selectedDigimon.type || ""] ||
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
        const stageColor =
          STAGE_COLORS[selectedDigimon.stage || ""] ||
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

        return (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={closeDetails}
            />

            {/* Panel */}
            <div className="
              fixed z-40
              bottom-0 left-0 right-0 max-h-[85vh]
              md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[360px] md:h-full md:max-h-none
              bg-white dark:bg-dark-300
              shadow-2xl
              flex flex-col
              rounded-t-2xl md:rounded-none
              overflow-hidden
              animate-slide-up md:animate-slide-left
            ">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-dark-200 shrink-0">
                <div>
                  <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {selectedDigimon.name}
                  </h2>
                  <p className="text-xs font-body text-gray-500 dark:text-gray-400">
                    #{String(selectedDigimon.id).padStart(3, "0")} •{" "}
                    <span className={`font-semibold px-1.5 py-0.5 rounded-full text-xs ${stageColor}`}>
                      {selectedDigimon.stage}
                    </span>
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-dark-100 text-gray-500 dark:text-gray-400 transition-colors"
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
                      digimonName={selectedDigimon.name}
                      fallbackSpriteUrl={selectedDigimon.sprite_url}
                      size="md"
                      showHappinessAnimations={true}
                      enableHopping={false}
                    />
                  )}
                </div>

                {/* Type + Attribute badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedDigimon.type && (
                    <span className={`font-body text-xs font-semibold px-3 py-1 rounded-full ${typeColor}`}>
                      {selectedDigimon.type}
                    </span>
                  )}
                  {selectedDigimon.attribute && (
                    <span className="font-body text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {selectedDigimon.attribute}
                    </span>
                  )}
                </div>

                {/* Stat section */}
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
                              ? "bg-white dark:bg-dark-100 text-gray-800 dark:text-gray-200 shadow-sm"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
                            {evolutionPathsData.evolvesFrom.map((path: any) => {
                              const disc = isDiscovered(path.from_digimon.id);
                              return (
                                <div key={path.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 dark:bg-dark-200">
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
                                    {disc ? path.from_digimon.name : "???"}
                                  </span>
                                  <span className="text-xs font-body text-gray-400 dark:text-gray-500">
                                    Lv {path.level_required}
                                  </span>
                                </div>
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
                            {evolutionPathsData.evolvesTo.map((path: any) => {
                              const disc = isDiscovered(path.to_digimon.id);
                              return (
                                <div key={path.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 dark:bg-dark-200">
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
                                    {disc ? path.to_digimon.name : "???"}
                                  </span>
                                  <span className="text-xs font-body text-gray-400 dark:text-gray-500">
                                    Lv {path.level_required}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default DigimonDex;
