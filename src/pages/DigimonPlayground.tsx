import React, { useState, useEffect } from 'react';
import { xpForNextLevel } from '../utils/digimonStatCalculation';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { motion } from 'framer-motion';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import DigimonSprite from '../components/DigimonSprite';
import TypeAttributeIcon from '../components/TypeAttributeIcon';
import DigimonDetailModal from '../components/DigimonDetailModal';
import { Star, Warehouse, UserPlus, Plus, Loader2, Users } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold dark:text-gray-100">DigiFarm</h1>
        <p className="text-sm font-body text-gray-500 dark:text-gray-400 mt-1">
          Manage your party and storage — click any Digimon to view details
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── Left: Party Panel ── */}
        <div className="w-full lg:w-[368px] flex-shrink-0">
          <div className="card dark:bg-dark-300 dark:border-dark-200">
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
            <div className="grid grid-cols-3 gap-2">
              {partyDigimon.map((digimon) => (
                <motion.div
                  key={digimon.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDetailDigimon(digimon)}
                  className={`relative rounded-xl border cursor-pointer transition-all aspect-square flex flex-col overflow-hidden ${
                    digimon.is_active
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                      : 'bg-gray-50 dark:bg-dark-200 border-gray-200 dark:border-dark-400 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {/* Active star */}
                  {digimon.is_active && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
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
                  <div className="px-1.5 pb-1.5">
                    {/* Level + EXP bar */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
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
                    <button
                      onClick={(e) => handleTransferToStorage(e, digimon.id)}
                      disabled={digimon.is_active || transferringDigimon === digimon.id}
                      className={`mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
                        digimon.is_active
                          ? 'bg-gray-100 dark:bg-dark-100 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : transferringDigimon === digimon.id
                            ? 'bg-gray-100 dark:bg-dark-100 text-gray-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30'
                      }`}
                      title={
                        digimon.is_active ? "Can't send active Digimon to Farm" : 'Send to DigiFarm'
                      }
                    >
                      {transferringDigimon === digimon.id ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : digimon.is_active ? (
                        'Active'
                      ) : (
                        <>
                          <Warehouse className="w-2.5 h-2.5" />
                          <span>Farm</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: emptyPartySlots }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-100 aspect-square flex flex-col items-center justify-center gap-1"
                >
                  <Plus className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                  <span className="text-[8px] font-body text-gray-300 dark:text-gray-600">
                    Empty
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: DigiFarm Storage Panel ── */}
        <div className="flex-1">
          <div className="card dark:bg-dark-300 dark:border-dark-200">
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
                  <Warehouse className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-body font-medium text-gray-400 dark:text-gray-500">
                  DigiFarm is empty
                </p>
                <p className="text-xs font-body text-gray-300 dark:text-gray-600 mt-1">
                  Digimon sent from your party will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,6.5rem))] gap-2">
                {storageDigimon.map((digimon) => (
                  <motion.div
                    key={digimon.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDetailDigimon(digimon)}
                    className="relative bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-400 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-all aspect-square flex flex-col overflow-hidden"
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
                    <div className="px-1.5 pb-1.5">
                      {/* Level + EXP bar */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {digimon.current_level}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-dark-100 rounded-full h-0.5 overflow-hidden">
                          <div
                            className="bg-green-400 h-full transition-all"
                            style={{ width: `${getExpProgress(digimon)}%` }}
                          />
                        </div>
                      </div>

                      {/* Add to Party button */}
                      <button
                        onClick={(e) => handleTransferToActiveParty(e, digimon.id)}
                        disabled={
                          transferringDigimon === digimon.id ||
                          activePartyCount >= maxActivePartySize
                        }
                        className={`mt-1 w-full flex items-center justify-center gap-0.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
                          activePartyCount >= maxActivePartySize
                            ? 'bg-gray-100 dark:bg-dark-100 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : transferringDigimon === digimon.id
                              ? 'bg-gray-100 dark:bg-dark-100 text-gray-400'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30'
                        }`}
                        title={
                          activePartyCount >= maxActivePartySize ? 'Party is full' : 'Add to Party'
                        }
                      >
                        {transferringDigimon === digimon.id ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : activePartyCount >= maxActivePartySize ? (
                          'Full'
                        ) : (
                          <>
                            <UserPlus className="w-2.5 h-2.5" />
                            <span>Party</span>
                          </>
                        )}
                      </button>
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
