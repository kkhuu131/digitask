import React, { useState, useEffect, useRef } from 'react';
import { EvolutionOption, UserDigimon, expToBoostPoints } from '../store/petStore';
import { getEvolutionStatRequirements } from '../utils/evolutionRequirements';
import EvolutionAnimation from './EvolutionAnimation';
import { DIGIMON_LOOKUP_TABLE } from '@/constants/digimonLookup';
import DigimonDNASelectionModal from './DigimonDNASelectionModal';
import { useDigimonStore } from '../store/petStore';
import PageTutorial from './PageTutorial';
import { DialogueStep } from './DigimonDialogue';
import { BASE_TO_FORMS_MAP } from '../constants/digimonFormsLookup';
import DigimonFormTransformationModal from './DigimonFormTransformationModal';
import ContentSkeleton from './ContentSkeleton';
import DigimonSprite from './DigimonSprite';
import { useInventoryStore } from '../store/inventoryStore';
import { getItemName } from '@/constants/storeItems';
import LoadingIndicator from './LoadingIndicator';

interface DigimonEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDigimon: UserDigimon;
  options: EvolutionOption[];
  onEvolve: (toDigimonId: number) => Promise<void>;
  onAnimationComplete?: () => void;
  isDevolution?: boolean;
  error: string | null;
  isDiscovered: (digimonId: number) => boolean;
  allUserDigimon: UserDigimon[];
}

const DigimonEvolutionModal: React.FC<DigimonEvolutionModalProps> = ({
  isOpen,
  onClose,
  selectedDigimon,
  options,
  onEvolve,
  onAnimationComplete,
  isDevolution = false,
  error,
  isDiscovered,
  allUserDigimon,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [evolutionTarget, setEvolutionTarget] = useState<EvolutionOption | null>(null);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [selectedDNAOption, setSelectedDNAOption] = useState<EvolutionOption | null>(null);
  const [selectedDNAPartnerId, setSelectedDNAPartnerId] = useState<string | null>(null);
  const [dnaPartnerDigimon, setDnaPartnerDigimon] = useState<UserDigimon | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedFormInfo, setSelectedFormInfo] = useState<any>(null);
  const [userHasItems, setUserHasItems] = useState<Record<string, boolean>>({});
  const [itemsLoading, setItemsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitting = useRef(false);
  const [animationSource, setAnimationSource] = useState(selectedDigimon);

  useEffect(() => {
    if (!isOpen) return;

    const loadUserItems = async () => {
      setItemsLoading(true);
      const itemsStatus: Record<string, boolean> = {};

      const itemRequirements = options
        .filter((option) => option.item_requirement)
        .map((option) => option.item_requirement as string);

      for (const itemId of itemRequirements) {
        const hasItem = await useInventoryStore.getState().checkEvolutionItem(itemId);
        itemsStatus[itemId] = hasItem;
      }

      setUserHasItems(itemsStatus);
      setItemsLoading(false);
    };

    loadUserItems();
  }, [isOpen, options]);

  if (!isOpen) return null;

  const submitEvolution = async (target: EvolutionOption, partnerId?: string) => {
    if (submitting.current) return;
    submitting.current = true;
    setSubmittingId(target.digimon_id);
    setSubmitError(null);
    const source = selectedDigimon;
    try {
      if (partnerId) {
        const success = await useDigimonStore
          .getState()
          .dnaEvolveDigimon(source.id, target.digimon_id, partnerId);
        if (!success) throw new Error('DNA evolution could not be saved. Please try again.');
      } else {
        await onEvolve(target.digimon_id);
      }
      setAnimationSource(source);
      setEvolutionTarget(target);
      setSelectedDNAPartnerId(partnerId ?? null);
      setShowAnimation(true);
    } catch (failure) {
      setSubmitError(
        failure instanceof Error
          ? failure.message
          : 'Evolution could not be saved. Please try again.'
      );
    } finally {
      submitting.current = false;
      setSubmittingId(null);
    }
  };

  const handleEvolve = (toDigimonId: number) => {
    if (submitting.current) return;
    const target = options.find((option) => option.digimon_id === toDigimonId);
    if (!target) return;

    if (target.dna_requirement) {
      setSelectedDNAOption(target);
      setShowDNAModal(true);
      return;
    }

    void submitEvolution(target);
  };

  const handleAnimationComplete = () => {
    setSelectedDNAPartnerId(null);
    setShowAnimation(false);
    setEvolutionTarget(null);

    // Close the evolution modal
    onClose();
    onAnimationComplete?.();
  };

  const handleDNASelection = async (dnaPartnerDigimonId: string) => {
    setShowDNAModal(false);

    if (selectedDNAOption) {
      const partner = allUserDigimon.find((d) => d.id === dnaPartnerDigimonId);
      if (partner) {
        setDnaPartnerDigimon(partner);
      }

      await submitEvolution(selectedDNAOption, dnaPartnerDigimonId);
    }
  };

  const availableForms = BASE_TO_FORMS_MAP[selectedDigimon.digimon_id] || [];

  if (showAnimation && evolutionTarget) {
    return (
      <div className="fixed inset-0 z-50">
        <EvolutionAnimation
          oldSpriteUrl={animationSource.digimon?.sprite_url || ''}
          newSpriteUrl={evolutionTarget.sprite_url}
          oldSpeciesName={animationSource.digimon?.name || animationSource.name}
          newSpeciesName={evolutionTarget.name}
          onComplete={handleAnimationComplete}
          isDevolution={isDevolution}
          isDNAFusion={!!selectedDNAPartnerId && !!evolutionTarget.dna_requirement}
          dnaPartnerSpriteUrl={dnaPartnerDigimon?.digimon?.sprite_url || ''}
          dnaPartnerSpeciesName={dnaPartnerDigimon?.digimon?.name}
        />
      </div>
    );
  }

  const modalTitle = isDevolution ? 'De-Digivolution Options' : 'Evolution Options';
  const actionText = isDevolution ? 'Devolving' : 'Evolving';
  const boostPoints = expToBoostPoints(selectedDigimon.current_level, !isDevolution);

  const dnaRequirementId = selectedDNAOption?.dna_requirement || 0;
  const candidateDigimon = allUserDigimon.filter(
    (digimon) => digimon.digimon_id === dnaRequirementId && digimon.id !== selectedDigimon.id
  );

  const digimonEvolutionModalTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: 'Compare each evolution’s level, stat, ABI and item requirements. A path becomes available when your partner meets its requirements.',
    },
    {
      speaker: 'bokomon',
      text: 'Evolution and devolution reset the partner’s level to 1 and increase ABI. The notice above the options shows the ABI gain for this change.',
    },
    {
      speaker: 'neemon',
      text: 'Some paths need a DNA partner too. Read the fusion warning carefully: the selected partner is consumed.',
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4 overflow-y-auto"
        onClick={() => {
          if (!submitting.current) onClose();
        }}
      >
        <div
          className="bg-white dark:bg-dark-300 rounded-lg p-4 sm:p-6 w-full max-w-4xl my-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-2 dark:text-gray-100">{modalTitle}</h3>
          <PageTutorial
            tutorialId="digimon_evolution_modal_intro"
            steps={digimonEvolutionModalTutorialSteps}
          />
          <div className="text-md text-gray-500 dark:text-gray-300 mb-4">
            {actionText} will
            <b className="text-red-500 dark:text-red-400">
              {' '}
              reset your Digimon level back to 1
            </b>{' '}
            and give {boostPoints} ABI.
          </div>

          {options.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
              No options available.
            </p>
          )}

          {(submitError || error) && (
            <div
              role="alert"
              className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{submitError || error}</p>
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh] mb-4">
            {itemsLoading && !isDevolution && options.some((option) => option.item_requirement) ? (
              <ContentSkeleton
                label="Loading evolution item requirements…"
                layout="grid"
                count={options.length}
                gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                itemClassName="min-h-64"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {options.map((option) => {
                  let canEvolve = true;
                  const statRequirementsList = isDevolution
                    ? []
                    : getEvolutionStatRequirements(selectedDigimon, option.stat_requirements);

                  if (!isDevolution) {
                    const meetsLevelRequirement =
                      selectedDigimon.current_level >= option.level_required;

                    const meetsStatRequirements = statRequirementsList.every(
                      (requirement) => requirement.meets
                    );

                    // Check for item requirement
                    let hasRequiredItem = true;
                    if (option.item_requirement) {
                      hasRequiredItem =
                        !itemsLoading && userHasItems[option.item_requirement] === true;
                    }

                    canEvolve = meetsLevelRequirement && meetsStatRequirements && hasRequiredItem;
                  }

                  const discovered = isDiscovered(option.digimon_id);
                  const canProceed =
                    submittingId === null && (isDevolution ? discovered : canEvolve);

                  return (
                    <button
                      type="button"
                      disabled={!canProceed}
                      aria-busy={submittingId === option.digimon_id}
                      key={option.id}
                      className={`border dark:border-gray-700 rounded-lg p-4 flex flex-col items-center ${
                        canProceed
                          ? 'hover:shadow-md cursor-pointer opacity-100'
                          : 'opacity-60 bg-gray-100 dark:bg-dark-200'
                      } ${option.dna_requirement ? 'border-2 border-yellow-400 dark:border-yellow-500 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-500/20' : ''}
                    ${option.item_requirement ? 'border-2 border-purple-400 dark:border-purple-500 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20' : ''}`}
                      onClick={() => canProceed && handleEvolve(option.digimon_id)}
                    >
                      {submittingId === option.digimon_id && (
                        <LoadingIndicator
                          message={isDevolution ? 'Devolving…' : 'Evolving…'}
                          variant="inline"
                        />
                      )}
                      <DigimonSprite
                        digimonName={option.name}
                        fallbackSpriteUrl={option.sprite_url}
                        size="md"
                        showHappinessAnimations={false}
                        silhouette={!discovered}
                      />

                      <h4 className="font-bold dark:text-gray-200">
                        {discovered
                          ? option.name
                          : option.name.includes('(')
                            ? `??? ${option.name.substring(option.name.indexOf('('))}`
                            : '???'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.stage}</p>
                      {!isDevolution && (
                        <p className="text-sm my-1 dark:text-gray-300">
                          Lv.{' '}
                          <span
                            className={
                              selectedDigimon.current_level >= option.level_required
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {selectedDigimon.current_level}/{option.level_required}
                          </span>
                        </p>
                      )}

                      {!isDevolution && statRequirementsList.length > 0 && (
                        <div className="mt-2 w-full">
                          <div className="space-y-1">
                            {statRequirementsList.map((stat, idx) => (
                              <p key={idx} className="text-xs dark:text-gray-300">
                                {stat.name}{' '}
                                <span
                                  className={
                                    stat.meets
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }
                                >
                                  {stat.current}/{stat.required}
                                </span>
                              </p>
                            ))}

                            {option.dna_requirement && (
                              <p className="text-xs font-medium dark:text-gray-300">
                                Digimon:{' '}
                                <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                                  {DIGIMON_LOOKUP_TABLE[option.dna_requirement].name}
                                </span>
                              </p>
                            )}

                            {option.item_requirement && (
                              <p className="text-xs font-medium dark:text-gray-300">
                                Item:{' '}
                                <span
                                  className={
                                    userHasItems[option.item_requirement]
                                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                                      : 'text-red-600 dark:text-red-400 font-bold'
                                  }
                                >
                                  {getItemName(option.item_requirement) ||
                                    option.item_requirement
                                      .split('_')
                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(' ')}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between sticky bottom-0 bg-white dark:bg-dark-300 pt-4 border-t dark:border-dark-100">
            <div className="flex space-x-2">
              {availableForms.map((formInfo) => {
                const isXAntibodyForm = formInfo.formType === 'X-Antibody';
                const canTransformToXAntibody = !isXAntibodyForm || selectedDigimon.has_x_antibody;

                return (
                  <button
                    key={formInfo.formDigimonId}
                    onClick={() => {
                      if (canTransformToXAntibody) {
                        setSelectedFormInfo(formInfo);
                        setShowFormModal(true);
                      }
                    }}
                    disabled={submittingId !== null || !canTransformToXAntibody}
                    className={`px-4 py-2 rounded flex items-center ${
                      canTransformToXAntibody
                        ? 'bg-blue-600 dark:bg-amber-600 text-white hover:bg-blue-700 dark:hover:bg-amber-700'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isXAntibodyForm && (
                      <img src="/assets/x-antibody.png" alt="X-Antibody" className="w-5 h-5 mr-2" />
                    )}
                    <span>{formInfo.formType}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={onClose}
              disabled={submittingId !== null}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-200 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-dark-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DigimonDNASelectionModal
        isOpen={showDNAModal}
        onClose={() => setShowDNAModal(false)}
        dnaRequirementId={dnaRequirementId}
        candidateDigimon={candidateDigimon}
        onSelectDigimon={handleDNASelection}
      />

      {showFormModal && selectedFormInfo && (
        <DigimonFormTransformationModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          userDigimonId={selectedDigimon.id}
          currentDigimonId={selectedDigimon.digimon_id}
          formInfo={selectedFormInfo}
          onParentClose={onClose}
        />
      )}
    </>
  );
};

export default DigimonEvolutionModal;
