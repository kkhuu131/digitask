import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DialogueStep {
  speaker: 'bokomon' | 'neemon' | 'both';
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DigimonDialogueProps {
  steps: DialogueStep[];
  onComplete: () => void;
  isSkippable?: boolean;
}

const DigimonDialogue: React.FC<DigimonDialogueProps> = ({ 
  steps, 
  onComplete,
  isSkippable = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAdvance = () => {
    if (isAnimating) return;
    
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentDialogue = steps[currentStep];

  return (
    <motion.div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleAdvance}
    >
      <div className="relative w-full max-w-4xl px-4 pb-4 md:pb-4 pb-16 transform translate-y-[60%]">
        {/* Character sprites */}
        <div className="absolute bottom-full right-4 mb-2 flex">
          {(currentDialogue.speaker === 'bokomon' || currentDialogue.speaker === 'both') && (
            <motion.img 
              src="/assets/digimon/bokomon.png" 
              alt="Bokomon"
              className="h-24 md:h-32 object-contain mr-4"
              style={{ imageRendering: 'pixelated' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          {(currentDialogue.speaker === 'neemon' || currentDialogue.speaker === 'both') && (
            <motion.img 
              src="/assets/digimon/neemon.png" 
              alt="Neemon"
              className="h-24 md:h-32 object-contain"
              style={{ imageRendering: 'pixelated' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Dialogue box */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            className="bg-white rounded-lg p-4 md:p-6 shadow-lg border-2 border-blue-400 max-h-[60vh] overflow-y-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start mb-4">
              <div className="font-bold text-blue-600 mr-2">
                {currentDialogue.speaker === 'bokomon' ? 'Bokomon:' : 
                 currentDialogue.speaker === 'neemon' ? 'Neemon:' : 'Bokomon & Neemon:'}
              </div>
              <div className="text-gray-800">{currentDialogue.text}</div>
            </div>
            
            <div className="flex justify-between items-center">
              {currentDialogue.action ? (
                <button 
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    currentDialogue.action?.onClick();
                  }}
                >
                  {currentDialogue.action.label}
                </button>
              ) : (
                <div className="text-sm text-gray-500">Click anywhere to continue</div>
              )}
              
              {isSkippable && (
                <button 
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                  }}
                >
                  Skip
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DigimonDialogue; 