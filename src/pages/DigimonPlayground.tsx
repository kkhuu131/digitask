import React, { useState, useEffect } from 'react';
import { xpForNextLevel } from '../utils/digimonStatCalculation';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import DigimonSprite from '../components/DigimonSprite';
import TypeAttributeIcon from '../components/TypeAttributeIcon';
import DigimonDetailModal from '../components/DigimonDetailModal';
import { Star, Warehouse, UserPlus, Plus, Users } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingIndicator';

const FarmCardControl = ({
  status,
  label,
  busy,
  icon,
  onClick,
}: {
  status?: 'Active' | 'Full';
  label: string;
  busy: boolean;
  icon: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) =>
  status && !busy ? (
    <div className="ui-card-action mt-1">
      <span
        className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-dark-100 dark:text-gray-400"
        title={status === 'Active' ? "Can't send active Digimon to Farm" : 'Party is full'}
      >
        {status}
      </span>
    </div>
  ) : (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      aria-busy={busy}
      title={label}
      className="ui-card-action group mt-1 disabled:cursor-wait"
    >
      <span className="flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700 transition-colors group-hover:bg-accent-100 group-hover:text-accent-800 group-disabled:opacity-60 dark:bg-dark-100 dark:text-gray-300 dark:group-hover:bg-accent-900/30 dark:group-hover:text-accent-300">
        {busy ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon}
            <span>{label === 'Send to DigiFarm' ? 'Farm' : 'Party'}</span>
          </>
        )}
      </span>
    </button>
  );

const DigimonPlayground: React.FC = () => {
  const {
    allUserDigimon,
    storageDigimon,
    fetchAllUserDigimon,
    fetchStorageDigimon,
    moveToStorage,
    moveToActiveParty,
    setActiveDigimon,
    activePartyCount,
    maxActivePartySize,
  } = useDigimonStore();

  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);
  const [transferringDigimon, setTransferringDigimon] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUserDigimon();
    fetchStorageDigimon();
  }, [fetchAllUserDigimon, fetchStorageDigimon]);

  const handleTransferToStorage = async (e: React.MouseEvent, digimonId: string) => {
    e.stopPropagation();
    setTransferringDigimon(digimonId);
    await moveToStorage(digimonId);
    setTransferringDigimon(null);
  };

  const handleTransferToActiveParty = async (e: React.MouseEvent, digimonId: string) => {
    e.stopPropagation();
    setTransferringDigimon(digimonId);
    await moveToActiveParty(digimonId);
    setTransferringDigimon(null);
  };

  const handleSetActive = async (digimonId: string) => {
    await setActiveDigimon(digimonId);
  };

  const getExpProgress = (digimon: UserDigimon) => {
    const expForCurrentLevel = xpForNextLevel(digimon.current_level);
    return Math.min(100, (digimon.experience_points / expForCurrentLevel) * 100);
  };

  const partyDigimon = allUserDigimon
    .filter((d) => !d.is_in_storage)
    .sort((a, b) => {
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      return 0;
    });

  const emptyPartySlots = maxActivePartySize - partyDigimon.length;

  const tutorialSteps: DialogueStep[] = [
    { speaker: 'neemon', text: 'Oh hey, tamer! Welcome to the DigiFarm!' },
    {
      speaker: 'bokomon',
      text: 'This is the DigiFarm — manage your party and storage all in one place!',
    },
    {
      speaker: 'neemon',
      text: 'Your party can hold up to 9 Digimon. The rest hang out in the DigiFarm.',
    },
    {
      speaker: 'bokomon',
      text: 'Click any Digimon to view their full details, stats, and evolution options!',
    },
    {
      speaker: 'neemon',
      text: 'Use the buttons to swap Digimon between your party and storage. Easy!',
    },
  ];

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="ui-page-title">DigiFarm</h1>
        <p className="text-sm font-body text-gray-500 dark:text-gray-400 mt-1">
          Manage your party and storage — click any Digimon to view details
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── Left: Party Panel ── */}
        <div className="w-full lg:w-[368px] flex-shrink-0">
          <div className="card">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <h2 className="font-heading font-semibold text-gray-800 dark:text-gray-100">
                    Active Party
                  </h2>
                </div>
                <p className="text-xs font-body text-gray-400 dark:text-gray-500 mt-0.5">
                  {partyDigimon.length} / {maxActivePartySize} Digimon
                </p>
              </div>
            </div>

            {/* Party grid — always 3 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {partyDigimon.map((digimon) => (
                <motion.div
                  key={digimon.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDetailDigimon(digimon)}
                  className={`relative rounded-xl border cursor-pointer transition-colors min-h-44 flex flex-col overflow-hidden ${
                    digimon.is_active
                      ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-300 dark:border-accent-700'
                      : 'bg-gray-50 dark:bg-dark-200 border-gray-200 dark:border-dark-400 hover:border-accent-400 dark:hover:border-accent-600'
                  }`}
                >
                  {/* Active star */}
                  {digimon.is_active && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <Star className="w-3 h-3 text-accent-600 dark:text-accent-400 fill-current" />
                    </div>
                  )}

                  {/* Type icon */}
                  {digimon.digimon?.type && digimon.digimon?.attribute && (
                    <div className="absolute top-1 right-1 z-10">
                      <TypeAttributeIcon
                        type={digimon.digimon.type as any}
                        attribute={digimon.digimon.attribute as any}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Sprite — fills remaining space */}
                  <div className="flex-1 flex items-center justify-center min-h-0 pt-1">
                    <DigimonSprite
                      digimonName={digimon.digimon?.name || ''}
                      fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                      size="xs"
                      showHappinessAnimations={true}
                    />
                  </div>

                  {/* Bottom info + button */}
                  <div className="px-2 pb-2">
                    <p
                      className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate"
                      title={digimon.name || digimon.digimon?.name}
                    >
                      {digimon.name || digimon.digimon?.name}
                    </p>
                    {/* Level + EXP bar */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {digimon.current_level}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-dark-100 rounded-full h-0.5 overflow-hidden">
                        <div
                          className="bg-purple-400 h-full transition-all"
                          style={{ width: `${getExpProgress(digimon)}%` }}
                        />
                      </div>
                    </div>

                    {/* Send to Farm button */}
                    <FarmCardControl
                      status={digimon.is_active ? 'Active' : undefined}
                      label="Send to DigiFarm"
                      busy={transferringDigimon === digimon.id}
                      icon={<Warehouse className="h-3 w-3" />}
                      onClick={(e) => handleTransferToStorage(e, digimon.id)}
                    />
                  </div>
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: emptyPartySlots }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-100 aspect-square flex flex-col items-center justify-center gap-1"
                >
                  <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-body text-gray-500 dark:text-gray-400">Empty</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: DigiFarm Storage Panel ── */}
        <div className="flex-1">
          <div className="card">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <h2 className="font-heading font-semibold text-gray-800 dark:text-gray-100">
                    DigiFarm Storage
                  </h2>
                </div>
                <p className="text-xs font-body text-gray-400 dark:text-gray-500 mt-0.5">
                  {storageDigimon.length} Digimon in storage
                  {activePartyCount >= maxActivePartySize && (
                    <span className="ml-2 text-amber-500 dark:text-amber-400">— Party is full</span>
                  )}
                </p>
              </div>
            </div>

            {/* Storage grid — square cards */}
            {storageDigimon.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center mb-3">
                  <Warehouse className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-sm font-body font-medium text-gray-400 dark:text-gray-500">
                  DigiFarm is empty
                </p>
                <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-1">
                  Digimon sent from your party will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
                {storageDigimon.map((digimon) => (
                  <motion.div
                    key={digimon.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDetailDigimon(digimon)}
                    className="relative bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-400 hover:border-accent-400 dark:hover:border-accent-600 cursor-pointer transition-colors min-h-44 flex flex-col overflow-hidden"
                  >
                    {/* Type icon */}
                    {digimon.digimon?.type && digimon.digimon?.attribute && (
                      <div className="absolute top-1 right-1 z-10">
                        <TypeAttributeIcon
                          type={digimon.digimon.type as any}
                          attribute={digimon.digimon.attribute as any}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Sprite */}
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-1">
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ''}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                        size="xs"
                        showHappinessAnimations={true}
                      />
                    </div>

                    {/* Bottom info + button */}
                    <div className="px-2 pb-2">
                      <p
                        className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate"
                        title={digimon.name || digimon.digimon?.name}
                      >
                        {digimon.name || digimon.digimon?.name}
                      </p>
                      {/* Level + EXP bar */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {digimon.current_level}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-dark-100 rounded-full h-0.5 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full transition-all"
                            style={{ width: `${getExpProgress(digimon)}%` }}
                          />
                        </div>
                      </div>

                      {/* Add to Party button */}
                      <FarmCardControl
                        status={activePartyCount >= maxActivePartySize ? 'Full' : undefined}
                        label="Add to Party"
                        busy={transferringDigimon === digimon.id}
                        icon={<UserPlus className="h-3 w-3" />}
                        onClick={(e) => handleTransferToActiveParty(e, digimon.id)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digimon Detail Modal */}
      {selectedDetailDigimon && (
        <DigimonDetailModal
          selectedDigimon={selectedDetailDigimon}
          onClose={() => setSelectedDetailDigimon(null)}
          onSetActive={handleSetActive}
          className="z-40"
        />
      )}

      <PageTutorial tutorialId="digifarm_intro" steps={tutorialSteps} />
    </div>
  );
};

export default DigimonPlayground;
