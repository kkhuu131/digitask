import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TeamBattle } from "../store/battleStore";
import { useBattleSpeedStore } from "../store/battleSpeedStore";
import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";

interface TeamBattleAnimationProps {
  teamBattle: TeamBattle;
  onComplete: () => void;
}

// Add a function to get battle sprite URLs
function getBattleSpriteUrl(
  digimonName: string,
  spriteType: string,
  fallbackUrl: string
): string {
  // Check if this Digimon has animated sprites
  if (ANIMATED_DIGIMON.includes(digimonName)) {
    return `/assets/animated_digimon/${digimonName}/${spriteType}.png`;
  }
  // Return the fallback URL for Digimon without animated sprites
  return fallbackUrl;
}

const DEFAULT_MAX_HP = 100; // Fallback if stats are missing
const VERTICAL_RANGE_START = 10; // Start positioning at 10% from the top
const VERTICAL_RANGE_END = 50;   // End positioning at 50% from the top
const BASE_TURN_DURATION = 1000; // Base duration for each turn animation + pause
const FINAL_MESSAGE_DURATION = 2000; // How long to show "Victory/Defeat" before results confirmation

const TeamBattleAnimation: React.FC<TeamBattleAnimationProps> = ({ 
  teamBattle, 
  onComplete 
}) => {
  const { speedMultiplier } = useBattleSpeedStore();
  const TURN_DURATION = BASE_TURN_DURATION / speedMultiplier; // Apply speed multiplier

  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [hpState, setHpState] = useState<{ [id: string]: number }>(() => {
    const initialHp: { [id: string]: number } = {};
    
    // Initialize user team HP based on health percentage
    teamBattle.user_team?.forEach(fighter => {
      initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP;
    });
    
    // Initialize opponent team HP at full
    teamBattle.opponent_team?.forEach(fighter => {
      initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP;
    });
    
    return initialHp;
  });
  const [disintegratingDigimon, setDisintegratingDigimon] = useState<{[id: string]: boolean}>({});
  
  // Use separate refs for different timed actions for clarity and safety
  const advanceStepTimeoutRef = useRef<NodeJS.Timeout | null>(null); 
  const showResultsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userTeam = teamBattle.user_team || [];
  const opponentTeam = teamBattle.opponent_team || [];
  const battleTurns = teamBattle.turns || [];
  const playerWon = teamBattle.winner_id === userTeam[0]?.user_id;
  const totalTurns = battleTurns.length;
  // step 0: Intro
  // step 1 to totalTurns: Turn animations
  // step totalTurns + 1: Final message display ("Victory/Defeat")
  const maxSteps = 1 + totalTurns + 1; 
  
  const currentTurn = step > 0 && step <= totalTurns ? battleTurns[step - 1] : null; 
  // Are we on the step *displaying* the final message?
  const isFinalMessageStep = step === maxSteps - 1; 

  // Add state to track animated sprites
  const [animatedSprites, setAnimatedSprites] = useState<{[id: string]: boolean}>({});
  // Add state to track sprite types for each Digimon
  const [spriteTypes, setSpriteTypes] = useState<{[id: string]: string}>({});
  // Add state to toggle celebration animation
  const [celebrateToggle, setCelebrateToggle] = useState(false);

  // --- State Initialization ---
  useEffect(() => {
    // Don't reset HP state here, as it's already set correctly in the useState initialization
    
    setStep(0);
    setShowResults(false);
    setShowResultsScreen(false);
    setDisintegratingDigimon({});

    // Clear ALL timers when battle changes
    if (advanceStepTimeoutRef.current) clearTimeout(advanceStepTimeoutRef.current);
    if (showResultsTimeoutRef.current) clearTimeout(showResultsTimeoutRef.current);
    if (onCompleteTimeoutRef.current) clearTimeout(onCompleteTimeoutRef.current);
    advanceStepTimeoutRef.current = null;
    showResultsTimeoutRef.current = null;
    onCompleteTimeoutRef.current = null;

  }, [teamBattle]); // Rerun only when the battle data itself changes

  // Add this at the beginning of the component
  useEffect(() => {
    // Force first step advance after a small delay
    const initialTimer = setTimeout(() => {
      if (step === 0) {
        setStep(1);
      }
    }, 500);
    
    return () => clearTimeout(initialTimer);
  }, []);

  // --- HP Update Logic ---
  useEffect(() => {
    // Update HP based on the outcome of the turn being animated (currentTurn)
    if (step > 0 && currentTurn && currentTurn.remainingHP) {
      setHpState(prevHp => {
        const newHp = { ...prevHp };
        Object.keys(currentTurn.remainingHP).forEach(id => {
          if (newHp.hasOwnProperty(id)) {
            newHp[id] = Math.max(0, currentTurn.remainingHP[id]); 
          }
        });
        const changed = Object.keys(newHp).some(id => newHp[id] !== prevHp[id]);
        return changed ? newHp : prevHp;
      });
    }
  }, [step, currentTurn?.remainingHP]); // Remove userTeam and opponentTeam from dependencies

  // --- Step Advancement Logic ---
  const advanceStep = () => {
     // Only advance if we are not yet on the final message step
    if (step < maxSteps - 1) { 
      setStep(prevStep => prevStep + 1);
    }
  };

  // --- Timers ---

  // 1. Timer to automatically advance between turns
  useEffect(() => {
    // Clear previous timer first
    if (advanceStepTimeoutRef.current) {
      clearTimeout(advanceStepTimeoutRef.current);
      advanceStepTimeoutRef.current = null;
    }

    // Set next timer only if we are *before* the final message step and not showing results yet
    if (!showResults && step < maxSteps - 1) { 
      advanceStepTimeoutRef.current = setTimeout(advanceStep, TURN_DURATION); 
    }

    // Cleanup
    return () => {
      if (advanceStepTimeoutRef.current) {
        clearTimeout(advanceStepTimeoutRef.current);
        advanceStepTimeoutRef.current = null;
      }
    };
  }, [step, showResults]); 

  // 2. Timer to show results after final message
  useEffect(() => {
    // Clear previous timer first
    if (showResultsTimeoutRef.current) {
      clearTimeout(showResultsTimeoutRef.current);
      showResultsTimeoutRef.current = null;
    }

    // If we're at the final message step and not already showing results screen
    if (isFinalMessageStep && !showResultsScreen) {
      showResultsTimeoutRef.current = setTimeout(() => {
        setShowResultsScreen(true);
      }, FINAL_MESSAGE_DURATION);
    }

    // Cleanup
    return () => {
      if (showResultsTimeoutRef.current) {
        clearTimeout(showResultsTimeoutRef.current);
        showResultsTimeoutRef.current = null;
      }
    };
  }, [step, isFinalMessageStep, showResultsScreen]); // Depend on step, isFinalMessageStep, and showResultsScreen

  // Remove the old onComplete timer that was based on showResults
  // Instead, we'll use the Return button to trigger onComplete
  useEffect(() => {
    // Clear previous timer if it exists
    if (onCompleteTimeoutRef.current) {
      clearTimeout(onCompleteTimeoutRef.current);
      onCompleteTimeoutRef.current = null;
    }
    
    return () => {
      if (onCompleteTimeoutRef.current) {
        clearTimeout(onCompleteTimeoutRef.current);
        onCompleteTimeoutRef.current = null;
      }
    };
  }, []);

  // Add effect to handle HP changes and trigger disintegration
  useEffect(() => {
    // Check for newly dead Digimon
    const newlyDead: {[id: string]: boolean} = {};
    
    // Check all Digimon
    [...userTeam, ...opponentTeam].forEach(fighter => {
      const currentHp = hpState[fighter.id] ?? (fighter.stats?.hp ?? DEFAULT_MAX_HP);
      const wasAlreadyDisintegrating = disintegratingDigimon[fighter.id];
      
      // If HP is 0 or less and not already disintegrating, mark for disintegration
      if (currentHp <= 0 && !wasAlreadyDisintegrating) {
        newlyDead[fighter.id] = true;
      }
    });
    
    // If we found newly dead Digimon, update the disintegrating state
    if (Object.keys(newlyDead).length > 0) {
      setDisintegratingDigimon(prev => ({...prev, ...newlyDead}));
    }
  }, [hpState]); // Only depend on hpState changes to detect deaths

  // Add this inside the useEffect that handles turn animations
  // useEffect(() => {
  //   if (currentTurn) {
  //     console.log("Animating turn:", step, currentTurn);
  //     // Log the current HP state to see if multiple values are changing at once
  //     console.log("Current HP state:", {...hpState});
  //   }
  // }, [step, currentTurn]);

  // --- Calculations & Helpers ---
  const calculatePositions = (teamSize: number) => {
    const positions = [];
    const totalRange = VERTICAL_RANGE_END - VERTICAL_RANGE_START;
    
    if (teamSize === 1) {
      positions.push(VERTICAL_RANGE_START + totalRange / 2);
    } else if (teamSize > 1) {
      const spacing = totalRange / (teamSize - 1); 
      for (let i = 0; i < teamSize; i++) {
        positions.push(VERTICAL_RANGE_START + spacing * i);
      }
    }
    return positions;
  };
  const userPositions = calculatePositions(userTeam.length);
  const opponentPositions = calculatePositions(opponentTeam.length);

  const getDisplayName = (fighter: any) => fighter.name !== "" ? fighter.name : fighter.digimon_name;
  const findDigimonIndexById = (id: string, team: 'user' | 'opponent') => {
    const teamArray = team === 'user' ? userTeam : opponentTeam;
    return teamArray.findIndex(digimon => digimon.id === id);
  };

  const getAttackAnimationParams = () => {
    if (!currentTurn) return null; 
    const attackerTeam = currentTurn.attacker.team;
    const defenderTeam = attackerTeam === 'user' ? 'opponent' : 'user'; 
    const attackerIndex = findDigimonIndexById(currentTurn.attacker.id, attackerTeam);
    const defenderIndex = findDigimonIndexById(currentTurn.target.id, defenderTeam); 
    
    if (attackerIndex === -1 || defenderIndex === -1) {
        console.warn("Could not find attacker or defender index for turn:", currentTurn);
        return null;
    }
    
    const attackerPositions = attackerTeam === 'user' ? userPositions : opponentPositions;
    const defenderPositions = defenderTeam === 'user' ? userPositions : opponentPositions;

    const attackerYPercent = attackerPositions[attackerIndex] ?? 50;
    const defenderYPercent = defenderPositions[defenderIndex] ?? 50;
    
    const attackX = attackerTeam === 'user' ? 250 : -250; 
    
    return {
      attackerTeam,
      attackerIndex,
      defenderIndex,
      attackerYPercent, 
      defenderYPercent,
      attackX,
    };
  };
  const attackAnimationParams = getAttackAnimationParams();

  // Initialize animated sprites state
  useEffect(() => {
    const hasAnimated: {[id: string]: boolean} = {};
    const initialSpriteTypes: {[id: string]: string} = {};
    
    // Check user team
    userTeam.forEach(fighter => {
      const digimonName = fighter.digimon_name || "";
      hasAnimated[fighter.id] = ANIMATED_DIGIMON.includes(digimonName);
      initialSpriteTypes[fighter.id] = "idle1";
    });
    
    // Check opponent team
    opponentTeam.forEach(fighter => {
      const digimonName = fighter.digimon_name || "";
      hasAnimated[fighter.id] = ANIMATED_DIGIMON.includes(digimonName);
      initialSpriteTypes[fighter.id] = "idle1";
    });
    
    setAnimatedSprites(hasAnimated);
    setSpriteTypes(initialSpriteTypes);
  }, [teamBattle]);

  // Set up celebration animation interval for results screen
  useEffect(() => {
    if (!showResultsScreen) return;
    
    const interval = setInterval(() => {
      setCelebrateToggle(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, [showResultsScreen]);

  // Update sprite types based on current turn
  useEffect(() => {
    if (!currentTurn) return;
    
    const newSpriteTypes = { ...spriteTypes };
    
    // Set attacker to attack sprite
    if (currentTurn.attacker && animatedSprites[currentTurn.attacker.id]) {
      newSpriteTypes[currentTurn.attacker.id] = "attack";
    }
    
    // Set defender to angry sprite
    if (currentTurn.target && animatedSprites[currentTurn.target.id]) {
      newSpriteTypes[currentTurn.target.id] = "angry";
    }
    
    setSpriteTypes(newSpriteTypes);
    
    // Reset sprites after animation
    const resetTimeout = setTimeout(() => {
      const resetTypes = { ...newSpriteTypes };
      Object.keys(resetTypes).forEach(id => {
        resetTypes[id] = "idle1";
      });
      setSpriteTypes(resetTypes);
    }, TURN_DURATION / 2);
    
    return () => clearTimeout(resetTimeout);
  }, [currentTurn, animatedSprites]);

  // Modify the sprite rendering in the battle area
  const renderFighterSprite = (fighter: any) => {
    const digimonName = fighter.digimon_name || "";
    const hasAnimatedSprite = animatedSprites[fighter.id];
    const spriteType = spriteTypes[fighter.id] || "idle1";
    const spriteUrl = hasAnimatedSprite 
      ? getBattleSpriteUrl(digimonName, spriteType, fighter.sprite_url)
      : fighter.sprite_url;
    
    // Determine which direction the sprite should face
    const isUserTeam = userTeam.some(u => u.id === fighter.id);
    const transform = isUserTeam ? "scale(-1, 1)" : "scale(1, 1)";
    
    return (
      <img
        src={spriteUrl}
        alt={fighter.name || "Digimon"}
        className="w-14 h-14 object-contain"
        style={{ 
          imageRendering: "pixelated",
          transform: transform
        }}
      />
    );
  };

  // Modify the results screen to use animated sprites
  const renderResultsDigimon = (fighter: any) => {
    const digimonName = fighter.digimon_name || "";
    const hasAnimatedSprite = animatedSprites[fighter.id];
    
    // Determine sprite type based on battle outcome
    let spriteType = "intimidate";
    if (hasAnimatedSprite) {
      if (playerWon) {
        spriteType = celebrateToggle ? "cheer" : "happy";
      } else {
        spriteType = celebrateToggle ? "sad1" : "sad2";
      }
    }
    
    const spriteUrl = hasAnimatedSprite 
      ? getBattleSpriteUrl(digimonName, spriteType, fighter.sprite_url)
      : fighter.sprite_url;
    
    return (
      <img
        src={spriteUrl}
        alt={fighter.name || "Digimon"}
        className="w-full h-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
    );
  };

  // Add a function to render the disintegrating Digimon with sad sprite
  const renderDisintegratingDigimon = (fighter: any) => {
    const digimonName = fighter.digimon_name || "";
    const hasAnimatedSprite = animatedSprites[fighter.id];
    
    // Use sad1 sprite for animated Digimon that are dying
    const spriteUrl = hasAnimatedSprite 
      ? getBattleSpriteUrl(digimonName, "sad1", fighter.sprite_url)
      : fighter.sprite_url;
    
    // Determine which direction the sprite should face
    const isUserTeam = userTeam.some(u => u.id === fighter.id);
    const transform = isUserTeam ? "scale(-1, 1)" : "scale(1, 1)";
    
    return (
      <div className="relative w-14 h-14">
        {/* Generate pixel particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`particle-${fighter.id}-${i}`}
            className="absolute bg-green-400"
            style={{
              width: `${Math.random() * 2 + 4}px`,
              height: `${Math.random() * 2 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.8,
              boxShadow: '0 0 3px #4ade80'
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 0,
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 40 - 20],
              scale: 0
            }}
            transition={{ 
              duration: Math.random() * 0.5 + 1.5,
              ease: "easeOut"
            }}
          />
        ))}
        
        {/* Fading sprite with sad expression */}
        <motion.img 
          src={spriteUrl} 
          alt={getDisplayName(fighter)} 
          className="w-full h-full object-contain" 
          style={{ 
            imageRendering: "pixelated",
            transform: transform
          }}
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: [1, 0],
          }}
          transition={{ duration: 1.2 }}
        />
      </div>
    );
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl h-[80vh] aspect-video rounded-lg overflow-hidden shadow-xl border-4 border-green-600">
        {/* Digital grid background - updated to match the image */}
        <div className="absolute inset-0 bg-green-900 bg-opacity-90">
          {/* Grid overlay */}
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, rgba(144, 238, 144, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(144, 238, 144, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              boxShadow: 'inset 0 0 50px rgba(0, 255, 0, 0.3)'
            }}
          ></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-900 opacity-20"></div>
        </div>
        
        <div className="relative h-full">
          {/* Battle scene - only show if not on results screen */}
          {!showResultsScreen && (
            <div className="relative h-full flex">
              {/* User team side */}
              <div className="w-1/2 h-full relative">
                {userTeam.map((fighter, index) => {
                   const isAttacking = attackAnimationParams?.attackerTeam === 'user' && attackAnimationParams?.attackerIndex === index;
                   const currentTop = userPositions[index] !== undefined ? `${userPositions[index]}%` : '50%'; 
                   const isTarget = currentTurn?.target.team === 'user' && currentTurn?.target.id === fighter.id;
                   
                   // Check if dead based on current HP state
                   const currentHp = hpState[fighter.id] ?? (fighter.stats?.hp ?? DEFAULT_MAX_HP);
                   const isDead = currentHp <= 0;
                   const isDisintegrating = disintegratingDigimon[fighter.id];

                   // Define animation based on state
                   let animationProps = {};
                   if (isDead) {
                     if (isDisintegrating) {
                       // No rotation for disintegrating Digimon, handled by the effect
                       animationProps = { 
                         opacity: 0.8,
                         transition: { duration: 0.5 } 
                       };
                     } else {
                       // Fallback for already dead Digimon (if any)
                       animationProps = { 
                         rotate: 90, 
                         opacity: 0.3,
                         transition: { duration: 0.5 } 
                       };
                     }
                   } else if (isAttacking && attackAnimationParams) {
                     animationProps = {
                       x: [0, attackAnimationParams.attackX, 0], 
                       top: [currentTop, `${attackAnimationParams.defenderYPercent}%`, currentTop],
                       transition: { duration: 0.6, times: [0, 0.5, 1] } 
                     };
                   } else {
                     // Idle state
                     animationProps = { x: 0, top: currentTop, rotate: 0, opacity: 1 }; 
                   }

                   return (
                    <motion.div
                      key={fighter.id}
                      className="absolute w-20 h-20 flex items-center justify-center" 
                      style={{ 
                        left: '50%', 
                        top: currentTop, 
                        transform: 'translate(-50%, -50%)',
                        zIndex: isAttacking ? 10 : (isDead ? 0 : 1)
                      }}
                      animate={animationProps}
                    >
                      {/* Level display - positioned to the left of user Digimon */}
                      <div className="absolute right-full mr-1 bg-gray-800 bg-opacity-70 px-1 rounded text-xs text-white font-medium">
                        Lv.{fighter.current_level || 1}
                      </div>
                      
                      {/* Disintegration effect for dead Digimon */}
                      {isDisintegrating ? (
                        renderDisintegratingDigimon(fighter)
                      ) : (
                        renderFighterSprite(fighter)
                      )}
                      
                      {/* Hit effect - only show if not dead and is being targeted */}
                      {isTarget && !isDead && !currentTurn?.didMiss && (
                        <motion.div
                          className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-full" 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }} 
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Opponent team side */}
              <div className="w-1/2 h-full relative">
                {opponentTeam.map((fighter, index) => {
                   const isAttacking = attackAnimationParams?.attackerTeam === 'opponent' && attackAnimationParams?.attackerIndex === index;
                   const currentTop = opponentPositions[index] !== undefined ? `${opponentPositions[index]}%` : '50%'; 
                   const isTarget = currentTurn?.target.team === 'opponent' && currentTurn?.target.id === fighter.id;

                   // Check if dead based on current HP state
                   const currentHp = hpState[fighter.id] ?? (fighter.stats?.hp ?? DEFAULT_MAX_HP);
                   const isDead = currentHp <= 0;
                   const isDisintegrating = disintegratingDigimon[fighter.id];

                   // Define animation based on state
                   let animationProps = {};
                   if (isDead) {
                     if (isDisintegrating) {
                       animationProps = { 
                         opacity: 0.8,
                         transition: { duration: 0.5 } 
                       };
                     } else {
                       animationProps = { 
                         rotate: 90, 
                         opacity: 0.3,
                         transition: { duration: 0.5 } 
                       };
                     }
                   } else if (isAttacking && attackAnimationParams) {
                     animationProps = {
                       x: [0, attackAnimationParams.attackX, 0], 
                       top: [currentTop, `${attackAnimationParams.defenderYPercent}%`, currentTop],
                       transition: { duration: 0.6, times: [0, 0.5, 1] } 
                     };
                   } else {
                     // Idle state
                     animationProps = { x: 0, top: currentTop, rotate: 0, opacity: 1 }; 
                   }

                   return (
                    <motion.div
                      key={fighter.id}
                      className="absolute w-20 h-20 flex items-center justify-center" 
                      style={{ 
                        right: '50%', 
                        top: currentTop, 
                        transform: 'translate(50%, -50%)',
                        zIndex: isAttacking ? 10 : (isDead ? 0 : 1) 
                      }}
                      animate={animationProps}
                    >
                      {/* Level display - positioned to the right of opponent Digimon */}
                      <div className="absolute left-full ml-1 bg-gray-800 bg-opacity-70 px-1 rounded text-xs text-white font-medium">
                        Lv.{fighter.current_level || 1}
                      </div>
                      
                      {/* Disintegration effect for dead Digimon */}
                      {isDisintegrating ? (
                        renderDisintegratingDigimon(fighter)
                      ) : (
                        renderFighterSprite(fighter)
                      )}
                      
                      {/* Hit effect */}
                      {isTarget && !isDead && !currentTurn?.didMiss && (
                        <motion.div
                          className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-full" 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }} 
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </motion.div>
                   );
                })}
              </div>
            </div>
          )}

          {/* Results Screen */}
          {showResultsScreen && (
            <div className="relative h-full flex flex-col items-center justify-center p-4">
              <h2 className="text-3xl font-bold text-green-300 mb-4">
                {playerWon ? "Victory!" : "Defeat!"}
              </h2>
              
              <div className="w-full max-w-3xl bg-black bg-opacity-50 rounded-lg p-4 border border-green-500 overflow-auto">
                
                {/* User team results - horizontal layout */}
                <div className="flex flex-row justify-center space-x-4 mb-4">
                  {userTeam.map((fighter) => {
                    // Use the XP gain directly from the battle result
                    const xpGain = teamBattle.xpGain;
                    const currentXP = fighter.experience_points || 0;
                    const newXP = currentXP + xpGain;
                    
                    // Calculate level progress
                    let currentLevel = fighter.current_level || 1;
                    const xpForNextLevel = currentLevel * 20;
                    const prevLevelProgress = (currentXP % xpForNextLevel) / xpForNextLevel * 100;
                    
                    // Check if leveled up
                    const didLevelUp = newXP >= currentXP + xpForNextLevel - (currentXP % xpForNextLevel);
                    const newLevelProgress = didLevelUp 
                      ? ((newXP - currentXP - (xpForNextLevel - (currentXP % xpForNextLevel))) / ((currentLevel + 1) * 20)) * 100
                      : (newXP % xpForNextLevel) / xpForNextLevel * 100;
                    
                    const newLevel = didLevelUp ? currentLevel + 1 : currentLevel;
                    
                    return (
                      <div key={fighter.id} className="flex flex-col items-center w-1/3 max-w-[150px]">
                        <div className="w-16 h-16 mb-2">
                          {renderResultsDigimon(fighter)}
                        </div>
                        
                        <div className="w-full">
                          <div className="flex justify-center items-center mb-1">
                            {didLevelUp ? (
                              <div className="relative flex justify-center w-full">
                                {/* Old level text that fades out */}
                                <motion.span 
                                  className="text-green-300 font-medium text-sm text-center absolute"
                                  initial={{ opacity: 1 }}
                                  animate={{ opacity: 0 }}
                                  transition={{ duration: 0.2, delay: 1.3 }}
                                >
                                  Lv. {currentLevel} {getDisplayName(fighter)}
                                </motion.span>
                                
                                {/* New level text that fades in */}
                                <motion.span 
                                  className="text-green-300 font-medium text-sm text-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2, delay: 1.5 }}
                                >
                                  Lv. {newLevel} {getDisplayName(fighter)}
                                </motion.span>
                              </div>
                            ) : (
                              // Regular level text (no animation)
                              <span className="text-green-300 font-medium text-sm text-center">
                                Lv. {currentLevel} {getDisplayName(fighter)}
                              </span>
                            )}
                          </div>
                          
                          {/* XP Bar */}
                          { xpGain > 0 && <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden">
                            {/* Previous XP */}
                            <div 
                              className="absolute h-full bg-blue-600" 
                              style={{ width: `${prevLevelProgress}%` }}
                            ></div>
                            
                            {/* XP Gain Animation */}
                            {didLevelUp ? (
                              <>
                                {/* First animation: fill to 100% */}
                                <motion.div 
                                  className="absolute h-full bg-blue-400" 
                                  initial={{ width: `${prevLevelProgress}%` }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 0.8, delay: 0.5 }}
                                ></motion.div>
                                
                                {/* Second animation: reset and fill to new progress */}
                                <motion.div 
                                  className="absolute h-full bg-yellow-400" 
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${newLevelProgress}%` }}
                                  transition={{ duration: 0.6, delay: 1.4 }}
                                ></motion.div>
                                
                                {/* Level up flash effect */}
                                <motion.div
                                  className="absolute inset-0 bg-white"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: [0, 0.7, 0] }}
                                  transition={{ duration: 0.5, delay: 1.3 }}
                                ></motion.div>
                              </>
                            ) : (
                              // Normal XP gain (no level up)
                              <motion.div 
                                className="absolute h-full bg-blue-400" 
                                initial={{ width: `${prevLevelProgress}%` }}
                                animate={{ width: `${newLevelProgress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              ></motion.div>
                            )}
                            
                            {/* XP Text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                +{xpGain} XP
                              </span>
                            </div>
                          </div>
                        }
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
                {/* The existing reserve XP message can stay after this */}
                {teamBattle.xpGain > 0 && (
                  <p className="text-center text-green-300 mt-2">
                    Your reserve Digimon also gained some XP!
                  </p>
                )}
                {/* Display bits reward */}
                {
                  teamBattle.bitsReward > 0 && (
                    <p className="text-center text-green-300 mt-2">
                      You earned {teamBattle.bitsReward} bits!
                    </p>
                  )
                }
                {
                  teamBattle.hint && !playerWon && (
                    <div className="w-full flex justify-center items-center my-8">
                      <p className="text-green-300 text-sm">
                        {teamBattle.hint}
                      </p>
                    </div>
                  )
                }
              </div>
              {/* Return button */}
              <div className="flex justify-center mt-4">
                  <button
                    onClick={onComplete}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                  >
                    Return
                  </button>
                </div>
            </div>
          )}
          
          {/* HP bars at the bottom - only show during battle */}
          {!showResultsScreen && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 bg-black bg-opacity-50">
              {/* User team HP bars */}
              <div className="flex flex-col space-y-2 w-1/2 pr-2">
                {userTeam.map((fighter) => {
                  const maxHp = fighter.stats?.hp ?? DEFAULT_MAX_HP; 
                  const currentHp = hpState[fighter.id] ?? 0; // Default to 0 if not set yet
                  const hpPercentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0; 
                  
                  return (
                    <div key={fighter.id} className="flex items-center">
                      {/* Fighter Name */}
                      <span className="text-green-300 text-xs w-20 truncate mr-2">
                        {getDisplayName(fighter)}
                      </span>
                      {/* HP Bar Background */}
                      <div className="flex-1 bg-gray-900 rounded-full h-2">
                        {/* HP Bar Fill */}
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ease-out ${
                            hpPercentage > 50 ? 'bg-green-500' : 
                            hpPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${hpPercentage}%` }}
                        ></div>
                      </div>
                      {/* HP Text */}
                      <span className="text-green-300 text-xs ml-2 w-16 text-right"> 
                        {Math.ceil(currentHp)}/{Math.ceil(maxHp)}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Opponent team HP bars */}
              <div className="flex flex-col space-y-2 w-1/2 pl-2">
                {opponentTeam.map((fighter) => {
                  const maxHp = fighter.stats?.hp ?? DEFAULT_MAX_HP;
                  const currentHp = hpState[fighter.id] ?? 0; // Default to 0 if not set yet
                  const hpPercentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
                  
                  return (
                    <div key={fighter.id} className="flex items-center">
                      <span className="text-green-300 text-xs w-20 truncate mr-2">
                        {getDisplayName(fighter)}
                      </span>
                      <div className="flex-1 bg-gray-900 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ease-out ${
                            hpPercentage > 50 ? 'bg-green-500' : 
                            hpPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${hpPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-green-300 text-xs ml-2 w-16 text-right">
                        {Math.ceil(currentHp)}/{Math.ceil(maxHp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Battle narration - only show during battle */}
          {!showResultsScreen && (
            <div className="absolute bottom-28 left-4 right-4">
              <div className="bg-black bg-opacity-70 border border-green-500 rounded-lg p-3 text-center">
                {/* Intro Message */}
                {step === 0 && <p className="text-green-300">Team Battle start!</p>}
                
                {/* Turn Narration */}
                {currentTurn && (
                  <p className="text-green-300">
                    {currentTurn.didMiss ? (
                      `${getAttackerName(currentTurn)} misses the attack!`
                    ) : currentTurn.isCriticalHit ? (
                      `${getAttackerName(currentTurn)} attacks critically for ${currentTurn.damage} damage!`
                    ) : (
                      `${getAttackerName(currentTurn)} attacks for ${currentTurn.damage} damage!`
                    )}
                  </p>
                )}

                {/* Show victory/defeat message during the final animation step */}
                {isFinalMessageStep && !showResults && ( 
                  <p className="text-green-300">
                    {playerWon
                      ? "Your team is victorious!"
                      : "Your team has been defeated!"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // --- Narration Helper ---
  function getAttackerName(turn: any) {
    const attackerTeam = turn.attacker.team;
    const attackerId = turn.attacker.id;
    const attacker = attackerTeam === 'user'
      ? userTeam.find(d => d.id === attackerId)
      : opponentTeam.find(d => d.id === attackerId);
    return attacker ? getDisplayName(attacker) : "Unknown";
  }
};

export default TeamBattleAnimation; 