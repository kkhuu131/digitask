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
  simplifiedEffects,
  labelScale,
}: {
  effects: AttackEffect[];
  reducedMotion: boolean;
  simplifiedEffects: boolean;
  labelScale: number;
}) => (
  <>
    <svg
      aria-hidden="true"
      data-battle-attack-effects="true"
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
        const angleDegrees = (angle * 180) / Math.PI;
        const color = effect.miss ? '#d1d5db' : effect.color;
        return (
          <motion.g
            key={effect.id}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.35 : effect.skill ? 0.6 : 0.35 }}
            transform={`rotate(${angleDegrees} ${effect.targetX} ${effect.targetY})`}
          >
            {effect.skill && !effect.miss && (
              <ellipse
                cx={effect.targetX}
                cy={effect.targetY}
                rx="38"
                ry="24"
                fill={effect.color}
                opacity="0.2"
              />
            )}
            <path
              d={`M ${effect.targetX - (effect.skill ? 58 : 32)} ${effect.targetY} Q ${effect.targetX - 20} ${effect.targetY - (effect.skill ? 11 : 6)} ${effect.targetX - 4} ${effect.targetY}`}
              fill="none"
              stroke={color}
              strokeWidth={effect.skill ? 8 : 4}
              strokeLinecap="round"
            />
            <path
              d={`M ${effect.targetX - (effect.skill ? 42 : 24)} ${effect.targetY - 12} Q ${effect.targetX - 17} ${effect.targetY - 4} ${effect.targetX + 8} ${effect.targetY + 13}`}
              fill="none"
              stroke={color}
              strokeWidth={effect.skill ? 4 : 2.5}
              strokeLinecap="round"
              opacity="0.85"
            />
            {!effect.miss && !simplifiedEffects && (
              <>
                <path
                  d={`M ${effect.targetX - 10} ${effect.targetY + 22} Q ${effect.targetX} ${effect.targetY} ${effect.targetX + 15} ${effect.targetY - 20}`}
                  fill="none"
                  stroke={effect.critical ? '#fbbf24' : '#fff'}
                  strokeWidth={effect.critical ? 6 : 3}
                  strokeLinecap="round"
                />
                <circle
                  cx={effect.targetX}
                  cy={effect.targetY}
                  r={effect.skill ? 9 : 5}
                  fill="#fff"
                  opacity="0.9"
                />
              </>
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
        animate={{ opacity: [1, 1, 0], y: reducedMotion ? 0 : simplifiedEffects ? -20 : -32 }}
        transition={{ duration: simplifiedEffects ? 0.65 : 0.95, times: [0, 0.7, 1] }}
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
            WebkitTextStroke: `${simplifiedEffects ? 2 : 3}px #07060f`,
            paintOrder: 'stroke fill',
            textShadow: simplifiedEffects ? 'none' : '0 2px 2px #07060f',
          }}
        >
          {effect.miss ? 'MISS' : `${effect.critical ? 'CRIT ' : ''}${effect.damage}`}
        </div>
      </motion.div>
    ))}
  </>
);

export default BattleAttackEffects;
