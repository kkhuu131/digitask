import React, { useState, useEffect } from "react";
import { EvolutionOption, UserDigimon, expToBoostPoints } from "../store/petStore";
import calculateBaseStat, { calculateFinalStats } from "../utils/digimonStatCalculation";
import EvolutionAnimation from "./EvolutionAnimation";
import { DIGIMON_LOOKUP_TABLE } from "@/constants/digimonLookup";
import DigimonDNASelectionModal from './DigimonDNASelectionModal';
import { useDigimonStore } from "../store/petStore";
import PageTutorial from "./PageTutorial";
import { DialogueStep } from "./DigimonDialogue";
import { BASE_TO_FORMS_MAP } from '../constants/digimonFormsLookup';
import DigimonFormTransformationModal from './DigimonFormTransformationModal';
import DigimonSprite from "./DigimonSprite";
import { useInventoryStore } from "../store/inventoryStore";
import { getItemName } from "@/constants/storeItems";

interface DigimonEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDigimon: UserDigimon;
  options: EvolutionOption[];
  onEvolve: (toDigimonId: number) => void;
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

  useEffect(() => {
    if (!isOpen) return;

    const loadUserItems = async () => {
      setItemsLoading(true);
      const itemsStatus: Record<string, boolean> = {};
      
      const itemRequirements = options
        .filter(option => option.item_requirement)
        .map(option => option.item_requirement as string);
      
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

  const handleEvolve = (toDigimonId: number) => {
    const target = options.find(option => option.digimon_id === toDigimonId);
    if (!target) return;
    
    if (target.dna_requirement) {
      setSelectedDNAOption(target);
      setShowDNAModal(true);
      return;
    }
    
    setEvolutionTarget(target);
    setShowAnimation(true);
  };

  const handleAnimationComplete = () => {
    if (evolutionTarget) {
      if (selectedDNAPartnerId && evolutionTarget.dna_requirement) {
        useDigimonStore.getState().dnaEvolveDigimon(
          selectedDigimon.id,
          evolutionTarget.digimon_id,
          selectedDNAPartnerId
        );
        setSelectedDNAPartnerId(null);
      } else {
        onEvolve(evolutionTarget.digimon_id);
      }
    }
    setShowAnimation(false);
    setEvolutionTarget(null);
    
    // Close the evolution modal
    onClose();
  };

  const handleDNASelection = async (dnaPartnerDigimonId: string) => {
    setShowDNAModal(false);
    
    if (selectedDNAOption) {
      const partner = allUserDigimon.find(d => d.id === dnaPartnerDigimonId);
      if (partner) {
        setDnaPartnerDigimon(partner);
      }
      
      setEvolutionTarget(selectedDNAOption);
      setShowAnimation(true);
      
      setSelectedDNAPartnerId(dnaPartnerDigimonId);
    }
  };

  const availableForms = BASE_TO_FORMS_MAP[selectedDigimon.digimon_id] || [];

  if (showAnimation && evolutionTarget) {
    return (
      <div className="fixed inset-0 z-50">
        <EvolutionAnimation
          oldSpriteUrl={selectedDigimon.digimon?.sprite_url || ''}
          newSpriteUrl={evolutionTarget.sprite_url}
          onComplete={handleAnimationComplete}
          isDevolution={isDevolution}
          isDNAFusion={!!selectedDNAPartnerId && !!evolutionTarget.dna_requirement}
          dnaPartnerSpriteUrl={dnaPartnerDigimon?.digimon?.sprite_url || ''}
        />
      </div>
    );
  }

  const modalTitle = isDevolution ? "De-Digivolution Options" : "Evolution Options";
  const actionText = isDevolution ? "Devolving" : "Evolving";
  const boostPoints = expToBoostPoints(
    selectedDigimon.current_level,
    !isDevolution
  );

  const dnaRequirementId = selectedDNAOption?.dna_requirement || 0;
  const candidateDigimon = allUserDigimon.filter(
    digimon => digimon.digimon_id === dnaRequirementId && digimon.id !== selectedDigimon.id
  );

  const digimonEvolutionModalTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Look at all the different evolutions your Digimon can undergo!"
    },
    {
      speaker: 'neemon',
      text: "Why can't we see what some of them look like?"
    },
    {
      speaker: 'bokomon', 
      text: "You'll only be able to see the Digimon when you've discovered them beforehand!"
    },
    {
      speaker: 'bokomon',
      text: "Evolutions typically will require both a certain level and a certain amount of stat requirements to be met. However, some of them may require ABI as well!"
    },
    {
      speaker: 'neemon',
      text: "You can also evolve your Digimon by using DNA Fusion!"
    },
    {
      speaker: 'bokomon',
      text: "Spoilers! Also, Digimon's levels reset to 1 after they evolve and gain ABI based on their level before evolving. Keep completing your tasks everyday and evolve your Digimon, good luck!"
    }
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-dark-300 rounded-lg p-4 sm:p-6 w-full max-w-4xl my-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-2 dark:text-gray-100">{modalTitle}</h3>
          <div className="text-md text-gray-500 dark:text-gray-300 mb-4">
            {actionText} will
            <b className="text-red-500 dark:text-red-400"> reset your Digimon level back to 1</b> and give {boostPoints} ABI.
          </div>

          {options.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
              No options available.
            </p>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh] mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {options.map((option) => {
                let canEvolve = true;
                let statRequirementsList: { name: string; current: number; required: number; meets: boolean }[] = [];

                if (!isDevolution) {
                  const finalStats = calculateFinalStats(selectedDigimon);

                  const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;

                  let meetsStatRequirements = true;
                  
                  if (option.stat_requirements) {
                    const statReqs = option.stat_requirements;
                    
                    if (statReqs.hp && statReqs.hp > 0) {
                      const currentHP = finalStats.hp;
                      if (currentHP < statReqs.hp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'HP',
                        current: currentHP,
                        required: statReqs.hp,
                        meets: currentHP >= statReqs.hp
                      });
                    }
                    
                    if (statReqs.sp && statReqs.sp > 0) {
                      const currentSP = finalStats.sp;
                      if (currentSP < statReqs.sp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'SP',
                        current: currentSP,
                        required: statReqs.sp,
                        meets: currentSP >= statReqs.sp
                      });
                    }
                    
                    if (statReqs.atk && statReqs.atk > 0) {
                      const currentATK = finalStats.atk;
                      if (currentATK < statReqs.atk) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'ATK',
                        current: currentATK,
                        required: statReqs.atk,
                        meets: currentATK >= statReqs.atk
                      });
                    }
                    
                    if (statReqs.def && statReqs.def > 0) {
                      const currentDEF = finalStats.def;
                      if (currentDEF < statReqs.def) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'DEF',
                        current: currentDEF,
                        required: statReqs.def,
                        meets: currentDEF >= statReqs.def
                      });
                    }
                    
                    if (statReqs.int && statReqs.int > 0) {
                      const currentINT = finalStats.int;
                      if (currentINT < statReqs.int) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'INT',
                        current: currentINT,
                        required: statReqs.int,
                        meets: currentINT >= statReqs.int
                      });
                    }
                    
                    if (statReqs.spd && statReqs.spd > 0) {
                      const currentSPD = finalStats.spd;
                      if (currentSPD < statReqs.spd) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'SPD',
                        current: currentSPD,
                        required: statReqs.spd,
                        meets: currentSPD >= statReqs.spd
                      });
                    }

                    if (statReqs.abi && statReqs.abi > 0) {
                      const currentABI = selectedDigimon.abi || 0;
                      if (currentABI < statReqs.abi) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'ABI',
                        current: currentABI,
                        required: statReqs.abi,
                        meets: currentABI >= statReqs.abi
                      });
                    }
                  }
                  
                  // Check for item requirement
                  let hasRequiredItem = true;
                  if (option.item_requirement) {
                    hasRequiredItem = !itemsLoading && userHasItems[option.item_requirement] === true;
                  }
                  
                  canEvolve = meetsLevelRequirement && meetsStatRequirements && hasRequiredItem;
                }

                const discovered = isDiscovered(option.digimon_id);
                const canProceed = isDevolution ? discovered : canEvolve;
                
                return (
                  <div
                    key={option.id}
                    className={`border dark:border-gray-700 rounded-lg p-4 flex flex-col items-center ${
                      canProceed 
                        ? "hover:shadow-md cursor-pointer opacity-100" 
                        : "opacity-60 bg-gray-100 dark:bg-dark-200"
                    } ${option.dna_requirement ? "border-2 border-yellow-400 dark:border-yellow-500 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-500/20" : ""}
                    ${option.item_requirement ? "border-2 border-purple-400 dark:border-purple-500 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20" : ""}`}
                    onClick={() => canProceed && handleEvolve(option.digimon_id)}
                  >
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
                          : "???"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.stage}</p>
                    {!isDevolution && (
                      <p className="text-sm my-1 dark:text-gray-300">Lv. <span className={selectedDigimon.current_level >= option.level_required ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{selectedDigimon.current_level}/{option.level_required}</span></p>
                    )}
                    
                    {!isDevolution && statRequirementsList.length > 0 && (
                      <div className="mt-2 w-full">
                        <div className="space-y-1">
                          
                          {statRequirementsList.map((stat, idx) => (
                            <p key={idx} className="text-xs dark:text-gray-300">
                              {stat.name} <span className={stat.meets ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                {stat.current}/{stat.required}
                              </span>
                            </p>
                          ))}

                          {option.dna_requirement && (
                            <p className="text-xs font-medium dark:text-gray-300">
                              Digimon: <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                                {DIGIMON_LOOKUP_TABLE[option.dna_requirement].name}
                              </span>
                            </p>
                          )}
                          
                          {option.item_requirement && (
                            <p className="text-xs font-medium dark:text-gray-300">
                              Item: <span className={userHasItems[option.item_requirement] ? "text-purple-600 dark:text-purple-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                                {getItemName(option.item_requirement) || option.item_requirement.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </p>
                          )}
                        
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
                    disabled={!canTransformToXAntibody}
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
      <PageTutorial tutorialId="digimon_evolution_modal_intro" steps={digimonEvolutionModalTutorialSteps} />

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
