import React from 'react';

interface ArenaHPBarProps {
  name: string;
  hp: number;
  maxHp: number;
  isDead: boolean;
}

const ArenaHPBar: React.FC<ArenaHPBarProps> = ({ name, hp, maxHp, isDead }) => {
  const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;

  const barColor =
    pct > 0.5
      ? '#4ade80' // green-400
      : pct > 0.25
        ? '#facc15' // yellow-400
        : '#f87171'; // red-400

  return (
    <div
      style={{
        width: 64,
        opacity: isDead ? 0.3 : 1,
        transition: 'opacity 500ms',
        pointerEvents: 'none',
      }}
    >
      {/* Name label */}
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          lineHeight: 1.2,
          marginBottom: 2,
        }}
      >
        {name}
      </div>

      {/* HP bar track */}
      <div
        style={{
          height: 5,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.4)',
        }}
      >
        {/* HP bar fill */}
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: barColor,
            borderRadius: 3,
            transition: 'width 200ms ease-out, background 300ms ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ArenaHPBar;
