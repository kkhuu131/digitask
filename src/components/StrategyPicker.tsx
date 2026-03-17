import React, { useState } from 'react';
import { BattleDigimon } from '../types/battle';
import { Strategy } from '../engine/arenaTypes';
import DigimonSprite from './DigimonSprite';

// ─── Strategy metadata ─────────────────────────────────────────────────────────

const STRATEGIES: {
  value: Strategy;
  label: string;
  desc: string;
  activeColor: string;
  activeBg: string;
}[] = [
  {
    value: 'aggressive',
    label: 'Aggressive',
    desc: 'Charges in fast, attacks constantly',
    activeColor: '#ef4444',
    activeBg: 'rgba(239,68,68,0.15)',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    desc: 'Orbits and times attacks carefully',
    activeColor: '#6366f1',
    activeBg: 'rgba(99,102,241,0.15)',
  },
  {
    value: 'defensive',
    label: 'Defensive',
    desc: 'Circles wide, waits to counter',
    activeColor: '#22c55e',
    activeBg: 'rgba(34,197,94,0.15)',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface StrategyPickerProps {
  team: BattleDigimon[];
  onConfirm: (strategies: Strategy[]) => void;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StrategyPicker: React.FC<StrategyPickerProps> = ({ team, onConfirm, onBack }) => {
  const [strategies, setStrategies] = useState<Strategy[]>(
    team.map(() => 'balanced'),
  );

  const setStrategy = (index: number, strategy: Strategy) => {
    setStrategies(prev => prev.map((s, i) => (i === index ? strategy : s)));
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-100 text-gray-700 dark:text-gray-300 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-heading font-semibold dark:text-gray-100">Choose Strategies</h2>
          <p className="text-sm font-body text-gray-500 dark:text-gray-400">
            Set a battle style for each of your Digimon.
          </p>
        </div>
      </div>

      {/* Digimon rows */}
      <div className="flex flex-col gap-5 mb-6">
        {team.map((d, i) => {
          const selected = strategies[i];
          const selectedMeta = STRATEGIES.find(s => s.value === selected)!;

          return (
            <div
              key={d.id}
              className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 p-4"
            >
              {/* Digimon identity */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={d.digimon_name}
                    fallbackSpriteUrl={d.sprite_url}
                    showHappinessAnimations={false}
                    size="sm"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm dark:text-gray-100">{d.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Lv.{d.current_level} · {d.type} / {d.attribute}
                  </div>
                </div>
                {/* Current strategy badge */}
                <div
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: selectedMeta.activeColor,
                    background: selectedMeta.activeBg,
                    border: `1px solid ${selectedMeta.activeColor}`,
                  }}
                >
                  {selectedMeta.label}
                </div>
              </div>

              {/* Strategy buttons */}
              <div className="flex gap-2">
                {STRATEGIES.map(s => {
                  const isActive = selected === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStrategy(i, s.value)}
                      title={s.desc}
                      style={
                        isActive
                          ? {
                              borderColor: s.activeColor,
                              background: s.activeBg,
                              color: s.activeColor,
                            }
                          : undefined
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                        isActive
                          ? 'shadow-sm'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-300 hover:border-gray-400 dark:hover:border-gray-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Strategy description */}
              <p className="text-xs font-body text-gray-400 dark:text-gray-500 mt-2 text-center">
                {selectedMeta.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Fight button */}
      <button
        onClick={() => onConfirm(strategies)}
        className="w-full btn-primary py-3 text-base font-heading font-semibold rounded-xl"
      >
        Fight!
      </button>
    </div>
  );
};

export default StrategyPicker;
