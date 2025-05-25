import React, { useState } from 'react';
import { useDigimonStore } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { DigimonFormInfo } from '../constants/digimonFormsLookup';
import EvolutionAnimation from './EvolutionAnimation';
import { useNotificationStore } from '../store/notificationStore';

interface DigimonFormTransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDigimonId: string;
  currentDigimonId: number;
  formInfo: DigimonFormInfo;
  onParentClose?: () => void;
  consumeXAntibody?: () => Promise<boolean>;
}

const DigimonFormTransformationModal: React.FC<DigimonFormTransformationModalProps> = ({
  isOpen,
  onClose,
  userDigimonId,
  currentDigimonId,
  formInfo,
  onParentClose,
  consumeXAntibody
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
      // Actually consume the X-Antibody here
      if (formInfo.formType === 'X-Antibody' && consumeXAntibody) {
        const consumed = await consumeXAntibody();
        if (!consumed) {
          useNotificationStore.getState().addNotification({
            type: "error",
            message: "Failed to consume X-Antibody."
          });
          setShowAnimation(false);
          return;
        }
      }
      
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
          {formInfo.formType === 'X-Antibody' && <img src="/assets/x-antibody.png" alt="X-Antibody" className="w-6 h-6 mr-2" />}
          <h2 className="text-xl font-bold">{formInfo.formType} Transformation</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Transform your Digimon into its {formInfo.formType} form?
          </p>
        </div>
        
        <div className="flex justify-center items-center space-x-8 my-6">
          <div className="text-center">
            <img 
              src={currentDigimon.sprite_url} 
              alt={currentDigimon.name}
              className="w-24 h-24 mx-auto"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="mt-2 font-medium">{currentDigimon.name}</p>
          </div>
          
          <div className="text-2xl">→</div>
          
          <div className="text-center">
            {isFormDiscovered ? (
              <>
                <img 
                  src={formDigimon.sprite_url} 
                  alt={formDigimon.name}
                  className="w-24 h-24 mx-auto"
                  style={{ imageRendering: "pixelated" }}
                />
                <p className="mt-2 font-medium">{formDigimon.name}</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto flex items-center justify-center">
                  <img 
                    src={formDigimon.sprite_url} 
                    alt="Unknown Digimon"
                    className="w-24 h-24 mx-auto"
                    style={{ 
                      imageRendering: "pixelated",
                      filter: "brightness(0) contrast(100%)", 
                      opacity: 0.7 
                    }}
                  />
                </div>
                <p className="mt-2 font-medium">???</p>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleTransform}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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