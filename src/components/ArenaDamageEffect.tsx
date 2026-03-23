import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Attribute → glow color map ───────────────────────────────────────────────

const ATTRIBUTE_COLORS: Record<string, string> = {
  Fire: '#f97316', // orange-500
  Water: '#38bdf8', // sky-400
  Plant: '#4ade80', // green-400
  Electric: '#facc15', // yellow-400
  Wind: '#a3e635', // lime-400
  Earth: '#a16207', // yellow-800
  Dark: '#c084fc', // purple-400
  Light: '#fde68a', // amber-200
  Neutral: '#94a3b8', // slate-400
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DamageEffect {
  id: string; // unique key (Date.now() + targetId)
  x: number; // viewport-space X
  y: number; // viewport-space Y
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  isSkill: boolean;
  attribute: string; // attacker attribute — for skill color
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ArenaDamageEffectProps {
  effects: DamageEffect[];
}

const ArenaDamageEffect: React.FC<ArenaDamageEffectProps> = ({ effects }) => (
  <AnimatePresence>
    {effects.map((effect) => {
      if (effect.isMiss) {
        return (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: effect.x,
              top: effect.y,
              fontSize: 11,
              fontStyle: 'italic',
              color: '#94a3b8',
              fontWeight: 600,
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -50%)',
            }}
          >
            MISS
          </motion.div>
        );
      }

      if (effect.isSkill) {
        const color = ATTRIBUTE_COLORS[effect.attribute] ?? '#fff';
        return (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, scale: 0.6, y: 0 }}
            animate={{ opacity: 0, scale: 1.1, y: -55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: effect.x,
              top: effect.y,
              fontSize: 20,
              fontWeight: 900,
              color: '#fff',
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: `0 0 12px ${color}, 0 0 24px ${color}, 0 2px 6px rgba(0,0,0,0.9)`,
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -50%)',
              letterSpacing: 0.5,
            }}
          >
            {effect.damage}
          </motion.div>
        );
      }

      if (effect.isCritical) {
        return (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, scale: 0.8, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: effect.x,
              top: effect.y,
              fontSize: 18,
              fontWeight: 900,
              color: '#facc15',
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 0 10px rgba(250,204,21,0.8), 0 2px 6px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {effect.damage}!
          </motion.div>
        );
      }

      // Normal hit
      return (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -50 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: effect.x,
            top: effect.y,
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 1px 5px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {effect.damage}
        </motion.div>
      );
    })}
  </AnimatePresence>
);

export default ArenaDamageEffect;
export { ATTRIBUTE_COLORS };
