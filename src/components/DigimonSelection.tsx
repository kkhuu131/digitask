import React, { useState } from 'react';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { useDigimonStore } from '../store/petStore';
import DigimonSprite from './DigimonSprite';

interface DigimonSelectionProps {
  onSelect: (digimonId: number, name: string) => void;
}

const DigimonSelection: React.FC<DigimonSelectionProps> = ({ onSelect }) => {
  const [selectedDigimon, setSelectedDigimon] = useState<number | null>(null);
  const [digimonName, setDigimonName] = useState('');
  const [nameError, setNameError] = useState('');
  const { discoveredDigimon } = useDigimonStore();
  
  // Get starter Digimon (IDs 1-14 are typically the starters)
  const starterDigimon = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const handleSelectDigimon = (id: number) => {
    setSelectedDigimon(id);
    // Auto-fill name with Digimon's default name
    setDigimonName(DIGIMON_LOOKUP_TABLE[id].name);
  };
  
  const handleSubmit = () => {
    if (!selectedDigimon) {
      return;
    }
    
    if (!digimonName.trim()) {
      setNameError('Please give your Digimon a name');
      return;
    }
    
    if (digimonName.length > 20) {
      setNameError('Name must be 20 characters or less');
      return;
    }
    
    onSelect(selectedDigimon, digimonName);
  };
  
  return (
    <div className="max-h-[80vh] overflow-y-auto px-2">
      <div className="text-center mb-4">
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {starterDigimon.map(id => {
          const digimon = DIGIMON_LOOKUP_TABLE[id];
          const isDiscovered = discoveredDigimon.includes(id);
          
          return (
            <div 
              key={id}
              onClick={() => handleSelectDigimon(id)}
              className={`
                p-2 border rounded-lg cursor-pointer transition-all
                ${selectedDigimon === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                flex flex-col items-center
              `}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <DigimonSprite
                  digimonName={digimon.name}
                  fallbackSpriteUrl={digimon.sprite_url}
                  showHappinessAnimations = {false}
                />
              </div>
              <p className="mt-2 text-sm sm:text-base font-medium text-center">
                {isDiscovered ? digimon.name : "???"}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mb-4">
        <label htmlFor="digimonName" className="block text-sm font-medium text-gray-700 mb-1">
          Name your Digimon:
        </label>
        <input
          type="text"
          id="digimonName"
          value={digimonName}
          onChange={(e) => {
            setDigimonName(e.target.value);
            setNameError('');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter a name"
          maxLength={20}
        />
        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
      </div>
      
      <div className="sticky bottom-0 pt-4 pb-2 bg-white">
        <button
          onClick={handleSubmit}
          disabled={!selectedDigimon}
          className={`
            w-full py-2 px-4 rounded-md text-white font-medium
            ${selectedDigimon ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
          `}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default DigimonSelection; 