import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { sampleBattleSp } from '../engine/battleSp';
import BattleDigimonSprite from './BattleDigimonSprite';
import BattleSpGauge from './BattleSpGauge';

const DURATION_MS = 8000;
const SP_FRAMES = [
  { t: 0, battleSp: 0, battleSpCapacity: 100 },
  { t: 4000, battleSp: 80, battleSpCapacity: 100 },
  { t: 4300, battleSp: 0, battleSpCapacity: 100, transition: 'snap' as const },
  { t: DURATION_MS, battleSp: 74, battleSpCapacity: 100 },
] as const;

const TechniqueSpPrototype = () => {
  const reducedMotion = useReducedMotion();
  const startedAtRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const update = (timestamp: number) => {
      if (startedAtRef.current === null) startedAtRef.current = timestamp;
      setElapsed((timestamp - startedAtRef.current) % DURATION_MS);
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const sp = sampleBattleSp(SP_FRAMES, elapsed);
  const isReady = elapsed >= 4000 && elapsed < 4300;
  const isImpact = elapsed >= 4300 && elapsed < 4750;
  const attacker = DIGIMON_LOOKUP_TABLE[18];
  const target = DIGIMON_LOOKUP_TABLE[23];

  return (
    <div className="space-y-3" data-technique-sp-prototype="true">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="ui-section-title">Technique SP prototype</h3>
          <p className="ui-description mt-1">
            Deterministic local samples: charge, commit, spend, and recharge.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-dark-200 dark:text-gray-300">
          {isReady ? 'Ready' : isImpact ? 'Impact Strike' : 'Charging'}
        </span>
      </div>

      <BattleSpGauge battleSp={sp.battleSp} capacity={sp.battleSpCapacity} techniqueCost={80} />

      <div className="relative h-40 overflow-hidden rounded-xl bg-[#0b0b18]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.13),transparent_62%)]" />
        <div className="absolute bottom-7 left-[22%] h-16 w-16">
          <BattleDigimonSprite
            digimonName={attacker.name}
            fallbackSpriteUrl={attacker.sprite_url}
            size="md"
            animationState={isImpact ? 'attacking' : 'idle'}
            spriteToggle={false}
          />
        </div>
        <div className="absolute bottom-7 right-[22%] h-16 w-16">
          <BattleDigimonSprite
            digimonName={target.name}
            fallbackSpriteUrl={target.sprite_url}
            size="md"
            animationState={isImpact ? 'hit' : 'idle'}
            spriteToggle={false}
          />
        </div>
        {(isReady || isImpact) && (
          <div
            aria-hidden="true"
            className={`absolute bottom-5 right-[calc(22%_-_24px)] h-8 w-28 rounded-[50%] bg-[radial-gradient(ellipse,rgba(245,158,11,0.8),rgba(245,158,11,0.22)_42%,transparent_72%)] blur-[2px] ${reducedMotion ? '' : 'animate-pulse'}`}
          />
        )}
        {isImpact && (
          <div
            aria-hidden="true"
            className="absolute bottom-[58px] right-[calc(22%_+_18px)] h-16 w-16 rounded-full bg-[radial-gradient(circle,#fff_0%,rgba(251,191,36,0.75)_18%,rgba(245,158,11,0.2)_48%,transparent_72%)] mix-blend-screen"
          />
        )}
      </div>
    </div>
  );
};

export default TechniqueSpPrototype;
