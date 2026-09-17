import React, { useState } from 'react';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from './DigimonSprite';

interface StarterSelection {
  digimonId: number;
  name: string;
}

interface DigimonSelectionProps {
  onSelect: (digimonId: number, name: string) => void;
  multiSelect?: boolean;
  onMultiSelect?: (selections: StarterSelection[]) => void;
}

const DigimonSelection: React.FC<DigimonSelectionProps> = ({
  onSelect,
  multiSelect = false,
  onMultiSelect,
}) => {
  // Single-select state
  const [selectedDigimon, setSelectedDigimon] = useState<number | null>(null);
  const [digimonName, setDigimonName] = useState('');
  const [nameError, setNameError] = useState('');

  // Multi-select state
  const [selections, setSelections] = useState<StarterSelection[]>([]);
  const [multiNameErrors, setMultiNameErrors] = useState<string[]>(['', '', '']);

  // Get starter Digimon (IDs 1-5)
  const starterDigimon = Array.from({ length: 5 }, (_, i) => i + 1);

  // --- Single-select logic ---
  const handleSelectDigimon = (id: number) => {
    setSelectedDigimon(id);
  };

  const handleSubmit = () => {
    if (!selectedDigimon) return;

    if (!digimonName.trim()) {
      setNameError('Please give your Digimon a name');
      return;
    }
    if (digimonName.length > 20) {
      setNameError('Name must be 20 characters or less');
      return;
    }

    onSelect(selectedDigimon, digimonName);
  };

  // --- Multi-select logic ---
  const handleMultiSelectToggle = (id: number) => {
    setSelections((prev) => {
      const idx = prev.findIndex((s) => s.digimonId === id);
      if (idx !== -1) {
        // Deselect
        const next = prev.filter((s) => s.digimonId !== id);
        setMultiNameErrors(['', '', '']);
        return next;
      }
      if (prev.length >= 3) return prev; // Already at max
      return [...prev, { digimonId: id, name: DIGIMON_LOOKUP_TABLE[id].name }];
    });
  };

  const handleMultiNameChange = (index: number, value: string) => {
    setSelections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value };
      return next;
    });
    setMultiNameErrors((prev) => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  };

  const handleMultiSubmit = () => {
    if (selections.length !== 3) return;

    const errors = selections.map((s) => {
      if (!s.name.trim()) return 'Please give your Digimon a name';
      if (s.name.length > 20) return 'Name must be 20 characters or less';
      return '';
    });

    if (errors.some((e) => e)) {
      setMultiNameErrors(errors);
      return;
    }

    onMultiSelect?.(selections);
  };

  const isMultiSelected = (id: number) => selections.some((s) => s.digimonId === id);
  const multiSelectionIndex = (id: number) => selections.findIndex((s) => s.digimonId === id);

  // --- Render ---
  if (multiSelect) {
    return (
      <div className="min-w-0">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
          Select{' '}
          <span className="font-semibold text-accent-800 dark:text-accent-400">
            {selections.length}/3
          </span>{' '}
          Digimon to start your journey
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {starterDigimon.map((id) => {
            const digimon = DIGIMON_LOOKUP_TABLE[id];
            const selected = isMultiSelected(id);
            const slotIndex = multiSelectionIndex(id);
            const atMax = selections.length >= 3 && !selected;

            return (
              <button
                type="button"
                key={id}
                disabled={atMax}
                aria-pressed={selected}
                onClick={() => handleMultiSelectToggle(id)}
                className={`
                  min-w-0 p-2 border rounded-lg transition-colors flex flex-col items-center relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500
                  ${selected ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20' : atMax ? 'border-gray-200 dark:border-dark-100 opacity-40 cursor-not-allowed' : 'border-gray-200 dark:border-dark-100 hover:border-accent-400 cursor-pointer'}
                `}
              >
                {selected && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-accent-700 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {slotIndex + 1}
                  </span>
                )}
                <div className="w-16 h-20 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={digimon.name}
                    fallbackSpriteUrl={digimon.sprite_url}
                    showHappinessAnimations={true}
                  />
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-center">{digimon.name}</p>
              </button>
            );
          })}
        </div>

        {selections.length > 0 && (
          <div className="space-y-3 mb-4">
            {selections.map((sel, index) => {
              const digimon = DIGIMON_LOOKUP_TABLE[sel.digimonId];
              return (
                <div key={sel.digimonId}>
                  <label
                    htmlFor={`starter-name-${sel.digimonId}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nickname for {digimon.name}:
                  </label>
                  <input
                    id={`starter-name-${sel.digimonId}`}
                    type="text"
                    value={sel.name}
                    onChange={(e) => handleMultiNameChange(index, e.target.value)}
                    className="input w-full"
                    placeholder="Enter a name"
                    maxLength={20}
                  />
                  {multiNameErrors[index] && (
                    <p className="mt-1 text-sm text-red-600">{multiNameErrors[index]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-dark-300">
          <button
            type="button"
            onClick={handleMultiSubmit}
            disabled={selections.length !== 3}
            className="btn-primary w-full"
          >
            {selections.length === 3 ? 'Save my partners' : `Choose ${3 - selections.length} more`}
          </button>
        </div>
      </div>
    );
  }

  // Single-select (original behavior, used by CreatePet)
  return (
    <div className="max-h-[80vh] overflow-y-auto px-2">
      <div className="text-center mb-4"></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {starterDigimon.map((id) => {
          const digimon = DIGIMON_LOOKUP_TABLE[id];

          return (
            <div
              key={id}
              onClick={() => handleSelectDigimon(id)}
              className={`
                p-2 border rounded-lg cursor-pointer transition-all
                ${selectedDigimon === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                flex flex-col items-center
              `}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <DigimonSprite
                  digimonName={digimon.name}
                  fallbackSpriteUrl={digimon.sprite_url}
                  showHappinessAnimations={false}
                />
              </div>
              <p className="mt-2 text-sm sm:text-base font-medium text-center">{digimon.name}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4">
        <label htmlFor="digimonName" className="block text-sm font-medium text-gray-700 mb-1">
          Name your Digimon:
        </label>
        <input
          type="text"
          id="digimonName"
          value={digimonName}
          onChange={(e) => {
            setDigimonName(e.target.value);
            setNameError('');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter a name"
          maxLength={20}
        />
        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
      </div>

      <div className="sticky bottom-0 pt-4 pb-2 bg-white">
        <button
          onClick={handleSubmit}
          disabled={!selectedDigimon}
          className={`
            w-full py-2 px-4 rounded-md text-white font-medium
            ${selectedDigimon ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
          `}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default DigimonSelection;
