import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";
import { getSpriteUrl } from "../utils/spriteManager";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

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
  item_id?: string;
}

const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: AvatarSelectionModalProps) => {
  const { discoveredDigimon } = useDigimonStore();
  const [availableSprites, setAvailableSprites] = useState<DigimonSprite[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedVariants, setUnlockedVariants] = useState<string[]>([]);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchDigimonSprites = async () => {
      if (!discoveredDigimon || !Array.isArray(discoveredDigimon) || discoveredDigimon.length === 0) {
        setAvailableSprites([]);
        return;
      }
      
      setLoading(true);
      
      try {
        // First fetch unlocked variants if user is logged in
        let unlockedVariantData: string[] = [];
        if (user) {
          const { data } = await supabase
            .from('user_inventory')
            .select('item_id')
            .eq('user_id', user.id)
            .eq('item_type', 'avatar_variant');
          
          unlockedVariantData = data?.map(item => item.item_id) || [];
          setUnlockedVariants(unlockedVariantData);
        }
        
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
              isAnimated,
              item_id: undefined
            };
          })
          .filter(Boolean) // Remove nulls
          .sort((a, b) => a!.id - b!.id); // Sort by ID ascending

        // Add unlocked variants to the list
        const variantOptions = unlockedVariantData
          .filter(item => item.startsWith('avatar_'))
          .map(item => {
            const [_, digimonName, variant] = item.split('_');
            if (!digimonName || !variant) return null;
            
            return {
              id: -1, // Use negative ID to indicate it's a variant
              name: `${digimonName} (${variant})`,
              sprite_url: `/assets/animated_digimon/${digimonName}/${variant}.png`,
              isAnimated: true,
              item_id: item // Store the item_id for checking unlock status
            };
          })
          .filter(Boolean);
        
        // Add special avatars
        avatarOptions.push({
          id: 777,
          name: "Bokomon",
          sprite_url: "/assets/digimon/bokomon.png",
          isAnimated: false,
          item_id: undefined
        });

        avatarOptions.push({
          id: 778,
          name: "Neemon",
          sprite_url: "/assets/digimon/neemon.png",
          isAnimated: false,
          item_id: undefined
        });
        
        // Combine base sprites and variant sprites
        setAvailableSprites([...avatarOptions, ...variantOptions] as DigimonSprite[]);
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
  }, [discoveredDigimon, isOpen, user?.id]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-300 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Choose Your Avatar</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Select a Digimon sprite to use as your profile avatar.
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading available avatars...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
              {/* Display unlocked special avatars first with highlight */}
              {availableSprites
                .filter(sprite => sprite.item_id && unlockedVariants.includes(sprite.item_id))
                .map((sprite) => (
                  <button
                    key={sprite.sprite_url}
                    onClick={() => {
                      onSelect(sprite.sprite_url);
                      onClose();
                    }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/60 dark:to-amber-800/70 rounded-lg p-2 hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors flex flex-col items-center justify-center aspect-square relative border-2 border-amber-300 dark:border-amber-600"
                  >
                    <img 
                      src={sprite.sprite_url} 
                      alt={`${sprite.name}`} 
                      className="w-16 h-16 object-contain"
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        if (sprite.isAnimated && sprite.id > 0) {
                          (e.target as HTMLImageElement).src = DIGIMON_LOOKUP_TABLE[sprite.id].sprite_url;
                        }
                      }}
                    />
                    <div className="text-xs text-center mt-1 text-amber-800 dark:text-amber-300 font-medium truncate w-full">
                      {sprite.item_id ? sprite.item_id.split('_')[2] : sprite.name}
                    </div>
                  </button>
                ))}
              
              {/* Display regular avatars */}
              {availableSprites
                .filter(sprite => !sprite.item_id)
                .map((sprite) => (
                  <button
                    key={sprite.sprite_url}
                    onClick={() => {
                      onSelect(sprite.sprite_url);
                      onClose();
                    }}
                    className="bg-gray-100 dark:bg-dark-200 rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors flex flex-col items-center justify-center aspect-square relative"
                  >
                    <img 
                      src={sprite.sprite_url} 
                      alt={`${sprite.name}`} 
                      className="w-16 h-16 object-contain"
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        if (sprite.isAnimated) {
                          (e.target as HTMLImageElement).src = DIGIMON_LOOKUP_TABLE[sprite.id].sprite_url;
                        }
                      }}
                    />
                  </button>
                ))}
              
              {/* At the end, show locked variants that the user doesn't have yet */}
              {availableSprites
                .filter(sprite => sprite.item_id && !unlockedVariants.includes(sprite.item_id))
                .map((sprite) => (
                  <button
                    key={sprite.sprite_url}
                    className="bg-gray-100 dark:bg-dark-200 rounded-lg p-2 opacity-50 cursor-not-allowed flex flex-col items-center justify-center aspect-square relative"
                  >
                    <img 
                      src={sprite.sprite_url} 
                      alt={`${sprite.name}`} 
                      className="w-16 h-16 object-contain"
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        if (sprite.isAnimated && sprite.id > 0) {
                          (e.target as HTMLImageElement).src = DIGIMON_LOOKUP_TABLE[sprite.id].sprite_url;
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 dark:bg-opacity-50">
                      <span>🔒</span>
                    </div>
                  </button>
                ))}
            </div>
            
            {availableSprites.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
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