import React from 'react';
import { UserDigimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';

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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">DNA Fusion Required</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            This evolution requires a DNA fusion with <span className="font-bold text-yellow-600">{requiredDigimonData.name}</span>.
            Select which of your {requiredDigimonData.name} you want to use for this fusion:
          </p>
          <p className="text-xs text-red-600 mt-2">
            Warning: The selected Digimon will be consumed in the fusion process.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          {candidateDigimon.map(digimon => (
            <div 
              key={digimon.id} 
              className="border border-yellow-300 rounded-lg p-3 flex items-center hover:bg-yellow-50 cursor-pointer"
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
                <div className="font-medium">{digimon.name || digimon.digimon?.name}</div>
                <div className="text-xs text-gray-500">Lv. {digimon.current_level}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigimonDNASelectionModal; 