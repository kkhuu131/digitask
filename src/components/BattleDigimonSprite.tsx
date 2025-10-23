import React, { useState, useEffect } from 'react';
import { getSpriteUrl, SpriteType } from '../utils/spriteManager';
import { ANIMATED_DIGIMON } from '../constants/animatedDigimonList';

interface BattleDigimonSpriteProps {
  digimonName: string;
  fallbackSpriteUrl: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animationState?: 'idle' | 'attacking' | 'hit' | 'cheering' | 'sad' | 'victory' | 'defeat' | 'dead';
  isAnimating?: boolean;
  spriteToggle?: boolean; // Centralized timing from parent
  className?: string;
  style?: React.CSSProperties;
}

const BattleDigimonSprite: React.FC<BattleDigimonSpriteProps> = ({
  digimonName,
  fallbackSpriteUrl,
  size = 'md',
  animationState = 'idle',
  spriteToggle = false,
  className = '',
  style = {}
}) => {
  const [currentSprite, setCurrentSprite] = useState<string>(fallbackSpriteUrl);

  // Check if this Digimon has animated sprites
  const hasAnimatedSprites = ANIMATED_DIGIMON.includes(digimonName);

  // Size classes mapping
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12', 
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  // Determine sprite type based on animation state
  const getSpriteType = (): SpriteType => {
    if (!hasAnimatedSprites) return 'idle1';

    switch (animationState) {
      case 'attacking':
        return 'attack';
      case 'hit':
        return 'angry';
      case 'cheering':
        return spriteToggle ? 'cheer' : 'happy';
      case 'sad':
        return spriteToggle ? 'sad1' : 'sad2';
      case 'victory':
        return spriteToggle ? 'cheer' : 'happy';
      case 'defeat':
        return spriteToggle ? 'sad1' : 'sad2';
      case 'dead':
        return 'sad2'; // Static sad2 sprite for dead Digimon
      case 'idle':
      default:
        return spriteToggle ? 'idle1' : 'idle2';
    }
  };

  // Update sprite when animation state changes
  useEffect(() => {
    if (hasAnimatedSprites) {
      const spriteType = getSpriteType();
      const spriteUrl = getSpriteUrl(digimonName, spriteType, fallbackSpriteUrl);
      setCurrentSprite(spriteUrl);
    } else {
      setCurrentSprite(fallbackSpriteUrl);
    }
  }, [digimonName, animationState, spriteToggle, hasAnimatedSprites, fallbackSpriteUrl]);

  // No internal timing - all timing is controlled by parent component

  return (
    <div
      className={`${sizeClasses[size]} ${className}`}
      style={style}
    >
      <img
        src={currentSprite}
        alt={digimonName}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackSpriteUrl;
        }}
      />
    </div>
  );
};

export default BattleDigimonSprite;
