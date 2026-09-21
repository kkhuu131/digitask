import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, Plus, Swords, WandSparkles, Ticket } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { selectStrongestTeam } from '../utils/selectStrongestTeam';
import { UserDigimon } from '../store/petStore';
import { DigimonType, DigimonAttribute } from '../store/battleStore';
import { calculateFinalStats } from '../utils/digimonStatCalculation';
import DigimonSprite from './DigimonSprite';
import TypeAttributeIcon from './TypeAttributeIcon';
import type { Strategy } from '../engine/arenaTypes';
import { LoadingSpinner } from './LoadingIndicator';
import DigimonStatRow from './DigimonStatRow';
import { ReadySprite } from './BattleFighterPreview';
import FighterIdentity from './DigimonCardIdentity';

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
  onConfirm: (team: UserDigimon[], strategies: Strategy[]) => void;
  onBack: () => void;
  loading?: boolean;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

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
  const reducedMotion = useReducedMotion();

  return (
    <Dialog
      open
      onClose={onClose}
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 40 }}
        className="relative z-10 w-full sm:max-w-3xl bg-white dark:bg-dark-300 rounded-xl shadow-2xl flex flex-col max-h-[90dvh]"
      >
        <Dialog.Panel className="flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-100 flex-shrink-0">
            <Dialog.Title className="ui-section-title">Choose Digimon</Dialog.Title>
            <button onClick={onClose} aria-label="Close Digimon picker" className="ui-icon-button">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Left: Party grid */}
            <div className="max-h-[30dvh] border-b border-gray-100 dark:border-dark-100 overflow-y-auto p-4">
              {partyDigimon.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  No Digimon in party
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {partyDigimon.map((d) => {
                    const used = isUsedElsewhere(d);
                    const isPreviewing = preview?.id === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => !used && setPreview(d)}
                        disabled={used}
                        aria-pressed={isPreviewing}
                        className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all ${
                          isPreviewing
                            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                            : used
                              ? 'border-gray-200 dark:border-dark-100 opacity-40 cursor-not-allowed bg-gray-50 dark:bg-dark-400'
                              : 'border-gray-200 dark:border-dark-100 hover:border-accent-300 dark:hover:border-accent-600 bg-white dark:bg-dark-400 cursor-pointer'
                        }`}
                      >
                        <div className="h-20 flex items-center justify-center">
                          <DigimonSprite
                            digimonName={d.digimon?.name ?? ''}
                            fallbackSpriteUrl={d.digimon?.sprite_url ?? ''}
                            size="sm"
                            showHappinessAnimations={!reducedMotion}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 break-words w-full text-center">
                          {d.name || d.digimon?.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Lv.{d.current_level}
                        </span>
                        {d.digimon?.type && d.digimon?.attribute && (
                          <TypeAttributeIcon
                            type={d.digimon.type as DigimonType}
                            attribute={d.digimon.attribute as DigimonAttribute}
                            size="sm"
                          />
                        )}
                        {used && (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            In team
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Detail panel */}
            <div className="p-4 sm:p-6">
              {preview ? (
                <>
                  {/* Identity row */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-2/5 flex flex-col items-center text-center min-w-0">
                      <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center mb-3">
                        <DigimonSprite
                          digimonName={preview.digimon?.name ?? ''}
                          fallbackSpriteUrl={preview.digimon?.sprite_url ?? ''}
                          happiness={preview.happiness}
                          size="lg"
                          showHappinessAnimations={!reducedMotion}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading text-xl font-semibold dark:text-gray-100 break-words">
                          {preview.name || preview.digimon?.name}
                        </div>
                        {preview.name &&
                          preview.digimon?.name &&
                          preview.name !== preview.digimon.name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {preview.digimon.name}
                            </div>
                          )}
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Lv. {preview.current_level}
                          </span>
                          {preview.personality && (
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {preview.personality}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Type / Attribute */}
                      {preview.digimon?.type && preview.digimon?.attribute && (
                        <div className="mt-3 flex justify-center">
                          <TypeAttributeIcon
                            type={preview.digimon.type as DigimonType}
                            attribute={preview.digimon.attribute as DigimonAttribute}
                            size="sm"
                            showLabel={true}
                          />
                        </div>
                      )}
                    </div>

                    {/* Stats grid */}
                    {stats && (
                      <div className="sm:w-3/5 min-w-0">
                        <h4 className="ui-section-title mb-3">Stats</h4>
                        <div className="space-y-3">
                          <DigimonStatRow
                            label="HP"
                            value={stats.hp}
                            bonus={preview.hp_bonus}
                            maxReference={preview.digimon?.hp_level99 ?? 2000}
                          />
                          <DigimonStatRow
                            label="SP"
                            value={stats.sp}
                            bonus={preview.sp_bonus}
                            maxReference={preview.digimon?.sp_level99 ?? 600}
                          />
                          <DigimonStatRow
                            label="ATK"
                            value={stats.atk}
                            bonus={preview.atk_bonus}
                            maxReference={preview.digimon?.atk_level99 ?? 600}
                          />
                          <DigimonStatRow
                            label="DEF"
                            value={stats.def}
                            bonus={preview.def_bonus}
                            maxReference={preview.digimon?.def_level99 ?? 600}
                          />
                          <DigimonStatRow
                            label="INT"
                            value={stats.int}
                            bonus={preview.int_bonus}
                            maxReference={preview.digimon?.int_level99 ?? 600}
                          />
                          <DigimonStatRow
                            label="SPD"
                            value={stats.spd}
                            bonus={preview.spd_bonus}
                            maxReference={preview.digimon?.spd_level99 ?? 600}
                          />
                          <DigimonStatRow label="ABI" value={preview.abi ?? 0} maxReference={200} />
                        </div>
                      </div>
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
          {preview && (
            <div className="shrink-0 border-t border-gray-100 dark:border-dark-100 p-4 flex justify-end">
              <button
                onClick={() => onSelect(preview)}
                disabled={isUsedElsewhere(preview)}
                className="btn-primary"
              >
                {isUsedElsewhere(preview) ? 'Already on team' : 'Add to Team'}
              </button>
            </div>
          )}
        </Dialog.Panel>
      </motion.div>
    </Dialog>
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

  const handleSlotClick = (index: number) => {
    if (!loading) setPickerSlot(index);
  };

  const handlePickerSelect = (digimon: UserDigimon) => {
    if (pickerSlot === null) return;
    const next = [...slots];
    next[pickerSlot] = digimon;
    setSlots(next);
    setPickerSlot(null);
  };

  const handleRemoveSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    const next = [...slots];
    next[index] = null;
    setSlots(next);
  };

  const handleConfirm = () => {
    const team = slots.filter(Boolean) as UserDigimon[];
    if (team.length === 0 || loading) return;
    onConfirm(
      team,
      team.map(() => 'balanced')
    );
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
        <button onClick={onBack} disabled={loading} className="btn-secondary">
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
            <span className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full font-semibold">
              <Ticket className="h-4 w-4" aria-hidden="true" />
              {costLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="ui-page-header">
        <div>
          <h2 className="ui-page-title">Ready for battle</h2>
          <p className="ui-description mt-1">Choose up to three Digimon to face {opponentName}.</p>
        </div>
      </div>

      <div className="ui-panel mb-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_48px_1fr]">
          <section className="min-w-0 p-3 sm:p-5" aria-label="Your team">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="ui-section-title">Your team</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {teamSize} / 3 selected
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || selectStrongestTeam(partyDigimon).length === 0}
                title="Pick up to three party Digimon by combat stats"
                onClick={() => {
                  const team = selectStrongestTeam(partyDigimon);
                  setSlots([team[0] ?? null, team[1] ?? null, team[2] ?? null]);
                  setPickerSlot(null);
                }}
              >
                <WandSparkles className="h-4 w-4" aria-hidden="true" />
                Auto-fill strongest
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {slots.map((d, i) => (
                <div key={i} className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => handleSlotClick(i)}
                    disabled={loading}
                    aria-label={
                      d
                        ? `Change ${d.name || d.digimon?.name} in slot ${i + 1}`
                        : `Add Digimon to slot ${i + 1}`
                    }
                    className={`w-full min-h-56 rounded-xl border flex flex-col items-center px-1 sm:px-2 pt-6 pb-4 transition-colors disabled:cursor-wait ${
                      d
                        ? 'border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/10 hover:border-accent-500'
                        : 'border-dashed border-gray-300 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 hover:border-accent-500'
                    }`}
                  >
                    {d ? (
                      <>
                        <ReadySprite
                          name={d.digimon?.name ?? ''}
                          url={d.digimon?.sprite_url ?? ''}
                        />
                        <FighterIdentity
                          name={d.name || d.digimon?.name || 'Digimon'}
                          level={d.current_level}
                          type={d.digimon?.type}
                          attribute={d.digimon?.attribute}
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex h-28 sm:h-32 items-center justify-center">
                          <Plus
                            className="h-8 w-8 text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Add Digimon
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Slot {i + 1}
                        </span>
                      </>
                    )}
                  </button>
                  {d && (
                    <button
                      type="button"
                      aria-label={`Remove ${d.name || d.digimon?.name || 'Digimon'} from team`}
                      disabled={loading}
                      onClick={(e) => handleRemoveSlot(i, e)}
                      className="ui-icon-button absolute right-0 top-0 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Select a slot to choose or change a fighter.
            </p>
          </section>

          <div
            className="flex items-center justify-center gap-3 px-3 lg:px-0 py-2"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-gray-200 dark:bg-dark-100 lg:hidden" />
            <span className="font-heading text-xl font-semibold text-gray-500 dark:text-gray-400">
              VS
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-dark-100 lg:hidden" />
          </div>

          <section className="min-w-0 p-3 sm:p-5" aria-label="Opponent team">
            <div className="mb-3 min-h-16 flex flex-col justify-center">
              <h3 className="ui-section-title">Opponent</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-words">
                {opponentName}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {opponentTeam.map((d, i) => (
                <div
                  key={i}
                  className="min-w-0 min-h-56 rounded-xl border border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 flex flex-col items-center px-1 sm:px-2 pt-6 pb-4"
                >
                  <ReadySprite name={d.name} url={d.sprite_url} opponent />
                  <FighterIdentity
                    name={d.name}
                    level={d.current_level}
                    type={d.type}
                    attribute={d.attribute}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {opponentTeam.length} {opponentTeam.length === 1 ? 'fighter' : 'fighters'} ready
            </p>
          </section>
        </div>
      </div>

      <div className="ui-panel flex flex-wrap items-center justify-between gap-4 p-4">
        <div aria-live="polite">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {teamSize === 0 ? 'Choose your fighters' : `${teamSize} Digimon ready to battle`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isFree
              ? 'Free battle'
              : costLabel
                ? `Battle cost: ${costLabel}`
                : 'Your team is ready when you are.'}
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={teamSize === 0 || loading}
          aria-busy={loading}
          className="btn-primary shrink-0"
        >
          {loading ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Swords className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{loading ? 'Starting…' : confirmLabel}</span>
        </button>
      </div>

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
