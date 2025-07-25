import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATED_DIGIMON } from '../constants/animatedDigimonList';
import { getSpriteUrl } from '../utils/spriteManager';
import type { SpriteType } from '../utils/spriteManager';

interface DigimonSpriteProps {
  digimonName: string;
  fallbackSpriteUrl: string;
  happiness?: number;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  silhouette?: boolean;
  onClick?: () => void;
  showHappinessAnimations?: boolean;
  enableHopping?: boolean;
  currentSpriteType?: SpriteType;
}

const DigimonSprite: React.FC<DigimonSpriteProps> = ({
  digimonName,
  fallbackSpriteUrl = "/assets/digimon/agumon_professor.png",
  happiness = 100,
  size = 'md',
  silhouette = false,
  onClick,
  showHappinessAnimations = true,
  enableHopping = false,
  currentSpriteType: externalSpriteType
}) => {
  const [internalSpriteType, setInternalSpriteType] = useState<SpriteType>('idle1');
  const [hasAnimatedSprites, setHasAnimatedSprites] = useState(false);
  const [spriteToggle, setSpriteToggle] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if this Digimon has animated sprites
  useEffect(() => {
    if (digimonName && ANIMATED_DIGIMON.includes(digimonName)) {
      setHasAnimatedSprites(true);
    } else {
      setHasAnimatedSprites(false);
    }
  }, [digimonName]);

  // Set up sprite animation interval
  useEffect(() => {
    if (!hasAnimatedSprites || !showHappinessAnimations || externalSpriteType) return;
    
    // Update sprite every 0.75 seconds for idle animation
    const interval = setInterval(() => {
      if (isAnimating) return;
      
      // Toggle the sprite state
      setSpriteToggle(prev => !prev);
      
      // Determine sprite type based on happiness and toggle state
      let newSpriteType: SpriteType;
      
      if (happiness > 80) {
        newSpriteType = spriteToggle ? "idle1" : "idle2";
      } else {
        newSpriteType = spriteToggle ? "sad1" : "sad2";
      }
      
      setInternalSpriteType(newSpriteType);
    }, 750);
    
    return () => clearInterval(interval);
  }, [hasAnimatedSprites, happiness, isAnimating, spriteToggle, showHappinessAnimations, externalSpriteType]);

  // Use external sprite type if provided, otherwise use internal state
  const effectiveSpriteType = externalSpriteType || internalSpriteType;

  // Function to get the current sprite URL
  const getCurrentSpriteUrl = () => {
    if (hasAnimatedSprites && digimonName) {
      return getSpriteUrl(digimonName, effectiveSpriteType, fallbackSpriteUrl);
    }
    return fallbackSpriteUrl;
  };

  // Handle sprite click
  const handleSpriteClick = () => {
    if (!onClick || isAnimating) return;
    
    setIsAnimating(true);
    
    // Look left and right sequence - but only change the direction, not the scale
    setTimeout(() => setLookDirection(-1), 200);
    setTimeout(() => setLookDirection(1), 400);
    
    // Show happy reaction temporarily for animated sprites
    if (hasAnimatedSprites && showHappinessAnimations && !externalSpriteType) {
      setInternalSpriteType('happy');
    }
    
    // End animations
    setTimeout(() => {
      setIsAnimating(false);
      setShowHeart(false);
      
      // Reset to normal sprite type based on happiness (only if we're managing the sprite internally)
      if (hasAnimatedSprites && showHappinessAnimations && !externalSpriteType) {
        if (happiness > 80) {
          setInternalSpriteType(spriteToggle ? "idle1" : "idle2");
        } else {
          setInternalSpriteType(spriteToggle ? "sad1" : "sad2");
        }
      }
    }, 1000);
    
    // Call the provided onClick handler
    onClick();
  };

  // Size classes for container
  const sizeClasses = {
    xxs: "w-8 h-6",
    xs: "w-8 h-8",
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-40 h-40",
    xl: "w-128 h-128"
  };
  
  // Scale factors for the image based on size
  const scaleFactors = {
    xxs: 0.5,
    xs: 1,
    sm: 1.5,
    md: 2.5,
    lg: 4,
    xl: 6
  };

  // Animation variants - modified to maintain scale
  const hoppingVariants = {
    hop: {
      y: [0, -10, 0, -7, 0],
      transition: { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }
    }
  };

  const heartVariants = {
    initial: { opacity: 0, scale: 0, y: 0 },
    animate: { 
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
      y: -30,
      transition: { duration: 1 }
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      <motion.div
        animate={enableHopping
          ? {
              y: [0, -5, 0, -3, 0, -5, 0],
            }
          : { y: 0 }
        }
        transition={
          enableHopping
            ? {
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
              }
            : undefined
        }
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-full h-full">
          <motion.div
            animate={isAnimating ? "hop" : undefined}
            variants={hoppingVariants}
          >
            <img
              draggable="false"
              src={getCurrentSpriteUrl()}
              alt={digimonName}
              className="w-auto h-auto cursor-pointer"
              style={{
                imageRendering: "pixelated",
                transform: `scaleX(${lookDirection}) scale(${scaleFactors[size]})`,
                transformOrigin: "center center",
                position: "relative",
                display: "block",
                margin: "0 auto",
                ...(silhouette && { filter: "brightness(0)" })
              }}
              onClick={handleSpriteClick}
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).src = "/assets/digimon/agumon_professor.png";
              }}
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            variants={heartVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
          >
            <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'}`}>❤️</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigimonSprite; 