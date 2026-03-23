import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Plus, Swords } from 'lucide-react';
import { UserDigimon } from '../store/petStore';
import { DigimonType, DigimonAttribute } from '../store/battleStore';
import { calculateFinalStats } from '../utils/digimonStatCalculation';
import DigimonSprite from './DigimonSprite';
import TypeAttributeIcon from './TypeAttributeIcon';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface OpponentDigimonPreview {
  name: string;
  current_level: number;
  sprite_url: string;
  type?: string;
  attribute?: string;
}

export interface BattleTeamSelectorProps {
  opponentName: string;
  opponentTeam: OpponentDigimonPreview[];
  /** All non-storage party Digimon the user can pick from */
  partyDigimon: UserDigimon[];
  /** e.g. "Round 1 · Quarterfinal" or "Hard · Wild Digimon" */
  contextLabel?: string;
  /** When true, shows a "Free" badge and hides costLabel */
  isFree?: boolean;
  /** e.g. "1 ticket" — shown as a cost badge when isFree is false */
  costLabel?: string;
  confirmLabel?: string;
  onConfirm: (team: UserDigimon[]) => void;
  onBack: () => void;
  loading?: boolean;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

const StatPill = ({ label, value }: { label: string; value: number | string }) => (
  <div className="flex flex-col items-center px-2 py-1.5 bg-gray-50 dark:bg-dark-400 rounded-lg text-center min-w-0">
    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
      {label}
    </span>
    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</span>
  </div>
);

// ─── Digimon Picker Modal ─────────────────────────────────────────────────────

interface PickerModalProps {
  partyDigimon: UserDigimon[];
  /** IDs of Digimon already placed in OTHER slots */
  alreadySelected: string[];
  /** Digimon currently in this slot (can be previewed / replaced) */
  currentSlotDigimon: UserDigimon | null;
  onSelect: (d: UserDigimon) => void;
  onClose: () => void;
}

const DigimonPickerModal: React.FC<PickerModalProps> = ({
  partyDigimon,
  alreadySelected,
  currentSlotDigimon,
  onSelect,
  onClose,
}) => {
  const defaultPreview = currentSlotDigimon ?? (partyDigimon.length > 0 ? partyDigimon[0] : null);
  const [preview, setPreview] = useState<UserDigimon | null>(defaultPreview);

  const isUsedElsewhere = (d: UserDigimon) => alreadySelected.includes(d.id);
  const stats = preview ? calculateFinalStats(preview) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative z-10 w-full sm:max-w-3xl bg-white dark:bg-dark-300 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-100 flex-shrink-0">
          <h3 className="font-heading font-semibold text-lg dark:text-gray-100">Choose Digimon</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col sm:flex-row overflow-hidden">
          {/* Left: Party grid */}
          <div className="sm:w-80 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-dark-100 overflow-y-auto p-3">
            {partyDigimon.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                No Digimon in party
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2">
                {partyDigimon.map((d) => {
                  const used = isUsedElsewhere(d);
                  const isPreviewing = preview?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => !used && setPreview(d)}
                      className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all ${
                        isPreviewing
                          ? 'border-indigo-500 dark:border-accent-500 bg-indigo-50 dark:bg-accent-900/20'
                          : used
                            ? 'border-gray-200 dark:border-dark-100 opacity-40 cursor-not-allowed bg-gray-50 dark:bg-dark-400'
                            : 'border-gray-200 dark:border-dark-100 hover:border-indigo-300 dark:hover:border-accent-600 bg-white dark:bg-dark-400 cursor-pointer'
                      }`}
                    >
                      {used && (
                        <div className="absolute inset-0 flex items-end justify-center pb-1 z-10 rounded-xl">
                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-dark-300/90 px-1 py-0.5 rounded">
                            In team
                          </span>
                        </div>
                      )}
                      <div className="w-11 h-11 flex items-center justify-center">
                        <DigimonSprite
                          digimonName={d.digimon?.name ?? ''}
                          fallbackSpriteUrl={d.digimon?.sprite_url ?? ''}
                          size="xs"
                          showHappinessAnimations={false}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center leading-tight">
                        {d.name || d.digimon?.name}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500">
                        Lv.{d.current_level}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
            {preview ? (
              <>
                {/* Identity row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    <DigimonSprite
                      digimonName={preview.digimon?.name ?? ''}
                      fallbackSpriteUrl={preview.digimon?.sprite_url ?? ''}
                      happiness={preview.happiness}
                      size="md"
                      showHappinessAnimations={true}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold dark:text-gray-100 truncate">
                      {preview.name || preview.digimon?.name}
                    </div>
                    {preview.name &&
                      preview.digimon?.name &&
                      preview.name !== preview.digimon.name && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {preview.digimon.name}
                        </div>
                      )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                        Lv. {preview.current_level}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                        ABI {preview.abi ?? 0}
                      </span>
                      {preview.personality && (
                        <span className="text-xs px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full font-medium">
                          {preview.personality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type / Attribute */}
                {preview.digimon?.type && preview.digimon?.attribute && (
                  <div className="mb-4 flex">
                    <TypeAttributeIcon
                      type={preview.digimon.type as DigimonType}
                      attribute={preview.digimon.attribute as DigimonAttribute}
                      size="sm"
                      showLabel={true}
                    />
                  </div>
                )}

                {/* Stats grid */}
                {stats && (
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    <StatPill label="HP" value={stats.hp} />
                    <StatPill label="SP" value={stats.sp} />
                    <StatPill label="ATK" value={stats.atk} />
                    <StatPill label="DEF" value={stats.def} />
                    <StatPill label="INT" value={stats.int} />
                    <StatPill label="SPD" value={stats.spd} />
                  </div>
                )}

                {/* Confirm */}
                <div className="mt-auto pt-3">
                  {isUsedElsewhere(preview) ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-gray-200 dark:bg-dark-100 text-gray-400 dark:text-gray-500 font-semibold cursor-not-allowed text-sm"
                    >
                      Already on team
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelect(preview)}
                      className="w-full py-3 rounded-xl bg-indigo-500 dark:bg-accent-600 hover:bg-indigo-600 dark:hover:bg-accent-700 text-white font-semibold transition-colors text-sm"
                    >
                      Add to Team
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                Select a Digimon to preview
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BattleTeamSelector: React.FC<BattleTeamSelectorProps> = ({
  opponentName,
  opponentTeam,
  partyDigimon,
  contextLabel,
  isFree = false,
  costLabel,
  confirmLabel = 'Fight',
  onConfirm,
  onBack,
  loading = false,
}) => {
  const [slots, setSlots] = useState<(UserDigimon | null)[]>([null, null, null]);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  const teamSize = slots.filter(Boolean).length;

  const handleSlotClick = (index: number) => setPickerSlot(index);

  const handlePickerSelect = (digimon: UserDigimon) => {
    if (pickerSlot === null) return;
    const next = [...slots];
    next[pickerSlot] = digimon;
    setSlots(next);
    setPickerSlot(null);
  };

  const handleRemoveSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...slots];
    next[index] = null;
    setSlots(next);
  };

  const handleConfirm = () => {
    const team = slots.filter(Boolean) as UserDigimon[];
    if (team.length === 0) return;
    onConfirm(team);
  };

  // Exclude Digimon in other slots from the picker's "already selected" list
  const alreadySelectedForPicker =
    pickerSlot !== null
      ? (slots.filter((_, i) => i !== pickerSlot).filter(Boolean) as UserDigimon[]).map((d) => d.id)
      : [];

  return (
    <motion.div
      key="battle-team-selector"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full"
    >
      {/* Back + context */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {contextLabel && (
          <>
            <span className="text-gray-300 dark:text-dark-100 select-none">|</span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {contextLabel}
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isFree ? (
            <span className="text-xs px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold">
              Free
            </span>
          ) : costLabel ? (
            <span className="text-xs px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full font-semibold">
              {costLabel}
            </span>
          ) : null}
        </div>
      </div>

      {/* VS layout */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_52px_1fr] gap-4 items-stretch mb-6">
        {/* Your team */}
        <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-200 dark:border-dark-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Your Team
          </h3>
          <div className="flex gap-3 justify-center">
            {slots.map((d, i) => (
              <div
                key={i}
                onClick={() => handleSlotClick(i)}
                className={`relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none ${
                  d
                    ? 'border-indigo-300 dark:border-accent-600 bg-indigo-50 dark:bg-accent-900/20 hover:border-indigo-400 dark:hover:border-accent-500'
                    : 'border-dashed border-gray-300 dark:border-dark-100 hover:border-indigo-300 dark:hover:border-accent-600 hover:bg-indigo-50/40 dark:hover:bg-accent-900/10'
                }`}
              >
                {d ? (
                  <>
                    <button
                      onClick={(e) => handleRemoveSlot(i, e)}
                      className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-gray-200 dark:bg-dark-100 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors group"
                    >
                      <X className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <DigimonSprite
                        digimonName={d.digimon?.name ?? ''}
                        fallbackSpriteUrl={d.digimon?.sprite_url ?? ''}
                        size="xs"
                        showHappinessAnimations={false}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full px-1 leading-tight">
                      {d.name || d.digimon?.name}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                      Lv.{d.current_level}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-gray-300 dark:text-dark-100" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Add</span>
                  </>
                )}
              </div>
            ))}
          </div>
          {teamSize === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
              Click a slot to add Digimon
            </p>
          )}
        </div>

        {/* VS divider — desktop */}
        <div className="hidden sm:flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center">
            <Swords className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <span className="mt-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            VS
          </span>
        </div>

        {/* VS divider — mobile */}
        <div className="flex sm:hidden items-center gap-3 -my-1">
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-200">
            <Swords className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              VS
            </span>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
        </div>

        {/* Opponent */}
        <div className="bg-gray-50 dark:bg-dark-400 rounded-2xl border border-gray-200 dark:border-dark-100 p-5">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
            Opponent
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate font-medium">
            {opponentName}
          </p>
          <div className="flex gap-3 justify-center">
            {opponentTeam.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 w-16 sm:w-20">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={d.name}
                    fallbackSpriteUrl={d.sprite_url}
                    size="sm"
                    showHappinessAnimations={false}
                  />
                  {d.type && d.attribute && (
                    <div className="absolute top-0 right-0">
                      <TypeAttributeIcon
                        type={d.type as DigimonType}
                        attribute={d.attribute as DigimonAttribute}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full leading-tight">
                  {d.name}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                  Lv.{d.current_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fight button */}
      <button
        onClick={handleConfirm}
        disabled={teamSize === 0 || loading}
        className="w-full py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-500 dark:bg-accent-600 hover:bg-indigo-600 dark:hover:bg-accent-700 active:scale-[0.99] text-white shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none flex items-center justify-center gap-3"
      >
        {loading ? (
          <span>Starting…</span>
        ) : (
          <>
            <Swords className="w-5 h-5" />
            <span>{confirmLabel}</span>
            {/* {teamSize > 0 && (
              <span className="text-indigo-200 dark:text-accent-300 font-normal text-base">
                ({teamSize} Digimon)
              </span>
            )} */}
            {!isFree && costLabel && (
              <span className="text-sm font-normal px-2 py-0.5 bg-white/20 rounded-full">
                {costLabel}
              </span>
            )}
          </>
        )}
      </button>

      {/* Picker modal */}
      <AnimatePresence>
        {pickerSlot !== null && (
          <DigimonPickerModal
            partyDigimon={partyDigimon}
            alreadySelected={alreadySelectedForPicker}
            currentSlotDigimon={slots[pickerSlot]}
            onSelect={handlePickerSelect}
            onClose={() => setPickerSlot(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BattleTeamSelector;
