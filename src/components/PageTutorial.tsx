import { useState, useEffect } from 'react';
import DigimonDialogue, { DialogueStep } from './DigimonDialogue';
import { TutorialManager } from '../utils/tutorialManager';

interface PageTutorialProps {
  tutorialId: string;
  steps: DialogueStep[];
}

const PageTutorial: React.FC<PageTutorialProps> = ({ tutorialId, steps }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // Check if this tutorial has been completed
    const hasCompleted = TutorialManager.hasCompleted(tutorialId);
    
    if (!hasCompleted) {
      setShowTutorial(true);
    }
  }, [tutorialId]);
  
  const handleComplete = () => {
    TutorialManager.markCompleted(tutorialId);
    setShowTutorial(false);
  };
  
  if (!showTutorial) {
    return null;
  }
  
  return (
    <DigimonDialogue 
      steps={steps} 
      onComplete={handleComplete}
    />
  );
};

export default PageTutorial; 