import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { TOURNAMENT_TEAM_POOL, TournamentTeamTemplate } from '../constants/tournamentBossTeams';
import DigimonSprite from '../components/DigimonSprite';
import TypeAttributeIcon from '../components/TypeAttributeIcon';
import { DigimonType, DigimonAttribute } from '../store/battleStore';
import { Copy, Check, X, Edit2, Trash2, Plus, Code } from 'lucide-react';

type SlotIndex = 0 | 1 | 2;

const STAGE_ORDER = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];

const teamDifficultyScore = (team: TournamentTeamTemplate): number => {
  const indices = team.digimon.map(d => {
    const s = DIGIMON_LOOKUP_TABLE[d.digimon_id];
    return s ? STAGE_ORDER.indexOf(s.stage) : 0;
  });
  return indices.reduce((a, b) => a + b, 0) / indices.length;
};

const difficultyLabel = (score: number): string => {
  const idx = Math.round(score);
  return STAGE_ORDER[Math.min(idx, STAGE_ORDER.length - 1)] ?? 'Unknown';
};

const STAGE_COLORS: Record<string, string> = {
  Baby: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'In-Training': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Rookie: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Champion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Ultimate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Mega: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Ultra: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-accent-500 transition-colors';
const selectCls = inputCls;
const btnPrimary = 'px-4 py-2 bg-indigo-600 dark:bg-accent-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-accent-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary = 'px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 text-sm font-medium transition-colors cursor-pointer';

const AdminTournamentTeamsPage = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  // ── Team list state ──────────────────────────────────────────────────────────
  const [teams, setTeams] = useState<TournamentTeamTemplate[]>(() =>
    TOURNAMENT_TEAM_POOL.map(t => ({ ...t, digimon: [...t.digimon] as TournamentTeamTemplate['digimon'] }))
  );

  // ── Builder state ─────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null); // null = create mode
  const [teamName, setTeamName] = useState('');
  const [slots, setSlots] = useState<[number | null, number | null, number | null]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<SlotIndex | null>(null);

  // ── Digimon browser state ─────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('');
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);

  // ── Export modal state ────────────────────────────────────────────────────────
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({ message: 'Admin access required', type: 'error' });
    }
  }, [isAdmin, navigate, addNotification]);

  if (!isAdmin) return null;

  // ── Derived data ──────────────────────────────────────────────────────────────
  const allDigimon = Object.values(DIGIMON_LOOKUP_TABLE);
  const stages = [...new Set(allDigimon.map(d => d.stage))].sort();
  const types = [...new Set(allDigimon.map(d => d.type))].sort();
  const attributes = [...new Set(allDigimon.map(d => d.attribute))].sort();

  // Usage count per digimon_id across all current teams
  const usageMap: Record<number, number> = {};
  for (const team of teams) {
    for (const d of team.digimon) {
      usageMap[d.digimon_id] = (usageMap[d.digimon_id] ?? 0) + 1;
    }
  }
  const unusedCount = allDigimon.filter(d => !usageMap[d.digimon_id]).length;

  const filtered = allDigimon.filter(d =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase())) &&
    (!stageFilter || d.stage === stageFilter) &&
    (!typeFilter || d.type === typeFilter) &&
    (!attributeFilter || d.attribute === attributeFilter) &&
    (!showUnusedOnly || !usageMap[d.digimon_id])
  );

  // Teams sorted easiest → hardest by average stage index
  const sortedTeams = [...teams].sort((a, b) => teamDifficultyScore(a) - teamDifficultyScore(b));

  // ── Builder helpers ───────────────────────────────────────────────────────────
  const resetBuilder = () => {
    setEditingId(null);
    setTeamName('');
    setSlots([null, null, null]);
    setActiveSlot(null);
  };

  const handleDigimonClick = (digimonId: number) => {
    if (activeSlot === null) {
      // Auto-find first empty slot
      const firstEmpty = slots.findIndex(s => s === null);
      if (firstEmpty === -1) return;
      const next = [...slots] as typeof slots;
      next[firstEmpty] = digimonId;
      setSlots(next);
      const nextEmpty = next.findIndex(s => s === null);
      setActiveSlot(nextEmpty === -1 ? null : nextEmpty as SlotIndex);
    } else {
      const next = [...slots] as typeof slots;
      next[activeSlot] = digimonId;
      setSlots(next);
      const nextEmpty = next.findIndex(s => s === null);
      setActiveSlot(nextEmpty === -1 ? null : nextEmpty as SlotIndex);
    }
  };

  const clearSlot = (i: SlotIndex) => {
    const next = [...slots] as typeof slots;
    next[i] = null;
    setSlots(next);
  };

  const saveTeam = () => {
    if (!teamName.trim()) {
      addNotification({ message: 'Team name is required', type: 'error' }); return;
    }
    if (slots.some(s => s === null)) {
      addNotification({ message: 'All 3 Digimon slots must be filled', type: 'error' }); return;
    }
    const id = editingId ?? teamName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const newTeam: TournamentTeamTemplate = {
      id,
      name: teamName.trim(),
      digimon: slots.map(s => ({ digimon_id: s! })) as TournamentTeamTemplate['digimon'],
    };
    if (editingId) {
      setTeams(prev => prev.map(t => t.id === editingId ? newTeam : t));
      addNotification({ message: `Team "${newTeam.name}" updated`, type: 'success' });
    } else {
      setTeams(prev => [...prev, newTeam]);
      addNotification({ message: `Team "${newTeam.name}" created`, type: 'success' });
    }
    resetBuilder();
  };

  const editTeam = (team: TournamentTeamTemplate) => {
    setEditingId(team.id);
    setTeamName(team.name);
    setSlots(team.digimon.map(d => d.digimon_id) as [number | null, number | null, number | null]);
    setActiveSlot(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    if (editingId === id) resetBuilder();
    addNotification({ message: 'Team deleted', type: 'info' });
  };

  // ── Export helpers ─────────────────────────────────────────────────────────────
  const generateTS = () => {
    const lines = teams.map(t => {
      const digiStr = t.digimon.map(d => `{ digimon_id: ${d.digimon_id} }`).join(', ');
      return `  { id: '${t.id}', name: '${t.name}', digimon: [${digiStr}] },`;
    }).join('\n');
    return `export const TOURNAMENT_TEAM_POOL: TournamentTeamTemplate[] = [\n${lines}\n];`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateTS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tournament Team Editor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Build curated teams for the weekly tournament pool. Copy TypeScript to update the constants file.
          </p>
        </div>
        <button onClick={() => setShowExport(true)} className={`${btnPrimary} flex items-center gap-2`}>
          <Code className="w-4 h-4" />
          Export TypeScript
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── LEFT: Digimon browser ───────────────────────────────────────────── */}
        <div className="w-[40%] shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Digimon Browser</h2>

            {activeSlot !== null && (
              <div className="mb-3 px-3 py-2 bg-indigo-50 dark:bg-accent-900/20 border border-indigo-200 dark:border-accent-700 rounded-lg text-xs text-indigo-700 dark:text-accent-300 font-medium">
                Click a Digimon to fill Slot {activeSlot + 1}
              </div>
            )}

            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={inputCls}
              />
              <div className="grid grid-cols-3 gap-2">
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className={selectCls}>
                  <option value="">All Stages</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
                  <option value="">All Types</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={attributeFilter} onChange={e => setAttributeFilter(e.target.value)} className={selectCls}>
                  <option value="">All Attrs</option>
                  {attributes.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} Digimon</p>
                <button
                  onClick={() => setShowUnusedOnly(v => !v)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer ${
                    showUnusedOnly
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-dark-400 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-dark-100 hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                >
                  Unused only ({unusedCount})
                </button>
              </div>
            </div>

            <div className="h-[520px] overflow-y-auto rounded-lg border border-gray-200 dark:border-dark-100">
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {filtered.map(d => {
                  const inSlot = slots.includes(d.digimon_id);
                  const useCount = usageMap[d.digimon_id] ?? 0;
                  return (
                    <button
                      key={d.digimon_id}
                      onClick={() => handleDigimonClick(d.digimon_id)}
                      className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all duration-150 text-left
                        ${inSlot
                          ? 'border-indigo-400 dark:border-accent-500 bg-indigo-50 dark:bg-accent-900/20'
                          : 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400 hover:border-indigo-300 dark:hover:border-accent-600 hover:bg-indigo-50/50 dark:hover:bg-accent-900/10'
                        }`}
                    >
                      {useCount > 0 && (
                        <span className="absolute top-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded bg-indigo-100 dark:bg-accent-900/40 text-indigo-600 dark:text-accent-400 leading-none">
                          ×{useCount}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8">
                          <DigimonSprite digimonName={d.name} fallbackSpriteUrl={d.sprite_url} size="xs" showHappinessAnimations={false} />
                        </div>
                        <TypeAttributeIcon type={d.type as DigimonType} attribute={d.attribute as DigimonAttribute} size="xs" showTooltip />
                      </div>
                      <p className="text-[10px] font-medium text-gray-800 dark:text-gray-200 text-center mt-1 leading-tight">{d.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 font-medium ${STAGE_COLORS[d.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.stage}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Builder + team list ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Builder card */}
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {editingId ? 'Edit Team' : 'Create New Team'}
            </h2>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Team Name</label>
              <input
                type="text"
                placeholder="e.g. Flame Sovereigns"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Digimon Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {([0, 1, 2] as SlotIndex[]).map(i => {
                  const species = slots[i] !== null ? DIGIMON_LOOKUP_TABLE[slots[i]!] : null;
                  const isActive = activeSlot === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveSlot(isActive ? null : i)}
                      className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-150 cursor-pointer
                        ${isActive
                          ? 'border-indigo-500 dark:border-accent-500 bg-indigo-50 dark:bg-accent-900/20'
                          : species
                            ? 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400'
                            : 'border-dashed border-gray-300 dark:border-dark-100 bg-gray-50 dark:bg-dark-400 hover:border-indigo-300 dark:hover:border-accent-600'
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">Slot {i + 1}</span>
                      {species ? (
                        <>
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-10">
                              <DigimonSprite digimonName={species.name} fallbackSpriteUrl={species.sprite_url} size="xs" showHappinessAnimations={false} />
                            </div>
                            <TypeAttributeIcon type={species.type as DigimonType} attribute={species.attribute as DigimonAttribute} size="xs" showTooltip />
                          </div>
                          <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200 mt-1 text-center leading-tight">{species.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 ${STAGE_COLORS[species.stage] ?? ''}`}>{species.stage}</span>
                          <button
                            onClick={e => { e.stopPropagation(); clearSlot(i); }}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-dark-200 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-100 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={saveTeam} className={btnPrimary}>
                {editingId ? 'Update Team' : 'Save Team'}
              </button>
              {editingId && (
                <button onClick={resetBuilder} className={btnSecondary}>Cancel</button>
              )}
            </div>
          </div>

          {/* Team list */}
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-100">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Team Pool <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({teams.length} teams)</span>
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Sorted easiest → hardest</p>
            </div>

            {teams.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">No teams yet. Create one above.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-100">
                {sortedTeams.map(team => {
                  const score = teamDifficultyScore(team);
                  const label = difficultyLabel(score);
                  const isMixed = team.digimon.some(d => {
                    const s = DIGIMON_LOOKUP_TABLE[d.digimon_id];
                    return s && STAGE_ORDER.indexOf(s.stage) !== Math.round(score);
                  });
                  return (
                    <div key={team.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors ${editingId === team.id ? 'bg-indigo-50 dark:bg-accent-900/10' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{team.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${STAGE_COLORS[label] ?? 'bg-gray-100 text-gray-600'}`}>
                          {isMixed ? `Mix · ${label}` : label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{team.id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {team.digimon.map((d, i) => {
                        const species = DIGIMON_LOOKUP_TABLE[d.digimon_id];
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className="flex items-center gap-0.5">
                              <div className="w-9 h-9">
                                {species && (
                                  <DigimonSprite digimonName={species.name} fallbackSpriteUrl={species.sprite_url} size="xs" showHappinessAnimations={false} />
                                )}
                              </div>
                              {species && (
                                <TypeAttributeIcon type={species.type as DigimonType} attribute={species.attribute as DigimonAttribute} size="sm" showTooltip />
                              )}
                            </div>
                            {species && (
                              <span className={`text-[8px] px-1 rounded-full leading-tight ${STAGE_COLORS[species.stage] ?? ''}`}>{species.stage}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => editTeam(team)}
                        aria-label="Edit team"
                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-accent-400 hover:bg-indigo-50 dark:hover:bg-accent-900/20 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        aria-label="Delete team"
                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-dark-100">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Export TypeScript</h3>
              <button onClick={() => setShowExport(false)} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Copy this and paste it into <code className="bg-gray-100 dark:bg-dark-400 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-accent-400">src/constants/tournamentBossTeams.ts</code> to replace the current <code className="bg-gray-100 dark:bg-dark-400 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-accent-400">TOURNAMENT_TEAM_POOL</code> export.
              </p>
              <pre className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto max-h-80 border border-gray-200 dark:border-dark-100 whitespace-pre-wrap break-all">
                {generateTS()}
              </pre>
              <div className="flex justify-end mt-4">
                <button onClick={handleCopy} className={`${btnPrimary} flex items-center gap-2`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournamentTeamsPage;
