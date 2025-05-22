import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";
import { getSpriteUrl } from "../utils/spriteManager";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (spriteUrl: string) => void;
}

interface DigimonSprite {
  id: number;
  sprite_url: string;
  name: string;
  isAnimated: boolean;
}

const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: AvatarSelectionModalProps) => {
  const { discoveredDigimon } = useDigimonStore();
  const [availableSprites, setAvailableSprites] = useState<DigimonSprite[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchDigimonSprites = async () => {
      if (!discoveredDigimon || !Array.isArray(discoveredDigimon) || discoveredDigimon.length === 0) {
        setAvailableSprites([]);
        return;
      }
      
      setLoading(true);
      
      try {
        // Map discovered Digimon to sprites, preferring animated ones
        const avatarOptions = discoveredDigimon
          .map(id => {
            const digimon = DIGIMON_LOOKUP_TABLE[id];
            if (!digimon) return null;
            
            const name = digimon.name;
            const isAnimated = ANIMATED_DIGIMON.includes(name);
            
            // Use animated sprite if available, otherwise use regular sprite
            const sprite_url = isAnimated 
              ? getSpriteUrl(name, "idle1", digimon.sprite_url)
              : digimon.sprite_url;
              
            return {
              id,
              name,
              sprite_url,
              isAnimated
            };
          })
          .filter(Boolean) // Remove nulls
          .sort((a, b) => a!.id - b!.id); // Sort by ID ascending

        avatarOptions.push({
          id: 777,
          name: "Bokomon",
          sprite_url: "/assets/digimon/bokomon.png",
          isAnimated: false
        });

        avatarOptions.push({
          id: 778,
          name: "Neemon",
          sprite_url: "/assets/digimon/neemon.png",
          isAnimated: false
        });
        
        setAvailableSprites(avatarOptions as DigimonSprite[]);
      } catch (err) {
        console.error("Error fetching digimon sprites:", err);
        setAvailableSprites([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchDigimonSprites();
    }
  }, [discoveredDigimon, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Choose Your Avatar</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="mb-4 text-gray-600">
          Select a Digimon sprite to use as your profile avatar.
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading available avatars...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {availableSprites.map((sprite) => (
                <button
                  key={sprite.id}
                  onClick={() => {
                    onSelect(sprite.sprite_url);
                    onClose();
                  }}
                  className="bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors flex flex-col items-center justify-center aspect-square relative"
                >
                  <img 
                    src={sprite.sprite_url} 
                    alt={`${sprite.name}`} 
                    className="w-16 h-16 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      // If animated sprite fails, fall back to regular sprite
                      if (sprite.isAnimated) {
                        (e.target as HTMLImageElement).src = DIGIMON_LOOKUP_TABLE[sprite.id].sprite_url;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
            
            {availableSprites.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                You haven't discovered any Digimon with sprites yet. Battle to discover more!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AvatarSelectionModal; 