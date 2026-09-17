import { useState, useEffect } from 'react';
import { CircleHelp } from 'lucide-react';
import DigimonDialogue, { DialogueStep } from './DigimonDialogue';
import { TutorialManager } from '../utils/tutorialManager';

interface PageTutorialProps {
  tutorialId: string;
  steps: DialogueStep[];
}

const PageTutorial = ({ tutorialId, steps }: PageTutorialProps) => {
  const [showWelcome, setShowWelcome] = useState(() => !TutorialManager.hasCompleted(tutorialId));
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setShowWelcome(!TutorialManager.hasCompleted(tutorialId));
    setShowGuide(false);
  }, [tutorialId]);

  const dismiss = () => {
    TutorialManager.markCompleted(tutorialId);
    setShowWelcome(false);
    setShowGuide(false);
  };
  if (steps.length === 0) return null;
  if (showGuide) return <DigimonDialogue key={tutorialId} steps={steps} onComplete={dismiss} />;

  return showWelcome ? (
    <aside aria-label="Getting started" className="ui-panel p-4 mb-4">
      <div className="flex items-start gap-3">
        <img
          src="/assets/digimon/bokomon.png"
          alt=""
          className="w-10 h-10 shrink-0 object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            A tip from Bokomon
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{steps[0].text}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {steps.length > 1 && (
              <button type="button" className="btn-outline" onClick={() => setShowGuide(true)}>
                Show me more
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={dismiss}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </aside>
  ) : (
    <div className="mb-4">
      <button type="button" className="btn-outline" onClick={() => setShowGuide(true)}>
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
        Help
      </button>
    </div>
  );
};

export default PageTutorial;
