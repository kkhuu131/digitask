import React from 'react';
import { motion } from 'framer-motion';

export interface TechniqueEffect {
  id: string;
  techniqueId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  windupMs: number;
  phase: 'windup' | 'hit';
}

interface Props {
  effects: TechniqueEffect[];
  reducedMotion: boolean;
}

const TechniqueEffects: React.FC<Props> = ({ effects, reducedMotion }) => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    {effects.map((effect) => {
      if (effect.techniqueId === 'ember-burst') {
        const dx = effect.targetX - effect.sourceX;
        const dy = effect.targetY - effect.sourceY;
        return (
          <React.Fragment key={effect.id}>
            {effect.phase === 'windup' && (
              <motion.div
                data-technique-effect="ember-burst"
                className="absolute rounded-full"
                style={{
                  left: effect.sourceX - 12,
                  top: effect.sourceY - 12,
                  width: 24,
                  height: 24,
                  zIndex: Math.round(Math.max(effect.sourceY, effect.targetY)) + 4,
                  background:
                    'radial-gradient(circle at 38% 35%, #fff7cf 0 12%, #ffd166 24%, #ff6b2c 55%, #bd2417 72%, transparent 74%)',
                  boxShadow:
                    '0 0 10px 3px rgba(255,209,102,.9), -12px 2px 18px 2px rgba(255,89,33,.5)',
                  filter: 'saturate(1.2)',
                }}
                initial={{ x: 0, y: 0, scale: reducedMotion ? 0.8 : 0.45, opacity: 0.8 }}
                animate={{
                  x: reducedMotion ? dx : [0, dx * 0.18, dx],
                  y: reducedMotion ? dy : [0, dy * 0.18 - 10, dy],
                  scale: reducedMotion ? 1 : [0.45, 1.15, 0.82],
                  opacity: [0.75, 1, 1],
                }}
                transition={{
                  duration: reducedMotion ? 0.16 : effect.windupMs / 1000,
                  ease: 'easeIn',
                }}
              />
            )}
            {effect.phase === 'hit' && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: effect.targetX - 48,
                  top: effect.targetY - 48,
                  width: 96,
                  height: 96,
                  zIndex: Math.round(effect.targetY) + 5,
                  background:
                    'radial-gradient(circle, rgba(255,250,218,.98) 0 8%, rgba(255,174,55,.9) 20%, rgba(239,68,35,.55) 42%, transparent 70%)',
                  mixBlendMode: 'screen',
                }}
                initial={{ scale: 0.15, opacity: 1 }}
                animate={{ scale: reducedMotion ? 0.7 : 1.35, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.2 : 0.48, ease: 'easeOut' }}
              />
            )}
          </React.Fragment>
        );
      }

      const isHit = effect.phase === 'hit';
      return (
        <motion.div
          key={effect.id}
          data-technique-effect="impact-strike"
          className="absolute rounded-full"
          style={{
            left: (isHit ? effect.targetX : effect.sourceX) - 44,
            top: (isHit ? effect.targetY : effect.sourceY) - 30,
            width: 88,
            height: 60,
            zIndex: Math.round(isHit ? effect.targetY : effect.sourceY) + 5,
            border: '3px solid rgba(255,245,205,.9)',
            boxShadow: '0 0 14px rgba(255,196,74,.8), inset 0 0 18px rgba(255,255,255,.55)',
            mixBlendMode: 'screen',
          }}
          initial={{ scale: isHit ? 0.2 : 1.1, opacity: 0.9 }}
          animate={{
            scale: isHit ? (reducedMotion ? 0.75 : 1.45) : [1.1, 0.55, 0.8],
            opacity: isHit ? 0 : [0.35, 1, 0.7],
            rotate: isHit && !reducedMotion ? -14 : 0,
          }}
          transition={{
            duration: isHit ? (reducedMotion ? 0.2 : 0.42) : effect.windupMs / 1000,
            ease: isHit ? 'easeOut' : 'easeInOut',
          }}
        />
      );
    })}
  </div>
);

export default TechniqueEffects;
