import { motion, AnimatePresence } from "framer-motion";
import { useDigimonStore, UserDigimon, Digimon as DigimonType, EvolutionOption } from "../store/petStore";
import { useState, useEffect, useRef } from "react";
import DigimonDetailModal from "./DigimonDetailModal";

interface DigimonProps {
  userDigimon: UserDigimon;
  digimonData: DigimonType;
  evolutionOptions: EvolutionOption[];
}

const Digimon: React.FC<DigimonProps> = ({ userDigimon, digimonData, evolutionOptions }) => {
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const { evolveDigimon, discoveredDigimon, getDigimonDisplayName } = useDigimonStore();
  
  // Add a local state to track XP and level
  const [currentXP, setCurrentXP] = useState(userDigimon.experience_points);
  const [currentLevel, setCurrentLevel] = useState(userDigimon.current_level);
  const [xpForNextLevel, setXpForNextLevel] = useState(userDigimon.current_level * 20);
  
  // Add state for health and happiness to track changes
  const [health, setHealth] = useState(userDigimon.health);
  const [happiness, setHappiness] = useState(userDigimon.happiness);
  
  // Animation states
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isStatIncreasing, setIsStatIncreasing] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(2.5);
  
  // Refs to track previous values
  const prevLevelRef = useRef(userDigimon.current_level);
  const prevHealthRef = useRef(userDigimon.health);
  const prevHappinessRef = useRef(userDigimon.happiness);
  const prevXPRef = useRef(userDigimon.experience_points);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Add state to track the current digimon data
  const [currentDigimon, setCurrentDigimon] = useState(userDigimon);
  
  // Update local state when userDigimon changes
  useEffect(() => {
    // Check for level up
    if (userDigimon.current_level > prevLevelRef.current) {
      triggerLevelUpAnimation();
    }
    // Check for health or happiness increase
    else if (userDigimon.health > prevHealthRef.current || 
        userDigimon.happiness > prevHappinessRef.current) {
      triggerStatIncreaseAnimation();
    }
    // Check for XP increase (but not when leveling up, to avoid double animation)
    else if (userDigimon.experience_points > prevXPRef.current) {
      triggerStatIncreaseAnimation();
    }
    
    // Update all state values
    setCurrentXP(userDigimon.experience_points);
    setCurrentLevel(userDigimon.current_level);
    setXpForNextLevel(userDigimon.current_level * 20);
    setHealth(userDigimon.health);
    setHappiness(userDigimon.happiness);
    
    // Update refs for next comparison
    prevLevelRef.current = userDigimon.current_level;
    prevHealthRef.current = userDigimon.health;
    prevHappinessRef.current = userDigimon.happiness;
    prevXPRef.current = userDigimon.experience_points;
  }, [userDigimon]);
  
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
  
  // Calculate percentages for health and happiness bars
  const healthPercentage = Math.max(0, Math.min(100, (health / 100) * 100));
  const happinessPercentage = Math.max(0, Math.min(100, (happiness / 100) * 100));
  
  // Calculate XP percentage
  const xpPercentage = Math.max(0, Math.min(100, (currentXP / xpForNextLevel) * 100));
  
  const handleEvolve = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      await evolveDigimon(toDigimonId);
      setShowEvolutionModal(false);
    } catch (error) {
      setEvolutionError((error as Error).message);
    }
  };
  
  // Filter evolution options to only show those that meet the level requirement
  const availableEvolutions = evolutionOptions.filter(
    option => userDigimon.current_level >= option.level_required
  );
  
  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };
  
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
  
  // Handle name changes
  const handleNameChange = (updatedDigimon: UserDigimon) => {
    setCurrentDigimon(updatedDigimon);
    
    // Also update the display name
    const displayName = updatedDigimon.name || digimonData.name;
    const nameElement = document.querySelector('.digimon-name');
    if (nameElement) {
      nameElement.textContent = displayName;
    }
  };
  
  // Add a debug function to log when clicks happen
  const handleCardClick = () => {
    console.log("Digimon card clicked");
    setShowDetailModal(true);
  };
  
  if (!userDigimon || !digimonData) {
    return <div>Loading Digimon...</div>;
  }
  
  const displayName = getDigimonDisplayName();
  
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
      className="card flex flex-col items-center hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={handleCardClick}
    >
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
            console.log("Sprite container clicked");
            setShowDetailModal(true);
          }}
        >
          <motion.img 
            src={digimonData.sprite_url} 
            alt={digimonData.name} 
            className="w-auto h-auto cursor-pointer"
            style={{ 
              imageRendering: "pixelated",
              transform: `scale(${lookDirection}, 2.5)`,
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening modal when clicking sprite
              console.log("Sprite image clicked");
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
      
      <div className="w-full space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Health</span>
            <span>{(health).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                healthPercentage >= 60 ? 'bg-green-500' : 
                healthPercentage >= 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ 
                width: `${healthPercentage}%`,
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Happiness</span>
            <span>{happiness.toFixed(0)}%</span>
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
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>{(digimonData as any)?.type || "Unknown"}/{(digimonData as any)?.attribute || "Unknown"}</p>
        <p>Stage: {digimonData.stage}</p>
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
      
      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Evolution Options</h3>
            
            {evolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{evolutionError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {evolutionOptions.map((option) => {
                const meetsLevelRequirement = userDigimon.current_level >= option.level_required;
                const discovered = isDiscovered(option.digimon_id);
                
                return (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-3 transition-all ${
                      meetsLevelRequirement 
                        ? "cursor-pointer hover:bg-primary-50 hover:border-primary-300" 
                        : "opacity-60 bg-gray-100"
                    }`}
                    onClick={() => meetsLevelRequirement && handleEvolve(option.digimon_id)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-2">
                        <img 
                          src={option.sprite_url} 
                          alt={discovered ? option.name : "Unknown Digimon"}
                          style={{ imageRendering: "pixelated" }} 
                          className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                          }}
                        />
                        {!discovered && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                              src={option.sprite_url} 
                              alt="Unknown Digimon"
                              style={{ imageRendering: "pixelated" }} 
                              className="w-full h-full object-contain brightness-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-center">
                        {discovered ? option.name : "???"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {discovered ? option.stage : "Unknown Stage"}
                      </span>
                      <span className={`text-xs mt-1 ${
                        meetsLevelRequirement ? "text-green-600" : "text-red-600"
                      }`}>
                        Required Level: {option.level_required}
                        {!meetsLevelRequirement && ` (Current: ${userDigimon.current_level})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setEvolutionError(null);
                  setShowEvolutionModal(false);
                }}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <DigimonDetailModal
          selectedDigimon={currentDigimon}
          onClose={() => {
            console.log("Closing detail modal");
            setShowDetailModal(false);
          }}
          onShowEvolution={() => {
            setShowDetailModal(false);
            setShowEvolutionModal(true);
          }}
          onNameChange={handleNameChange}
          evolutionData={{ [userDigimon.digimon_id]: evolutionOptions }}
        />
      )}
    </div>
  );
};

export default Digimon; 