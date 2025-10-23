import React, { useState } from 'react';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import DigimonDetailModal from './DigimonDetailModal';

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
        {nonActiveDigimon.slice(0, 8).map((digimon) => (
          <div
            key={digimon.id}
            className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => {
              setSelectedDigimon(digimon);
              setShowModal(true);
            }}
          >
            <div className="w-full aspect-square flex items-center justify-center">
              <img
                src={digimon.digimon?.sprite_url || '/assets/pet/egg.svg'}
                alt={digimon.name || 'Digimon'}
                className="w-auto h-auto max-w-full max-h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/pet/egg.svg';
                }}
              />
            </div>
          </div>
        ))}
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
