import React, { useState } from "react";
import { EvolutionOption, UserDigimon, expToBoostPoints } from "../store/petStore";
import calculateBaseStat from "../utils/digimonStatCalculation";
import EvolutionAnimation from "./EvolutionAnimation";
import { DIGIMON_LOOKUP_TABLE } from "@/constants/digimonLookup";
import DigimonDNASelectionModal from './DigimonDNASelectionModal';
import { useDigimonStore } from "../store/petStore";
import PageTutorial from "./PageTutorial";
import { DialogueStep } from "./DigimonDialogue";
import { BASE_TO_FORMS_MAP } from '../constants/digimonFormsLookup';
import DigimonFormTransformationModal from './DigimonFormTransformationModal';

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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl my-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-2">{modalTitle}</h3>
          <div className="text-md text-gray-500 mb-4">
            {actionText} will
            <b className="text-red-500"> reset your Digimon level back to 1</b> and give {boostPoints} ABI.
          </div>

          {options.length === 0 && (
            <p className="text-gray-500 mb-4 text-center">
              No options available.
            </p>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="overflow-y-auto max-h-[60vh] mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {options.map((option) => {
                let canEvolve = true;
                let statRequirementsList: { name: string; current: number; required: number; meets: boolean }[] = [];

                if (!isDevolution) {
                  const baseHP = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.hp_level1 ?? 0,
                    selectedDigimon.digimon?.hp ?? 0,
                    selectedDigimon.digimon?.hp_level99 ?? 0
                  );

                  const baseSP = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.sp_level1 ?? 0,
                    selectedDigimon.digimon?.sp ?? 0,
                    selectedDigimon.digimon?.sp_level99 ?? 0
                  );

                  const baseATK = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.atk_level1 ?? 0,
                    selectedDigimon.digimon?.atk ?? 0,
                    selectedDigimon.digimon?.atk_level99 ?? 0
                  );

                  const baseDEF = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.def_level1 ?? 0,
                    selectedDigimon.digimon?.def ?? 0,
                    selectedDigimon.digimon?.def_level99 ?? 0
                  );

                  const baseINT = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.int_level1 ?? 0,
                    selectedDigimon.digimon?.int ?? 0,
                    selectedDigimon.digimon?.int_level99 ?? 0
                  );

                  const baseSPD = calculateBaseStat(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.spd_level1 ?? 0,
                    selectedDigimon.digimon?.spd ?? 0,
                    selectedDigimon.digimon?.spd_level99 ?? 0
                  );

                  const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;

                  let meetsStatRequirements = true;
                  
                  if (option.stat_requirements) {
                    const statReqs = option.stat_requirements;
                    
                    if (statReqs.hp && statReqs.hp > 0) {
                      const currentHP = baseHP + 10 * (selectedDigimon.hp_bonus || 0);
                      if (currentHP < statReqs.hp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'HP',
                        current: currentHP,
                        required: statReqs.hp,
                        meets: currentHP >= statReqs.hp
                      });
                    }
                    
                    if (statReqs.sp && statReqs.sp > 0) {
                      const currentSP = baseSP + (selectedDigimon.sp_bonus || 0);
                      if (currentSP < statReqs.sp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'SP',
                        current: currentSP,
                        required: statReqs.sp,
                        meets: currentSP >= statReqs.sp
                      });
                    }
                    
                    if (statReqs.atk && statReqs.atk > 0) {
                      const currentATK = baseATK + (selectedDigimon.atk_bonus || 0);
                      if (currentATK < statReqs.atk) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'ATK',
                        current: currentATK,
                        required: statReqs.atk,
                        meets: currentATK >= statReqs.atk
                      });
                    }
                    
                    if (statReqs.def && statReqs.def > 0) {
                      const currentDEF = baseDEF + (selectedDigimon.def_bonus || 0);
                      if (currentDEF < statReqs.def) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'DEF',
                        current: currentDEF,
                        required: statReqs.def,
                        meets: currentDEF >= statReqs.def
                      });
                    }
                    
                    if (statReqs.int && statReqs.int > 0) {
                      const currentINT = baseINT + (selectedDigimon.int_bonus || 0);
                      if (currentINT < statReqs.int) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'INT',
                        current: currentINT,
                        required: statReqs.int,
                        meets: currentINT >= statReqs.int
                      });
                    }
                    
                    if (statReqs.spd && statReqs.spd > 0) {
                      const currentSPD = baseSPD + (selectedDigimon.spd_bonus || 0);
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
                  
                  canEvolve = meetsLevelRequirement && meetsStatRequirements;
                }

                const discovered = isDiscovered(option.digimon_id);
                const canProceed = isDevolution ? discovered : canEvolve;
                
                return (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-4 flex flex-col items-center ${
                      canProceed 
                        ? "hover:shadow-md cursor-pointer opacity-100" 
                        : "opacity-60 bg-gray-100"
                    } ${option.dna_requirement ? "border-2 border-yellow-400 shadow-lg shadow-yellow-200/50" : ""}`}
                    onClick={() => canProceed && handleEvolve(option.digimon_id)}
                  >
                    <img
                      src={option.sprite_url}
                      alt={discovered ? option.name : "Unknown Digimon"}
                      className={`w-24 h-24 object-contain mb-2 ${
                        discovered ? "opacity-100" : "brightness-0"
                      }`}
                      style={{ imageRendering: "pixelated" }}
                    />
                    <h4 className="font-bold">
                      {discovered 
                        ? option.name 
                        : option.name.includes('(') 
                          ? `??? ${option.name.substring(option.name.indexOf('('))}` 
                          : "???"}
                    </h4>
                    <p className="text-sm text-gray-500">{option.stage}</p>
                    {!isDevolution && (
                      <p className="text-sm my-1">Level: <span className={selectedDigimon.current_level >= option.level_required ? "text-green-600" : "text-red-600"}>{selectedDigimon.current_level}/{option.level_required}</span></p>
                    )}
                    
                    {!isDevolution && statRequirementsList.length > 0 && (
                      <div className="mt-2 w-full">
                        <p className="text-xs font-semibold mb-1">Requirements:</p>
                        <div className="space-y-1">
                          <p className="text-xs">
                            Level: <span className={selectedDigimon.current_level >= option.level_required ? "text-green-600" : "text-red-600"}>
                              {selectedDigimon.current_level}/{option.level_required}
                            </span>
                          </p>
                          
                          {statRequirementsList.map((stat, idx) => (
                            <p key={idx} className="text-xs">
                              {stat.name}: <span className={stat.meets ? "text-green-600" : "text-red-600"}>
                                {stat.current}/{stat.required}
                              </span>
                            </p>
                          ))}

                          {option.dna_requirement && (
                            <p className="text-xs font-medium">
                              Digimon: <span className="text-yellow-600 font-bold">
                                {DIGIMON_LOOKUP_TABLE[option.dna_requirement].name}
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

          <div className="flex justify-between sticky bottom-0 bg-white pt-4 border-t">
            <div className="flex space-x-2">
              {availableForms.length > 0 && availableForms.map(formInfo => (
                <button
                  key={formInfo.formDigimonId}
                  onClick={() => {
                    setSelectedFormInfo(formInfo);
                    setShowFormModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {formInfo.formType} Form
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
