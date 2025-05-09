import { motion, AnimatePresence } from "framer-motion";
import { useDigimonStore, UserDigimon, Digimon as DigimonType, EvolutionOption } from "../store/petStore";
import { useState, useEffect, useRef } from "react";
import DigimonDetailModal from "./DigimonDetailModal";
import { DigimonAttribute, DigimonType as DigimonBattleType } from "../store/battleStore";
import TypeAttributeIcon from "./TypeAttributeIcon";
import EvolutionAnimation from "./EvolutionAnimation";

interface DigimonProps {
  userDigimon: UserDigimon;
  digimonData: DigimonType;
  evolutionOptions: EvolutionOption[];
}

const Digimon: React.FC<DigimonProps> = ({ userDigimon, digimonData, evolutionOptions }) => {
  const { evolveDigimon, fetchAllUserDigimon } = useDigimonStore();
  
  // Add a local state to track XP and level
  const [currentXP, setCurrentXP] = useState(userDigimon.experience_points);
  const [currentLevel, setCurrentLevel] = useState(userDigimon.current_level);
  const [xpForNextLevel, setXpForNextLevel] = useState(userDigimon.current_level * 20);
  
  // Animation states
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isStatIncreasing, setIsStatIncreasing] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(2.5);
  
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
    
    // Look left and right sequence
    setTimeout(() => setLookDirection(-2.5), 200);
    setTimeout(() => setLookDirection(2.5), 400);
    setTimeout(() => setLookDirection(-2.5), 600);
    setTimeout(() => setLookDirection(2.5), 800);
    
    // End animations
    setTimeout(() => {
      setIsLevelingUp(false);
      setShowHeart(false);
    }, 1500);
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
  
  // Filter evolution options to only show those that meet the level requirement
  const availableEvolutions = evolutionOptions.filter(
    option => userDigimon.current_level >= option.level_required
  );
  
  // Add this new function to handle sprite clicks
  const handleSpriteClick = () => {
    // Trigger animation
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
    setShowDetailModal(true);
  };
  
  // Function to handle setting a Digimon as active
  const handleSetActive = async () => {
  };
  
  // Function to handle releasing a Digimon
  const handleRelease = () => {
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
  
  if (!userDigimon || !digimonData) {
    return <div>Loading Digimon...</div>;
  }
  
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

      <h2 className="text-2xl font-bold text-center mb-1 digimon-name">{displayName}</h2>
      <p className="text-sm text-gray-500 mb-2">{digimonData.name}</p>
      
      <div className="relative mb-2">
        <motion.div
          animate={
            isLevelingUp 
              ? "hop" 
              : isStatIncreasing 
                ? "statIncrease" 
                : { y: [0, -10, 0] }
          }
          variants={levelUpVariants}
          transition={
            !isLevelingUp && !isStatIncreasing 
              ? { repeat: Infinity, duration: 2 } 
              : undefined
          }
          className="w-40 h-40 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation(); // Stop propagation to prevent double handling
            setShowDetailModal(true);
          }}
        >
          <motion.img
            draggable="false"
            src={digimonData.sprite_url} 
            alt={digimonData.name} 
            className="w-auto h-auto cursor-pointer"
            style={{ 
              imageRendering: "pixelated",
              transform: `scale(${lookDirection}, 2.5)`,
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening modal when clicking sprite
              handleSpriteClick();
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
        
        {/* Mood indicator */}
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
          {userDigimon.happiness > 80 ? (
            <span className="text-2xl">😄</span>
          ) : userDigimon.happiness > 50 ? (
            <span className="text-2xl">🙂</span>
          ) : userDigimon.happiness > 30 ? (
            <span className="text-2xl">😐</span>
          ) : (
            <span className="text-2xl">😢</span>
          )}
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <p>Stage: {digimonData.stage}</p>
      </div>
      
      <div className="w-full space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Happiness</span>
            <span>{userDigimon.happiness.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                happinessPercentage >= 60 ? 'bg-green-500' : 
                happinessPercentage >= 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ 
                width: `${happinessPercentage}%`,
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Level {currentLevel}</span>
            <span>{currentXP.toFixed(0)}/{xpForNextLevel.toFixed(0)} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-purple-500" 
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">
            {20 * currentLevel * (currentLevel - 1) / 2 + currentXP} Total EXP
          </div>
        </div>
      </div>

      {
        availableEvolutions.length > 0 && (
          <div className="text-sm text-purple-500 font-bold mt-2">
            Can Digivolve
          </div>
        )
      }
      
      <div className="text-sm text-gray-500 mt-2">
        Click for details or evolution options
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <DigimonDetailModal
          selectedDigimon={currentDigimon}
          onClose={() => {
            setShowDetailModal(false);
          }}
          onSetActive={handleSetActive}
          onRelease={handleRelease}
          onNameChange={(updatedDigimon) => {
            // Update the local state immediately
            setCurrentDigimon(updatedDigimon);
            
            // Update the store directly
            useDigimonStore.getState().updateDigimonName(updatedDigimon.id, updatedDigimon.name || '');
            
            // Dispatch the custom event to notify other components
            const event = new CustomEvent('digimon-name-changed', {
              detail: { digimonId: updatedDigimon.id }
            });
            window.dispatchEvent(event);
          }}
          className="z-40"
        />
      )}

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