import { useState } from 'react';

export interface DialogueStep {
  speaker: 'bokomon' | 'neemon' | 'both';
  text: string;
  action?: { label: string; onClick: () => void };
}

interface DigimonDialogueProps {
  steps: DialogueStep[];
  onComplete: () => void;
  isSkippable?: boolean;
}

const DigimonDialogue = ({ steps, onComplete, isSkippable = true }: DigimonDialogueProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  if (!step) return null;
  const speaker =
    step.speaker === 'both'
      ? 'Bokomon & Neemon'
      : step.speaker === 'bokomon'
        ? 'Bokomon'
        : 'Neemon';
  const lastStep = currentStep === steps.length - 1;

  return (
    <section aria-label="Page guidance" className="ui-panel p-4 mb-4">
      <div className="flex items-start gap-3">
        <img
          src={`/assets/digimon/${step.speaker === 'neemon' ? 'neemon' : 'bokomon'}.png`}
          alt=""
          className="w-10 h-10 shrink-0 object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{speaker}</p>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            {step.text}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {currentStep + 1} of {steps.length}
        </span>
        <div className="flex flex-wrap gap-2">
          {isSkippable && (
            <button type="button" className="btn-secondary" onClick={onComplete}>
              Close guide
            </button>
          )}
          {currentStep > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (step.action) {
                step.action.onClick();
                return;
              }
              if (lastStep) onComplete();
              else setCurrentStep(currentStep + 1);
            }}
          >
            {step.action?.label ?? (lastStep ? 'Got it' : 'Next')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DigimonDialogue;
