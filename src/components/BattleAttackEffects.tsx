import { motion } from 'framer-motion';
import { WORLD_W, WORLD_H } from '../engine/arenaTypes';

export interface AttackEffect {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  color: string;
  damage: number;
  critical: boolean;
  miss: boolean;
  skill: boolean;
  lane: number;
}

/** Hit-time cues, not a projectile simulation: damage and impact stay synchronized. */
const BattleAttackEffects = ({
  effects,
  reducedMotion,
  labelScale,
}: {
  effects: AttackEffect[];
  reducedMotion: boolean;
  labelScale: number;
}) => (
  <>
    <svg
      aria-hidden="true"
      width={WORLD_W}
      height={WORLD_H}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1900,
        overflow: 'visible',
      }}
    >
      {effects.map((effect) => {
        const angle = Math.atan2(effect.targetY - effect.sourceY, effect.targetX - effect.sourceX);
        const arrow = `${effect.targetX - 16 * Math.cos(angle - 0.5)},${effect.targetY - 16 * Math.sin(angle - 0.5)} ${effect.targetX},${effect.targetY} ${effect.targetX - 16 * Math.cos(angle + 0.5)},${effect.targetY - 16 * Math.sin(angle + 0.5)}`;
        return (
          <motion.g
            key={effect.id}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.35 : effect.skill ? 0.6 : 0.35 }}
          >
            <line
              x1={effect.sourceX}
              y1={effect.sourceY}
              x2={effect.targetX}
              y2={effect.targetY}
              stroke={effect.miss ? '#d1d5db' : effect.color}
              strokeWidth={effect.skill ? 5 : 2.5}
              strokeDasharray={effect.miss ? '6 6' : undefined}
              strokeLinecap="round"
            />
            <polyline
              points={arrow}
              fill="none"
              stroke={effect.color}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {!effect.miss && (
              <path
                d={`M ${effect.targetX - 14} ${effect.targetY + 18} L ${effect.targetX + 14} ${effect.targetY - 18}`}
                stroke={effect.critical ? '#fbbf24' : '#fff'}
                strokeWidth={effect.critical ? 6 : 3}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
    {effects.map((effect) => (
      <motion.div
        key={effect.id}
        aria-hidden="true"
        data-battle-damage="true"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: [1, 1, 0], y: reducedMotion ? 0 : -32 }}
        transition={{ duration: 0.95, times: [0, 0.7, 1] }}
        style={{
          position: 'absolute',
          left: effect.targetX,
          top: effect.targetY - 24 - labelScale * (28 + effect.lane * 24),
          zIndex: 2000,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            transform: `translateX(-50%) scale(${labelScale})`,
            transformOrigin: 'top center',
            color: effect.miss ? '#e5e7eb' : effect.critical ? '#fcd34d' : '#fff',
            fontSize: effect.critical ? 20 : 16,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            WebkitTextStroke: '3px #07060f',
            paintOrder: 'stroke fill',
            textShadow: '0 2px 2px #07060f',
          }}
        >
          {effect.miss ? 'MISS' : `${effect.critical ? 'CRIT ' : ''}${effect.damage}`}
        </div>
      </motion.div>
    ))}
  </>
);

export default BattleAttackEffects;
