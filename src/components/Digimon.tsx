import { motion, AnimatePresence } from "framer-motion";
import { useDigimonStore, UserDigimon, Digimon as DigimonType, EvolutionOption, expToBoostPoints } from "../store/petStore";
import { useState, useEffect, useRef } from "react";
import DigimonDetailModal from "./DigimonDetailModal";
import { useNotificationStore } from "../store/notificationStore";
import statModifier, { DigimonAttribute, DigimonType as DigimonBattleType } from "../store/battleStore";
import TypeAttributeIcon from "./TypeAttributeIcon";
import { supabase } from "../lib/supabase";

interface DigimonProps {
  userDigimon: UserDigimon;
  digimonData: DigimonType;
  evolutionOptions: EvolutionOption[];
}

const Digimon: React.FC<DigimonProps> = ({ userDigimon, digimonData, evolutionOptions }) => {
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const { evolveDigimon, discoveredDigimon, fetchAllUserDigimon } = useDigimonStore();
  
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
  const [showDevolutionModal, setShowDevolutionModal] = useState(false);
  const [devolutionError, setDevolutionError] = useState<string | null>(null);
  const [devolutionOptions, setDevolutionOptions] = useState<EvolutionOption[]>([]);
  const { devolveDigimon } = useDigimonStore();

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
  
  const handleEvolution = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      setShowEvolutionModal(true);
      
      // Call the evolve function from the store
      await evolveDigimon(toDigimonId, userDigimon.id);
      
      // Close both modals after successful evolution
      setShowEvolutionModal(false);
      setShowDetailModal(false);
      
      // Fetch new evolution options for the evolved Digimon
      // We can dispatch a custom event that the parent component can listen for
      const event = new CustomEvent('digimon-evolved', { 
        detail: { digimonId: userDigimon.id, newDigimonId: toDigimonId } 
      });
      window.dispatchEvent(event);
      
      // Show success notification
      useNotificationStore.getState().addNotification({
        message: `Your Digimon has evolved successfully!`,
        type: "success"
      });
    } catch (error) {
      console.error("Evolution error:", error);
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
  
  // Add a debug function to log when clicks happen
  const handleCardClick = () => {
    setShowDetailModal(true);
  };
  
  // Function to handle setting a Digimon as active
  const handleSetActive = async () => {
    // Use userDigimon.id instead of the parameter
    // Rest of the function...
  };
  
  // Function to handle showing the evolution modal
  const handleShowEvolutionModal = () => {
    // Use userDigimon.id instead of the parameter
    setShowEvolutionModal(true);
  };
  
  // Function to handle releasing a Digimon
  const handleRelease = () => {
    // Use userDigimon.id instead of the parameter
    // Rest of the function...
  };
  
  // Create an evolutionData object in the format expected by DigimonDetailModal
  const evolutionData = {
    [userDigimon.digimon_id]: evolutionOptions
  };
  
  // Add function to handle showing the devolution modal
  const handleShowDevolutionModal = async () => {
    setShowDevolutionModal(true);
    
    try {
      // Fetch devolution options
      const { data: devolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          from_digimon_id,
          digimon:from_digimon_id (id, digimon_id, name, stage, sprite_url)
        `)
        .eq("to_digimon_id", userDigimon.digimon_id);
        
      if (error) throw error;
      
      // Format options similar to evolution options
      const options = devolutionPaths.map(path => ({
        id: path.id,
        digimon_id: path.from_digimon_id,
        name: (path.digimon as any).name,
        stage: (path.digimon as any).stage,
        sprite_url: (path.digimon as any).sprite_url,
        level_required: 0
      }));
      
      setDevolutionOptions(options);
    } catch (error) {
      setDevolutionError((error as Error).message);
    }
  };
  
  // Add function to handle devolution
  const handleDevolve = async (fromDigimonId: number) => {
    try {
      setDevolutionError(null);
      await devolveDigimon(fromDigimonId);
      setShowDevolutionModal(false);
      
      // Show success notification
      useNotificationStore.getState().addNotification({
        message: "Your Digimon has de-digivolved successfully!",
        type: "success"
      });
    } catch (error) {
      setDevolutionError((error as Error).message);
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
      
      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowEvolutionModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">Evolution Options</h3>
            <div className="text-md text-gray-500 mb-4">
              Evolving will<b className="text-red-500"> reset your Digimon level back to 1</b> and give {expToBoostPoints(userDigimon.current_level, userDigimon.experience_points, true)} bonus points to all stats.
            </div>
            
            {evolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{evolutionError}</p>
              </div>
            )}
            
            <div className="overflow-y-auto max-h-[60vh] mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {evolutionOptions.map((option) => {
                  // Calculate base stats for current level
                  const baseHP = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.hp_level1 || 0,
                    userDigimon.digimon?.hp || 0,
                    userDigimon.digimon?.hp_level99 || 0
                  );
                  
                  const baseSP = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.sp_level1 || 0,
                    userDigimon.digimon?.sp || 0,
                    userDigimon.digimon?.sp_level99 || 0
                  );
                  
                  const baseATK = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.atk_level1 || 0,
                    userDigimon.digimon?.atk || 0,
                    userDigimon.digimon?.atk_level99 || 0
                  );
                  
                  const baseDEF = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.def_level1 || 0,
                    userDigimon.digimon?.def || 0,
                    userDigimon.digimon?.def_level99 || 0
                  );
                  
                  const baseINT = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.int_level1 || 0,
                    userDigimon.digimon?.int || 0,
                    userDigimon.digimon?.int_level99 || 0
                  );
                  
                  const baseSPD = statModifier(
                    userDigimon.current_level,
                    userDigimon.digimon?.spd_level1 || 0,
                    userDigimon.digimon?.spd || 0,
                    userDigimon.digimon?.spd_level99 || 0
                  );
                  
                  // Check level requirement
                  const meetsLevelRequirement = userDigimon.current_level >= option.level_required;
                  
                  // Check stat requirements
                  let meetsStatRequirements = true;
                  const statRequirementsList = [];
                  
                  if (option.stat_requirements) {
                    const statReqs = option.stat_requirements;
                    
                    // Check each stat requirement and build display list
                    if (statReqs.hp && statReqs.hp > 0) {
                      const currentHP = baseHP + (userDigimon.hp_bonus || 0);
                      if (currentHP < statReqs.hp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'HP',
                        current: currentHP,
                        required: statReqs.hp,
                        meets: currentHP >= statReqs.hp
                      });
                    }
                    
                    if (statReqs.sp && statReqs.sp > 0) {
                      const currentSP = baseSP + (userDigimon.sp_bonus || 0);
                      if (currentSP < statReqs.sp) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'SP',
                        current: currentSP,
                        required: statReqs.sp,
                        meets: currentSP >= statReqs.sp
                      });
                    }
                    
                    if (statReqs.atk && statReqs.atk > 0) {
                      const currentATK = baseATK + (userDigimon.atk_bonus || 0);
                      if (currentATK < statReqs.atk) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'ATK',
                        current: currentATK,
                        required: statReqs.atk,
                        meets: currentATK >= statReqs.atk
                      });
                    }
                    
                    if (statReqs.def && statReqs.def > 0) {
                      const currentDEF = baseDEF + (userDigimon.def_bonus || 0);
                      if (currentDEF < statReqs.def) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'DEF',
                        current: currentDEF,
                        required: statReqs.def,
                        meets: currentDEF >= statReqs.def
                      });
                    }
                    
                    if (statReqs.int && statReqs.int > 0) {
                      const currentINT = baseINT + (userDigimon.int_bonus || 0);
                      if (currentINT < statReqs.int) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'INT',
                        current: currentINT,
                        required: statReqs.int,
                        meets: currentINT >= statReqs.int
                      });
                    }
                    
                    if (statReqs.spd && statReqs.spd > 0) {
                      const currentSPD = baseSPD + (userDigimon.spd_bonus || 0);
                      if (currentSPD < statReqs.spd) meetsStatRequirements = false;
                      statRequirementsList.push({
                        name: 'SPD',
                        current: currentSPD,
                        required: statReqs.spd,
                        meets: currentSPD >= statReqs.spd
                      });
                    }
                  }
                  
                  const canEvolve = meetsLevelRequirement && meetsStatRequirements;
                  const discovered = isDiscovered(option.digimon_id);
                  
                  return (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-3 px-10 transition-all ${
                        canEvolve
                          ? "cursor-pointer hover:bg-primary-50 hover:border-primary-300" 
                          : "opacity-60 bg-gray-100"
                      }`}
                      onClick={() => canEvolve && handleEvolution(option.digimon_id)}
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
                          {option.stage}
                        </span>
                        
                        {/* Level requirement */}
                        <span className={`text-xs mt-1 ${
                          meetsLevelRequirement ? "text-green-600" : "text-red-600"
                        }`}>
                          Required Level: {option.level_required}
                          {!meetsLevelRequirement && ` (Current: ${userDigimon.current_level})`}
                        </span>
                        
                        {/* Stat requirements */}
                        {statRequirementsList.length > 0 && (
                          <div className="mt-2 w-full">
                            <div className="space-y-1 mt-1">
                              {statRequirementsList.map(stat => (
                                <div key={stat.name} className="flex justify-between text-xs">
                                  <span>{stat.name}</span>
                                  <span className={stat.meets ? "text-green-600" : "text-red-600"}>
                                    {stat.current}/{stat.required}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end sticky bottom-0 bg-white pt-4 border-t">
              <button 
                onClick={() => setShowEvolutionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
            setShowDetailModal(false);
            setShowEvolutionModal(false);
            setShowDevolutionModal(false);
          }}
          onSetActive={handleSetActive}
          onShowEvolution={handleShowEvolutionModal}
          onShowDevolution={handleShowDevolutionModal}
          onRelease={handleRelease}
          evolutionData={evolutionData}
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

      {/* Devolution Modal */}
      {showDevolutionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowDevolutionModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">De-Digivolution Options</h3>
            <div className="text-md text-gray-500 mb-4">
              Devolving will<b className="text-red-500"> reset your Digimon level back to 1</b> and give {expToBoostPoints(userDigimon.current_level, userDigimon.experience_points, false)} bonus points to all stats.
            </div>
            
            {devolutionOptions.length === 0 && (
              <p className="text-gray-500 mb-4 text-center">
                No options available.
              </p>
            )}
            
            {devolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{devolutionError}</p>
              </div>
            )}
            
            <div className="overflow-y-auto max-h-[60vh] mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {devolutionOptions.map((option) => {
                  const discovered = isDiscovered(option.digimon_id);
                  return(
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 flex flex-col items-center ${
                        discovered ? "hover:shadow-md cursor-pointer opacity-100" : "opacity-60 bg-gray-100"
                      }`}
                      onClick={() => discovered && handleDevolve(option.digimon_id)}
                    >
                      <img
                        src={option.sprite_url}
                        alt={discovered ? option.name : "Unknown Digimon"}
                        className={`w-24 h-24 object-contain mb-2 ${
                          discovered ? "opacity-100" : "brightness-0"
                        }`}
                        style={{ imageRendering: "pixelated" }}
                      />
                      <h4 className="font-bold">{discovered ? option.name : "???"}</h4>
                      <p className="text-sm text-gray-500">{option.stage}</p>
                    </div>
                  )

                })}
              </div>
            </div>
            
            <div className="flex justify-end sticky bottom-0 bg-white pt-4 border-t">
              <button 
                onClick={() => setShowDevolutionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Digimon; 