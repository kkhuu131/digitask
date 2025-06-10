import React from 'react';
import { UserDigimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import PageTutorial from './PageTutorial';
import { DialogueStep } from './DigimonDialogue';

interface DigimonDNASelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dnaRequirementId: number;
  candidateDigimon: UserDigimon[];
  onSelectDigimon: (digimonId: string) => void;
}

const DigimonDNASelectionModal: React.FC<DigimonDNASelectionModalProps> = ({
  isOpen,
  onClose,
  dnaRequirementId,
  candidateDigimon,
  onSelectDigimon
}) => {
  if (!isOpen) return null;
  
  const requiredDigimonData = DIGIMON_LOOKUP_TABLE[dnaRequirementId];

  const digimonDNASelectionModalTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Looks like you've found a new way to evolve your Digimon!"
    },
    {
      speaker: 'neemon',
      text: "OH LOOK! It's DNA Digivolution!"
    },
    {
      speaker: 'bokomon',
      text: "Yep, DNA Digivolution, or Fusion is a special way to evolve that only some Digimon can do! It requires a fusion with another Digimon."
    },
    {
      speaker: 'neemon',
      text: "So, how do we do it?"
    },
    {
      speaker: 'bokomon',
      text: "In addition to the usual requirements, you'll also need a specific DNA partner Digimon. Be warned though, the DNA partner Digimon will be consumed in the fusion process! Bonus stats or ABI will not be transferred."
    },
    {
      speaker: 'neemon',
      text: "You think we can fuse?"
    },
    {
      speaker: 'bokomon',
      text: "..."
    },
    
  ];
  
  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-300 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-gray-100">DNA Fusion Required</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This evolution requires a DNA fusion with <span className="font-bold text-yellow-600 dark:text-yellow-400">{requiredDigimonData.name}</span>.
            {candidateDigimon.length > 0 
              ? "Select which of your " + requiredDigimonData.name + " you want to use for this fusion:"
              : "You don't have any " + requiredDigimonData.name + " to use for fusion. You need to obtain one first."}
          </p>
          {candidateDigimon.length > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Warning: The selected Digimon will be consumed in the fusion process.
            </p>
          )}
        </div>
        
        {candidateDigimon.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 mt-4">
            {candidateDigimon.map(digimon => (
              <div 
                key={digimon.id} 
                className="border border-yellow-300 dark:border-yellow-600 rounded-lg p-3 flex items-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer"
                onClick={() => onSelectDigimon(digimon.id)}
              >
                <div className="w-12 h-12 mr-3">
                  <img 
                    src={digimon.digimon?.sprite_url} 
                    alt={digimon.name || digimon.digimon?.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div>
                  <div className="font-medium dark:text-gray-200">{digimon.name || digimon.digimon?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Lv. {digimon.current_level}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-center text-yellow-700 dark:text-yellow-300">
              You need to obtain a {requiredDigimonData.name} first before you can perform this DNA fusion.
            </p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 mr-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    <PageTutorial tutorialId="digimon_dna_selection_modal_intro" steps={digimonDNASelectionModalTutorialSteps} />
    </>
  );
};

export default DigimonDNASelectionModal; 