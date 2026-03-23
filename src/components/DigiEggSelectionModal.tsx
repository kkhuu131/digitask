import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from './DigimonSprite';

// Deterministic seeded PRNG (LCG). Same seed → same sequence every time.
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// Hash a string to a uint32 seed.
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

interface DigiEggSelectionModalProps {
  pool: number[]; // full pool of eligible digimon IDs
  seed: string; // deterministic seed (e.g. userId + userTitleId)
  onSelect: (digimonId: number) => void;
  onClose: () => void;
}

const DigiEggSelectionModal: React.FC<DigiEggSelectionModalProps> = ({
  pool,
  seed,
  onSelect,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deterministically pick 3 from pool — same seed always yields the same 3
  const choices = useMemo(() => {
    const rand = seededRandom(hashSeed(seed));
    const shuffled = [...pool].sort(() => rand() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length)).map((id) => {
      const d = DIGIMON_LOOKUP_TABLE[id];
      return {
        id: d.id,
        name: d.name,
        sprite_url: d.sprite_url,
        stage: d.stage,
        type: d.type,
        attribute: d.attribute,
      };
    });
  }, [pool, seed]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleConfirm = async () => {
    if (!selectedId || isSubmitting) return;
    setIsSubmitting(true);
    onSelect(selectedId);
  };

  const tierColor: Record<string, string> = {
    Vaccine: 'text-blue-400',
    Virus: 'text-red-400',
    Data: 'text-yellow-400',
    Free: 'text-gray-400',
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-lg bg-white dark:bg-dark-300 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-100 overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-lg font-heading font-bold text-white">Choose Your DigiEgg</h2>
            <p className="text-sm text-purple-200 mt-0.5">
              Select one Digimon to hatch from your reward.
            </p>
          </div>

          {/* Cards */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {choices.map((digimon) => {
                const isSelected = selectedId === digimon.id;
                return (
                  <motion.button
                    key={digimon.id}
                    onClick={() => setSelectedId(digimon.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md shadow-purple-200 dark:shadow-purple-900/50'
                        : 'border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 hover:border-gray-300 dark:hover:border-dark-50'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Sprite */}
                    <div className="w-16 h-16 flex items-center justify-center">
                      <DigimonSprite
                        digimonName={digimon.name}
                        fallbackSpriteUrl={digimon.sprite_url}
                        size="sm"
                        showHappinessAnimations={false}
                      />
                    </div>

                    {/* Info */}
                    <div className="text-center w-full">
                      <p className="text-xs font-heading font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {digimon.name}
                      </p>
                      <p className="text-[10px] font-body text-gray-500 dark:text-gray-400">
                        {digimon.stage}
                      </p>
                      <p
                        className={`text-[10px] font-body font-semibold ${tierColor[digimon.type] ?? 'text-gray-400'}`}
                      >
                        {digimon.type}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-heading font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId || isSubmitting}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-heading font-semibold transition-all duration-150 ${
                  selectedId && !isSubmitting
                    ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-200 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Hatching...' : 'Hatch Egg'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DigiEggSelectionModal;
