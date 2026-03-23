import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useDigimonStore, UserDigimon, Digimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from '@/components/DigimonSprite';
import { Save } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-accent-500 transition-colors';
const selectCls = inputCls;
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

const AdminDigimonEditor = () => {
  const { isAdmin } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const navigate = useNavigate();

  const [selectedDigimon, setSelectedDigimon] = useState<UserDigimon | null>(null);
  const [editForm, setEditForm] = useState({
    digimon_id: 0,
    name: '',
    current_level: 1,
    hp_bonus: 0,
    sp_bonus: 0,
    atk_bonus: 0,
    def_bonus: 0,
    int_bonus: 0,
    spd_bonus: 0,
    abi: 0,
    happiness: 100,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('');

  const digimonList = Object.values(DIGIMON_LOOKUP_TABLE);
  const stages = [...new Set(digimonList.map((d) => d.stage))].sort();
  const types = [...new Set(digimonList.map((d) => d.type))].sort();
  const attributes = [...new Set(digimonList.map((d) => d.attribute))].sort();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      addNotification({ message: 'You do not have permission to access this page', type: 'error' });
    } else {
      fetchAllUserDigimon();
    }
  }, [isAdmin, navigate, addNotification, fetchAllUserDigimon]);

  useEffect(() => {
    if (selectedDigimon) {
      setEditForm({
        digimon_id: selectedDigimon.digimon_id,
        name: selectedDigimon.name,
        current_level: selectedDigimon.current_level,
        hp_bonus: selectedDigimon.hp_bonus,
        sp_bonus: selectedDigimon.sp_bonus,
        atk_bonus: selectedDigimon.atk_bonus,
        def_bonus: selectedDigimon.def_bonus,
        int_bonus: selectedDigimon.int_bonus,
        spd_bonus: selectedDigimon.spd_bonus,
        abi: selectedDigimon.abi || 0,
        happiness: selectedDigimon.happiness,
      });
    }
  }, [selectedDigimon]);

  const filteredDigimon = digimonList.filter(
    (d) =>
      (!searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString() === searchTerm) &&
      (!stageFilter || d.stage === stageFilter) &&
      (!typeFilter || d.type === typeFilter) &&
      (!attributeFilter || d.attribute === attributeFilter)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: typeof prev[name as keyof typeof prev] === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleDigimonSelection = (digimon: Digimon) => {
    setEditForm((prev) => ({ ...prev, digimon_id: digimon.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDigimon) {
      addNotification({ message: 'No Digimon selected for editing', type: 'error' });
      return;
    }
    try {
      const { error } = await supabase
        .from('user_digimon')
        .update({
          digimon_id: editForm.digimon_id,
          name: editForm.name,
          current_level: editForm.current_level,
          hp_bonus: editForm.hp_bonus,
          sp_bonus: editForm.sp_bonus,
          atk_bonus: editForm.atk_bonus,
          def_bonus: editForm.def_bonus,
          int_bonus: editForm.int_bonus,
          spd_bonus: editForm.spd_bonus,
          abi: editForm.abi,
          happiness: editForm.happiness,
        })
        .eq('id', selectedDigimon.id);
      if (error) throw error;
      addNotification({ message: 'Digimon updated successfully', type: 'success' });
      fetchAllUserDigimon();
    } catch (err) {
      console.error('Error updating Digimon:', err);
      addNotification({ message: 'Failed to update Digimon', type: 'error' });
    }
  };

  if (!isAdmin) return null;

  const speciesData = DIGIMON_LOOKUP_TABLE[editForm.digimon_id];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Digimon Editor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Edit individual user-owned Digimon stats and properties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Selection panels ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Species browser */}
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Species Browser
            </h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search by name or ID…"
                className={inputCls}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className={labelCls}>Stage</label>
                <select
                  className={selectCls}
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select
                  className={selectCls}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Attribute</label>
                <select
                  className={selectCls}
                  value={attributeFilter}
                  onChange={(e) => setAttributeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {attributes.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-dark-100">
              <div className="grid grid-cols-4 gap-1.5 p-2">
                {filteredDigimon.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDigimonSelection(d)}
                    className={`flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all duration-150
                      ${
                        editForm.digimon_id === d.id
                          ? 'border-indigo-400 dark:border-accent-500 bg-indigo-50 dark:bg-accent-900/20'
                          : 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400 hover:border-indigo-300 dark:hover:border-accent-600 hover:bg-gray-50 dark:hover:bg-dark-200'
                      }`}
                  >
                    <p className="text-[9px] text-gray-400 dark:text-gray-500">{d.id}</p>
                    <div className="w-8 h-8">
                      <DigimonSprite
                        digimonName={d.name}
                        fallbackSpriteUrl={d.sprite_url}
                        size="xs"
                        showHappinessAnimations={false}
                      />
                    </div>
                    <p className="text-[9px] font-medium text-gray-700 dark:text-gray-300 text-center mt-0.5 leading-tight">
                      {d.name}
                    </p>
                    <p className="text-[8px] text-gray-400 dark:text-gray-500">{d.stage}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Digimon list */}
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              User Digimon
            </h2>
            {allUserDigimon.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No Digimon found.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {allUserDigimon.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDigimon(d)}
                    className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-150
                      ${
                        selectedDigimon?.id === d.id
                          ? 'border-indigo-400 dark:border-accent-500 bg-indigo-50 dark:bg-accent-900/20'
                          : 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-400 hover:border-indigo-300 dark:hover:border-accent-600 hover:shadow-sm'
                      }`}
                  >
                    <DigimonSprite
                      digimonName={d.digimon?.name || ''}
                      fallbackSpriteUrl={d.digimon?.sprite_url || ''}
                      size="sm"
                      showHappinessAnimations={false}
                    />
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-center mt-1.5">
                      {d.name}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {DIGIMON_LOOKUP_TABLE[d.digimon_id]?.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Lv. {d.current_level}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Edit form ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Edit Digimon
          </h2>

          {!selectedDigimon ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <p className="text-sm">Select a Digimon from the list to edit.</p>
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="flex items-center gap-4 mb-5 p-3 rounded-lg bg-gray-50 dark:bg-dark-400 border border-gray-200 dark:border-dark-100">
                <DigimonSprite
                  digimonName={editForm.name}
                  fallbackSpriteUrl={
                    speciesData?.sprite_url || selectedDigimon.digimon?.sprite_url || ''
                  }
                  size="sm"
                  showHappinessAnimations={false}
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{editForm.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {speciesData?.name || selectedDigimon.digimon?.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {speciesData?.stage} · {speciesData?.type} · {speciesData?.attribute}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Level</label>
                    <input
                      type="number"
                      name="current_level"
                      value={isNaN(editForm.current_level) ? '' : editForm.current_level}
                      onChange={handleInputChange}
                      min="1"
                      max="99"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Bonus Stats
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['hp', 'sp', 'atk', 'def', 'int', 'spd'] as const).map((stat) => (
                      <div key={stat}>
                        <label className={labelCls}>{stat.toUpperCase()} Bonus</label>
                        <input
                          type="number"
                          name={`${stat}_bonus`}
                          value={
                            isNaN(editForm[`${stat}_bonus` as keyof typeof editForm] as number)
                              ? ''
                              : editForm[`${stat}_bonus` as keyof typeof editForm]
                          }
                          onChange={handleInputChange}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ABI</label>
                    <input
                      type="number"
                      name="abi"
                      value={isNaN(editForm.abi) ? '' : editForm.abi}
                      onChange={handleInputChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Happiness</label>
                    <input
                      type="number"
                      name="happiness"
                      value={isNaN(editForm.happiness) ? '' : editForm.happiness}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-accent-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-accent-700 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDigimonEditor;
