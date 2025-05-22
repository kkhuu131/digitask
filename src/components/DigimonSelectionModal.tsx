import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";

interface DigimonOption {
  id: number;
  name: string;
  sprite_url: string;
  type: string;
  attribute: string;
  stage: string;
}

interface DigimonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (digimonId: number) => Promise<void>;
  isNXChance: boolean;
}

const DigimonSelectionModal: React.FC<DigimonSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  isNXChance
}) => {
  const [starterOptions, setStarterOptions] = useState<DigimonOption[]>([]);
  const [nxOptions, setNXOptions] = useState<DigimonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDigimon, setSelectedDigimon] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spriteToggle, setSpriteToggle] = useState(false);

  // Animation interval for sprites
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setSpriteToggle(prev => !prev);
    }, 750); // Toggle every 750ms
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch the available Digimon options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch starter Digimon (IDs 1-5)
        const starterIds = [1, 2, 3, 4, 5];
        const starterData = starterIds.map(id => {
          const digimon = DIGIMON_LOOKUP_TABLE[id];
          return {
            id: digimon.id,
            name: digimon.name,
            sprite_url: digimon.sprite_url,
            type: digimon.type,
            attribute: digimon.attribute,
            stage: digimon.stage
          };
        });
        setStarterOptions(starterData);

        // Fetch NX Digimon (IDs 337-341)
        const nxIds = [337, 338, 339, 340, 341];
        const nxData = nxIds.map(id => {
          const digimon = DIGIMON_LOOKUP_TABLE[id];
          return {
            id: digimon.id,
            name: digimon.name,
            sprite_url: digimon.sprite_url,
            type: digimon.type,
            attribute: digimon.attribute,
            stage: digimon.stage
          };
        });
        setNXOptions(nxData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching Digimon options:", err);
        setError("Failed to load Digimon options. Please try again.");
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const handleSelect = async () => {
    if (!selectedDigimon) return;
    
    try {
      setIsSubmitting(true);
      await onSelect(selectedDigimon);
      onClose();
    } catch (err) {
      console.error("Error selecting Digimon:", err);
      setError("Failed to claim Digimon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get the animated sprite URL
  const getAnimatedSpriteUrl = (digimonName: string) => {
    return `/assets/egg/${digimonName}/${spriteToggle ? 'idle1' : 'idle2'}.png`;
  };

  if (!isOpen) return null;

  // Determine which options to show
  const displayOptions = isNXChance ? [...starterOptions, ...nxOptions] : starterOptions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Choose Your Digimon</h2>
          
          {isNXChance && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">
                <span className="font-bold">Easter Egg!</span> You can choose from rare NX Digimon in addition to the starters! These are special, weaker versions of the original, that can't evolve or devolve.
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading Digimon options...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                {displayOptions.map((digimon) => (
                  <div
                    key={digimon.id}
                    onClick={() => setSelectedDigimon(digimon.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDigimon === digimon.id
                        ? "border-primary-500 bg-primary-50 ring-2 ring-primary-300"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 flex items-center justify-center mb-2">
                        <img
                          src={getAnimatedSpriteUrl(digimon.name)}
                          alt={digimon.name}
                          className="object-contain max-h-full max-w-full"
                          style={{ imageRendering: "pixelated" }}
                          onError={(e) => {
                            // Fallback to original sprite if animated sprite fails to load
                            (e.target as HTMLImageElement).src = digimon.sprite_url;
                          }}
                        />
                      </div>
                      <h3 className="font-medium text-center">{digimon.name}</h3>
                      <p className="text-xs text-gray-500 text-center">
                        {digimon.type}/{digimon.attribute}
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        {digimon.stage}
                      </p>
                      {digimon.id >= 337 && digimon.id <= 341 && (
                        <span className="mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          NX
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelect}
                  disabled={!selectedDigimon || isSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedDigimon && !isSubmitting
                      ? "bg-primary-600 hover:bg-primary-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Claiming..." : "Claim"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DigimonSelectionModal; 