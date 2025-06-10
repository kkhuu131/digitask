import React, { useState } from 'react';
import { useDigimonStore } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { DigimonFormInfo } from '../constants/digimonFormsLookup';
import EvolutionAnimation from './EvolutionAnimation';
import { useNotificationStore } from '../store/notificationStore';
import DigimonSprite from './DigimonSprite';

interface DigimonFormTransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDigimonId: string;
  currentDigimonId: number;
  formInfo: DigimonFormInfo;
  onParentClose?: () => void;
}

const DigimonFormTransformationModal: React.FC<DigimonFormTransformationModalProps> = ({
  isOpen,
  onClose,
  userDigimonId,
  currentDigimonId,
  formInfo,
  onParentClose,
}) => {
  const { transformDigimonForm, discoveredDigimon } = useDigimonStore();
  const [showAnimation, setShowAnimation] = useState(false);
  
  if (!isOpen) return null;
  
  const currentDigimon = DIGIMON_LOOKUP_TABLE[currentDigimonId];
  const formDigimon = DIGIMON_LOOKUP_TABLE[formInfo.formDigimonId];
  const isFormDiscovered = discoveredDigimon.includes(formInfo.formDigimonId);
  
  const handleTransform = async () => {
    setShowAnimation(true);
  };
  
  // This function will be called after animation completes
  const completeTransformation = async () => {
    try {
    
      const success = await transformDigimonForm(
        userDigimonId, 
        formInfo.formDigimonId,
        formInfo.formType
      );
      
      if (success) {
        onClose();
        if (onParentClose) {
          onParentClose();
        }
      } else {
        setShowAnimation(false);
      }
    } catch (error) {
      console.error("Error transforming Digimon:", error);
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Failed to transform Digimon."
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-300 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
          {formInfo.formType === 'X-Antibody' && <img src="/assets/x-antibody.png" alt="X-Antibody" className="w-6 h-6 mr-2" />}
          <h2 className="text-xl font-bold dark:text-gray-100">{formInfo.formType} Transformation</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">×</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Transform your Digimon into its {formInfo.formType} form?
          </p>
        </div>
        
        <div className="flex justify-center items-center space-x-8 my-6">
          <div className="text-center">
            <DigimonSprite
              digimonName={currentDigimon.name}
              fallbackSpriteUrl={currentDigimon.sprite_url}
              size="md"
              showHappinessAnimations={true}
            />
            <p className="font-medium dark:text-gray-200">{currentDigimon.name}</p>
          </div>
        
          
          <div className="text-center">
            {isFormDiscovered ? (
              <>
                <DigimonSprite
                  digimonName={formDigimon.name}
                  fallbackSpriteUrl={formDigimon.sprite_url}
                  size="md"
                  showHappinessAnimations={true}
                />
                <p className="font-medium dark:text-gray-200">{formDigimon.name}</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto flex items-center justify-center">
                  <DigimonSprite
                    digimonName={formDigimon.name}
                    fallbackSpriteUrl={formDigimon.sprite_url}
                    size="md"
                    showHappinessAnimations={true}
                    silhouette={true}
                  />
                </div>
                <p className="font-medium dark:text-gray-200">???</p>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleTransform}
            className="px-4 py-2 bg-blue-600 dark:bg-accent-600 text-white rounded hover:bg-blue-700 dark:hover:bg-accent-700"
          >
            Transform
          </button>
        </div>
      </div>
      
      {showAnimation && (
        <EvolutionAnimation
          oldSpriteUrl={currentDigimon.sprite_url}
          newSpriteUrl={formDigimon.sprite_url}
          onComplete={completeTransformation}
          isFormTransformation={true}
          formType={formInfo.formType}
        />
      )}
    </div>
  );
};

export default DigimonFormTransformationModal; 