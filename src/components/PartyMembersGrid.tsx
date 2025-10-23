import React, { useState } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import DigimonDetailModal from './DigimonDetailModal';
import TypeAttributeIcon from './TypeAttributeIcon';
import DigimonSprite from './DigimonSprite';

const PartyMembersGrid: React.FC = () => {
  const { allUserDigimon, userDigimon } = useDigimonStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedDigimon, setSelectedDigimon] = useState<UserDigimon | null>(null);

  // Get non-active Digimon
  const nonActiveDigimon = allUserDigimon.filter(d => d.id !== userDigimon?.id);

  if (nonActiveDigimon.length === 0) {
    return null; // Don't render if no non-active Digimon
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {nonActiveDigimon.slice(0, 8).map((digimon) => {
          // Calculate experience progress
          const expForCurrentLevel = digimon.current_level * 20;
          const expProgress = Math.min(100, (digimon.experience_points / expForCurrentLevel) * 100);
          
          return (
            <div
              key={digimon.id}
              className="relative bg-gray-100 dark:bg-dark-200 rounded-lg p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
              onClick={() => {
                setSelectedDigimon(digimon);
                setShowModal(true);
              }}
            >
              {/* Type Attribute Icon - Top Right */}
              {digimon.digimon?.type && digimon.digimon?.attribute && (
                <div className="absolute top-1 right-1 z-10">
                  <TypeAttributeIcon 
                    type={digimon.digimon.type as any} 
                    attribute={digimon.digimon.attribute as any} 
                    size="sm" 
                  />
                </div>
              )}
              
              {/* Digimon Sprite - Center */}
              <div className="w-full aspect-square flex items-center justify-center">
                {/* <img
                  src={digimon.digimon?.sprite_url || '/assets/pet/egg.svg'}
                  alt={digimon.name || 'Digimon'}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/pet/egg.svg';
                  }}
                /> */}
                <DigimonSprite
                  digimonName={digimon.digimon?.name || 'Agumon'}
                  fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                  happiness={digimon.happiness}
                  size="xs"
                />
              </div>
              
              {/* Level and Experience Bar - Bottom */}
              <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1">
                {/* Level */}
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
                  {digimon.current_level}
                </span>
                
                {/* Experience Progress Bar */}
                <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showModal && selectedDigimon && (
        <DigimonDetailModal
          selectedDigimon={selectedDigimon}
          onClose={() => {
            setShowModal(false);
            setSelectedDigimon(null);
          }}
          onSetActive={async () => {
            // Handle setting as active - this will be handled by the parent component
            setShowModal(false);
            setSelectedDigimon(null);
          }}
          onNameChange={(updatedDigimon) => {
            // Update the store directly
            useDigimonStore.getState().updateDigimonName(updatedDigimon.id, updatedDigimon.name || '');
            
            // Dispatch the custom event to notify other components
            const event = new CustomEvent('digimon-name-changed', {
              detail: { digimonId: updatedDigimon.id }
            });
            window.dispatchEvent(event);
          }}
          className="z-40"
        />
      )}
    </>
  );
};

export default PartyMembersGrid;
