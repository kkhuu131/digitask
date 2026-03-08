import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Laugh, Smile, Meh, Frown, Moon } from "lucide-react";
import { useDigimonStore, UserDigimon, Digimon as DigimonType, EvolutionOption } from "../store/petStore";
import { useState, useEffect, useRef } from "react";
import DigimonDetailModal from "./DigimonDetailModal";
import { DigimonAttribute, DigimonType as DigimonBattleType } from "../store/battleStore";
import TypeAttributeIcon from "./TypeAttributeIcon";
import EvolutionAnimation from "./EvolutionAnimation";
import { getSpriteUrl } from '../utils/spriteManager';
import { ANIMATED_DIGIMON } from '../constants/animatedDigimonList';
import type { SpriteType } from '../utils/spriteManager';
import { calculateFinalStats } from "@/utils/digimonStatCalculation";

// Phase 5.2 — attribute glow class lookup. Maps Digimon attribute to the plain CSS
// class defined in src/index.css (Phase 1) that sets --stage-glow. Plain object
// (not template literal) avoids any Tailwind JIT purge concern.
const ATTRIBUTE_GLOW_CLASS: Record<string, string> = {
  Vaccine: 'sprite-stage-vaccine',
  Virus:   'sprite-stage-virus',
  Data:    'sprite-stage-data',
  Free:    'sprite-stage-free',
};

interface DigimonProps {
  userDigimon: UserDigimon;
  digimonData: DigimonType;
  evolutionOptions: EvolutionOption[];
}

const Digimon: React.FC<DigimonProps> = ({ userDigimon, digimonData, evolutionOptions }) => {
  const { evolveDigimon, fetchAllUserDigimon } = useDigimonStore();
  // Phase 7.7 — honour prefers-reduced-motion: skip looping bounce + shimmer animations
  const prefersReducedMotion = useReducedMotion();

  // Add a local state to track XP and level
  const [currentXP, setCurrentXP] = useState(userDigimon.experience_points);
  const [currentLevel, setCurrentLevel] = useState(userDigimon.current_level);
  const [xpForNextLevel, setXpForNextLevel] = useState(userDigimon.current_level * 20);
  
  // Animation states
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isStatIncreasing, setIsStatIncreasing] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(2.5);
  
  // Track level up sprite animation (happy/cheer alternating)
  const [levelUpSpriteType, setLevelUpSpriteType] = useState<SpriteType | null>(null);
  
  // Refs to track previous values
  const prevLevelRef = useRef(userDigimon.current_level);
  const prevXPRef = useRef(userDigimon.experience_points);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Add state to track the current digimon data
  const [currentDigimon, setCurrentDigimon] = useState<UserDigimon>(userDigimon);
  
  // Add state for devolution
  const { devolveDigimon } = useDigimonStore();

  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [showDevolutionAnimation, setShowDevolutionAnimation] = useState(false);
  const [evolutionSprites, setEvolutionSprites] = useState<{old: string, new: string} | null>(null);
  
  // Add pending state variables like in UserDigimonPage
  const [pendingEvolution, setPendingEvolution] = useState<{toDigimonId: number} | null>(null);
  const [pendingDevolution, setPendingDevolution] = useState<{toDigimonId: number} | null>(null);

  // Add state for current sprite type
  const [currentSpriteType, setCurrentSpriteType] = useState<SpriteType>('idle1');
  const [hasAnimatedSprites, setHasAnimatedSprites] = useState(false);
  
  // Add state for sprite toggle
  const [spriteToggle, setSpriteToggle] = useState(false);
  
  // Add these new state variables
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  
  // Check if this Digimon has animated sprites
  useEffect(() => {
    if (digimonData && ANIMATED_DIGIMON.includes(digimonData.name)) {
      setHasAnimatedSprites(true);
    } else {
      setHasAnimatedSprites(false);
    }
  }, [digimonData]);
  
  // Add this effect to check for inactivity
  useEffect(() => {
    if (!hasAnimatedSprites) return;
    
    // Check every 10 seconds if the Digimon should be sleeping
    const inactivityCheckInterval = setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastInteractionTime;
      
      // If inactive for more than 1 minute (60000ms), set to sleeping
      if (inactiveTime > 60000 && !isSleeping) {
        setIsSleeping(true);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(inactivityCheckInterval);
  }, [hasAnimatedSprites, lastInteractionTime, isSleeping]);
  
  // Modify the sprite animation interval to handle sleeping state
  useEffect(() => {
    if (!hasAnimatedSprites) return;
    
    // If level up animation is active, use that sprite type instead
    if (levelUpSpriteType) {
      setCurrentSpriteType(levelUpSpriteType);
      return;
    }
    
    // Update sprite every 0.75 seconds for idle animation
    const interval = setInterval(() => {
      if (isLevelingUp || isStatIncreasing) return;
      
      // Toggle the sprite state
      setSpriteToggle(prev => !prev);
      
      // If sleeping, alternate between sleeping1 and sleeping2
      if (isSleeping) {
        setCurrentSpriteType(spriteToggle ? "sleeping1" : "sleeping2");
        return;
      }
      
      // Otherwise, determine sprite type based on happiness and toggle state
      let newSpriteType: SpriteType;
      
      if (userDigimon.happiness > 60) {
        newSpriteType = spriteToggle ? "idle1" : "idle2";
      } else {
        newSpriteType = spriteToggle ? "sad1" : "sad2";
      }
      
      setCurrentSpriteType(newSpriteType);
    }, 750);
    
    return () => clearInterval(interval);
  }, [hasAnimatedSprites, userDigimon.happiness, isLevelingUp, isStatIncreasing, spriteToggle, isSleeping, levelUpSpriteType]);
  
  // Function to get the current sprite URL
  const getCurrentSpriteUrl = () => {
    if (hasAnimatedSprites && digimonData) {
      return getSpriteUrl(digimonData.name, currentSpriteType, digimonData.sprite_url);
    }
    return digimonData?.sprite_url || '/assets/digimon/agumon_professor.png';
  };
  
  // Update local state when userDigimon changes
  useEffect(() => {
    // Check for level up
    if (userDigimon.current_level > prevLevelRef.current) {
      triggerLevelUpAnimation();
    }
    // Check for XP increase (but not when leveling up, to avoid double animation)
    else if (userDigimon.experience_points > prevXPRef.current) {
      triggerStatIncreaseAnimation();
    }
    
    // Update all state values
    setCurrentXP(userDigimon.experience_points);
    setCurrentLevel(userDigimon.current_level);
    setXpForNextLevel(userDigimon.current_level * 20);
    
    // Update refs for next comparison
    prevLevelRef.current = userDigimon.current_level;
    prevXPRef.current = userDigimon.experience_points;
    
    // Update currentDigimon with the latest userDigimon data
    setCurrentDigimon(userDigimon);
  }, [userDigimon]);

  // Add event listener for name changes
  useEffect(() => {
    const handleNameChange = (event: CustomEvent) => {
      if (event.detail && event.detail.digimonId) {
        fetchAllUserDigimon();
      }
    };

    window.addEventListener('digimon-name-changed', handleNameChange as EventListener);
    
    return () => {
      window.removeEventListener('digimon-name-changed', handleNameChange as EventListener);
    };
  }, [fetchAllUserDigimon]);
  
  // Function to trigger level up animation
  const triggerLevelUpAnimation = () => {
    setIsLevelingUp(true);
    setShowHeart(true);
    
    // Start with happy sprite
    setLevelUpSpriteType('happy');
    
    // Alternate between happy and cheer every 500ms
    let spriteToggle = true;
    const interval = setInterval(() => {
      setLevelUpSpriteType(spriteToggle ? 'cheer' : 'happy');
      spriteToggle = !spriteToggle;
    }, 500);
    
    // Look left and right sequence
    setTimeout(() => setLookDirection(-2.5), 200);
    setTimeout(() => setLookDirection(2.5), 400);
    setTimeout(() => setLookDirection(-2.5), 600);
    setTimeout(() => setLookDirection(2.5), 800);
    
    // Stop animation after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsLevelingUp(false);
      setShowHeart(false);
      setLevelUpSpriteType(null);
    }, 3000);
  };
  
  // Function to trigger stat increase animation
  const triggerStatIncreaseAnimation = () => {
    setIsStatIncreasing(true);
    setShowHeart(true);
    
    // Look left and right sequence
    setTimeout(() => setLookDirection(-2.5), 200);
    setTimeout(() => setLookDirection(2.5), 400);
    
    // End animations
    setTimeout(() => {
      setIsStatIncreasing(false);
      setShowHeart(false);
    }, 1000);
  };
  
  // Calculate percentages for happiness bar
  const happinessPercentage = Math.max(0, Math.min(100, (userDigimon.happiness / 100) * 100));
  
  // Calculate XP percentage
  const xpPercentage = Math.max(0, Math.min(100, (currentXP / xpForNextLevel) * 100));
  
  // Function to complete evolution after animation
  const completeEvolution = async () => {
    if (!pendingEvolution || !evolutionSprites) return;
    
    try {
      const {toDigimonId} = pendingEvolution;
      
      // Call the evolve function from the store
      await evolveDigimon(toDigimonId, userDigimon.id);
      
      // Close detail modal after successful evolution
      setShowDetailModal(false);
      
      // Dispatch event for parent component
      const event = new CustomEvent('digimon-evolved', { 
        detail: { digimonId: userDigimon.id, newDigimonId: toDigimonId } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Evolution error:", error);
    } finally {
      setShowEvolutionAnimation(false);
      setEvolutionSprites(null);
      setPendingEvolution(null);
    }
  };
  
  // Filter evolution options to only show those that meet all requirements
  const availableEvolutions = evolutionOptions.filter(
    option => {
      // First check level requirement
      if (userDigimon.current_level < option.level_required) return false;
      
      // Then check stat requirements if they exist
      if (option.stat_requirements) {
        const stats = calculateFinalStats(userDigimon);
        // Check each stat requirement
        for (const [stat, value] of Object.entries(option.stat_requirements)) {
          if (stats[stat as keyof typeof stats] < value) return false;
        }
      }
      
      // If all requirements are met
      return true;
    }
  );

  // Phase 5.4 — next non-DNA evolution the Digimon hasn't unlocked yet, used for
  // the level-progress bar shown when no evolution is immediately available.
  const nextEvoTarget = evolutionOptions
    .filter(opt =>
      opt.level_required > userDigimon.current_level &&
      !opt.dna_requirement
    )
    .sort((a, b) => (a.level_required ?? 99) - (b.level_required ?? 99))[0];

  const evoProgressPct = nextEvoTarget
    ? Math.min(100, (userDigimon.current_level / (nextEvoTarget.level_required ?? 1)) * 100)
    : null;

  // Add this new function to handle sprite clicks
  const handleSpriteClick = () => {
    // Update interaction time
    updateInteraction();
    
    // Existing code...
    setIsStatIncreasing(true);
    
    // Random chance (1/5) to show heart
    if (Math.random() < 0.2) {
      setShowHeart(true);
    }
    
    // Look left and right sequence
    setTimeout(() => setLookDirection(-2.5), 200);
    setTimeout(() => setLookDirection(2.5), 400);
    
    // End animations
    setTimeout(() => {
      setIsStatIncreasing(false);
      setShowHeart(false);
    }, 1000);
  };
  
  // Add a debug function to log when clicks happen
  const handleCardClick = () => {
    updateInteraction();
    setShowDetailModal(true);
  };
  
  // Function to handle setting a Digimon as active
  const handleSetActive = async () => {
  };
  
  // Function to complete devolution after animation
  const completeDevolution = async () => {
    if (!pendingDevolution || !evolutionSprites) return;
    
    try {
      const {toDigimonId} = pendingDevolution;
      
      // Call the devolve function from the store
      await devolveDigimon(toDigimonId, userDigimon.id);
      
      // Close detail modal after successful devolution
      setShowDetailModal(false);
      
      // Dispatch event for parent component
      const event = new CustomEvent('digimon-devolved', { 
        detail: { digimonId: userDigimon.id, newDigimonId: toDigimonId } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Devolution error:", error);
    } finally {
      setShowDevolutionAnimation(false);
      setEvolutionSprites(null);
      setPendingDevolution(null);
    }
  };
  
  // Add this function to update the last interaction time
  const updateInteraction = () => {
    setLastInteractionTime(Date.now());
    if (isSleeping) {
      setIsSleeping(false);
    }
  };
  
  if (!userDigimon || !digimonData) {
    return <div>Loading Digimon...</div>;
  }

  // Phase 5.2 — resolve the attribute glow class (empty string = no glow applied).
  const glowClass = digimonData.attribute
    ? (ATTRIBUTE_GLOW_CLASS[digimonData.attribute] ?? '')
    : '';

  const displayName = currentDigimon.name || digimonData.name;
  
  // Animation variants
  const levelUpVariants = {
    hop: {
      y: [0, -20, 0, -15, 0, -10, 0],
      transition: { duration: 1.2, times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] }
    },
    statIncrease: {
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
    <div
      className="card relative flex flex-col items-center hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Add TypeAttributeIcon in the top right corner */}
      {digimonData?.type && digimonData?.attribute && (
        <div className="absolute top-4 right-4 z-10">
          <TypeAttributeIcon
            type={digimonData.type as DigimonBattleType}
            attribute={digimonData.attribute as DigimonAttribute}
            size="md"
            showLabel={false}
          />
        </div>
      )}

      {/* Phase 7.6 — Fredoka via font-heading token; rounded, playful, matches Digimon aesthetic */}
      <h2 className="text-2xl font-heading font-semibold text-center mb-1 digimon-name">{displayName}</h2>
      <p className="text-sm text-gray-500 mb-2">{digimonData.name}</p>
      
      {/* Phase 5.2 — glow class sets --stage-glow CSS var; the inline radial-gradient
          renders the actual visible ambient glow behind the sprite. */}
      <div
        className={`relative mb-2 ${glowClass}`}
        style={glowClass ? {
          background: 'radial-gradient(circle, var(--stage-glow) 0%, transparent 70%)',
          borderRadius: '50%',
        } : undefined}
      >
        <motion.div
          animate={
            // Phase 7.7 — skip all looping bounces when reduced-motion is preferred
            prefersReducedMotion
              ? { y: 0 }
              : isLevelingUp
                ? "hop"
                : isStatIncreasing
                  ? "statIncrease"
                  : availableEvolutions.length > 0
                    ? { y: [0, -5, 0, -3, 0, -5, 0] }
                    : hasAnimatedSprites
                      ? { y: 0 }
                      : { y: [0, -10, 0] }
          }
          variants={levelUpVariants}
          transition={
            prefersReducedMotion
              ? {}
              : availableEvolutions.length > 0
                ? { duration: 1, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }
                : !isLevelingUp && !isStatIncreasing && !hasAnimatedSprites
                  ? { repeat: Infinity, duration: 2 }
                  : undefined
          }
          className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation(); // Stop propagation to prevent double handling
            setShowDetailModal(true);
          }}
        >
          <motion.img
            draggable="false"
            src={getCurrentSpriteUrl()} 
            alt={digimonData.name} 
            className="w-auto h-auto cursor-pointer"
            style={{ 
              imageRendering: "pixelated",
              transform: `scale(${lookDirection}, 2.5)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSpriteClick();
              
              // For animated sprites, show happy reaction temporarily
              if (hasAnimatedSprites) {
                updateInteraction();
                setCurrentSpriteType('happy');
                setTimeout(() => {
                  setCurrentSpriteType('cheer');
                }, 1000);
              }
            }}
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
            }}
          />
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
              <span className="text-3xl">❤️</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Phase 5.6 — Lucide icon mood indicator replaces emojis for a consistent,
            theme-aware style. Moon = sleeping, then happiness thresholds. */}
        <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md">
          {isSleeping ? (
            <Moon className="w-5 h-5 text-blue-400" />
          ) : userDigimon.happiness > 80 ? (
            <Laugh className="w-5 h-5 text-green-500" />
          ) : userDigimon.happiness > 50 ? (
            <Smile className="w-5 h-5 text-yellow-500" />
          ) : userDigimon.happiness > 30 ? (
            <Meh className="w-5 h-5 text-orange-400" />
          ) : (
            <Frown className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
      
      <div className="w-full space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Heart icon directly left of the bar - fixed width */}
            <div className="flex items-center justify-center w-8 h-4 flex-shrink-0">
              <span className="text-red-500 text-sm">❤️</span>
          </div>
            
            {/* Phase 5.3 — taller bar (h-2.5) for better visual weight */}
            {/* Happiness Progress Bar */}
            <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
            <div 
                className={`h-full transition-all duration-300 ${
                happinessPercentage >= 60 ? 'bg-green-500' : 
                happinessPercentage >= 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
                style={{ width: `${happinessPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Happiness details below */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Happiness</span>
            <span>{userDigimon.happiness.toFixed(0)}%</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Level text directly left of the bar - fixed width */}
            <div className="flex items-center justify-center w-8 h-4 flex-shrink-0">
              <span className={`text-xs font-bold px-1 rounded transition-all duration-300 ${
                isLevelingUp 
                  ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-200/90 dark:bg-yellow-900/60 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]' 
                  : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80'
              }`}>
                Lv{currentLevel}
              </span>
          </div>
            
            {/* Phase 5.3 — taller XP bar matches happiness bar */}
            {/* Experience Progress Bar */}
            <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden relative">
            <div
                className={`h-full transition-all duration-300 ${
                  isLevelingUp
                    ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                    : isStatIncreasing
                      ? 'xp-shimmer'
                      : 'bg-purple-500'
                }`}
              style={{ width: `${xpPercentage}%` }}
              />
              {/* Glow effect overlay */}
              {isLevelingUp && (
                <div 
                  className="absolute inset-0 bg-yellow-400/40 rounded-full blur-sm animate-pulse"
                  style={{ width: `${xpPercentage}%` }}
                />
              )}
            </div>
          </div>
          
          {/* XP details below */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{currentXP.toFixed(0)}/{xpForNextLevel.toFixed(0)} XP</span>
            <span>{20 * currentLevel * (currentLevel - 1) / 2 + currentXP} Total EXP</span>
          </div>
        </div>
      </div>

      {/* Phase 5.4+5.5 — DIGIVOLVE CTA when evolution is ready; evo level-progress
          bar when locked; minimal hint when no evolution path exists at all. */}
      {availableEvolutions.length > 0 ? (
        <motion.button
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              '0 0 8px rgba(245,158,11,0.3)',
              '0 0 20px rgba(245,158,11,0.65)',
              '0 0 8px rgba(245,158,11,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetailModal(true);
          }}
          className="mt-3 w-full py-2.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-heading font-semibold text-sm cursor-pointer transition-colors duration-150"
        >
          DIGIVOLVE{availableEvolutions.length > 1 ? ` (${availableEvolutions.length})` : ''}
        </motion.button>
      ) : nextEvoTarget ? (
        <div className="mt-3 w-full">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Next evo at Lv {nextEvoTarget.level_required}</span>
            <span>{Math.round(evoProgressPct ?? 0)}%</span>
          </div>
          <div className="bg-gray-200 dark:bg-dark-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-purple-400 transition-all duration-500 rounded-full"
              style={{ width: `${evoProgressPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Click for details
        </div>
      )}

      {/* Detail Modal — AnimatePresence activates the fade+scale exit animation
          defined inside DigimonDetailModal's motion.div wrappers (Phase 7.4). */}
      <AnimatePresence>
        {showDetailModal && (
          <DigimonDetailModal
            selectedDigimon={currentDigimon}
            onClose={() => setShowDetailModal(false)}
            onSetActive={handleSetActive}
            onNameChange={(updatedDigimon) => {
              setCurrentDigimon(updatedDigimon);
              useDigimonStore.getState().updateDigimonName(updatedDigimon.id, updatedDigimon.name || '');
              window.dispatchEvent(new CustomEvent('digimon-name-changed', {
                detail: { digimonId: updatedDigimon.id }
              }));
            }}
            className="z-40"
          />
        )}
      </AnimatePresence>

      {/* Evolution Animation */}
      {showEvolutionAnimation && evolutionSprites && (
        <EvolutionAnimation
          oldSpriteUrl={evolutionSprites.old}
          newSpriteUrl={evolutionSprites.new}
          onComplete={completeEvolution}
          isDevolution={false}
        />
      )}

      {/* Devolution Animation */}
      {showDevolutionAnimation && evolutionSprites && (
        <EvolutionAnimation
          oldSpriteUrl={evolutionSprites.old}
          newSpriteUrl={evolutionSprites.new}
          onComplete={completeDevolution}
          isDevolution={true}
        />
      )}

    </div>
  );
};

export default Digimon; 