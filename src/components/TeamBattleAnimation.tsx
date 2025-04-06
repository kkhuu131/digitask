import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TeamBattle } from "../store/battleStore";

interface TeamBattleAnimationProps {
  teamBattle: TeamBattle;
  onComplete: () => void;
}

const DEFAULT_MAX_HP = 100; // Fallback if stats are missing
const VERTICAL_RANGE_START = 10; // Start positioning at 20% from the top
const VERTICAL_RANGE_END = 50;   // End positioning at 80% from the top
const TURN_DURATION = 2000; // Duration for each turn animation + pause
const FINAL_MESSAGE_DURATION = 2500; // How long to show "Victory/Defeat" before results confirmation
const RESULTS_DURATION = 0; // How long to show results confirmation before closing

const TeamBattleAnimation: React.FC<TeamBattleAnimationProps> = ({ 
  teamBattle, 
  onComplete 
}) => {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hpState, setHpState] = useState<{ [id: string]: number }>({});
  
  // Use separate refs for different timed actions for clarity and safety
  const advanceStepTimeoutRef = useRef<NodeJS.Timeout | null>(null); 
  const showResultsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userTeam = teamBattle.user_team || [];
  const opponentTeam = teamBattle.opponent_team || [];
  const battleTurns = teamBattle.turns || [];
  const playerWon = teamBattle.winner_id === userTeam[0]?.id;
  const totalTurns = battleTurns.length;
  // step 0: Intro
  // step 1 to totalTurns: Turn animations
  // step totalTurns + 1: Final message display ("Victory/Defeat")
  const maxSteps = 1 + totalTurns + 1; 
  
  const currentTurn = step > 0 && step <= totalTurns ? battleTurns[step - 1] : null; 
  // Are we on the step *displaying* the final message?
  const isFinalMessageStep = step === maxSteps - 1; 

  // --- State Initialization ---
  useEffect(() => {
    console.log("Battle Data Changed - Initializing HP and State");
    const initialHp: { [id: string]: number } = {};
    userTeam.forEach(fighter => {
      initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP; 
    });
    opponentTeam.forEach(fighter => {
      initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP;
    });
    
    setHpState(initialHp);
    setStep(0); 
    setShowResults(false);

    // Clear ALL timers when battle changes
    if (advanceStepTimeoutRef.current) clearTimeout(advanceStepTimeoutRef.current);
    if (showResultsTimeoutRef.current) clearTimeout(showResultsTimeoutRef.current);
    if (onCompleteTimeoutRef.current) clearTimeout(onCompleteTimeoutRef.current);
    advanceStepTimeoutRef.current = null;
    showResultsTimeoutRef.current = null;
    onCompleteTimeoutRef.current = null;


  }, [teamBattle]); // Rerun only when the battle data itself changes

  // --- HP Update Logic ---
  useEffect(() => {
    // Update HP based on the outcome of the turn being animated (currentTurn)
    if (step > 0 && currentTurn && currentTurn.remainingHP) {
      // console.log(`Step ${step}: Updating HP based on current turn (index ${step - 1}) results:`, currentTurn.remainingHP);
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
    } else if (step === 0) {
        // Reset HP on step 0
        const initialHp: { [id: string]: number } = {};
        userTeam.forEach(fighter => initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP);
        opponentTeam.forEach(fighter => initialHp[fighter.id] = fighter.stats?.hp ?? DEFAULT_MAX_HP);
        setHpState(prevHp => {
            const changed = Object.keys(initialHp).some(id => initialHp[id] !== prevHp[id]) || Object.keys(prevHp).length !== Object.keys(initialHp).length;
            return changed ? initialHp : prevHp;
        });
    }
  }, [step, currentTurn?.remainingHP, userTeam, opponentTeam]); 

  // --- Step Advancement Logic ---
  const advanceStep = () => {
     // Only advance if we are not yet on the final message step
    if (step < maxSteps - 1) { 
      console.log(`Advancing step from ${step} to ${step + 1}`);
      setStep(prevStep => prevStep + 1);
    } else {
        console.log("AdvanceStep called on final message step, should not happen via main timer.");
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
      console.log(`Setting timer to advance from step ${step} in ${TURN_DURATION}ms`);
      advanceStepTimeoutRef.current = setTimeout(advanceStep, TURN_DURATION); 
    }

    // Cleanup
    return () => {
      if (advanceStepTimeoutRef.current) {
        // console.log(`Clearing advance step timer associated with step ${step}`);
        clearTimeout(advanceStepTimeoutRef.current);
        advanceStepTimeoutRef.current = null;
      }
    };
  // Depend only on step and showResults for this timer logic
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [step, showResults]); 

  // 2. Timer to trigger showing results after final message step is displayed
   useEffect(() => {
    // Clear previous timer first
    if (showResultsTimeoutRef.current) {
      clearTimeout(showResultsTimeoutRef.current);
      showResultsTimeoutRef.current = null;
    }
     
    // If we are on the final message step AND not yet showing results
    if (isFinalMessageStep && !showResults) {
      console.log(`On final message step (${step}). Setting timer to show results in ${FINAL_MESSAGE_DURATION}ms`);
      showResultsTimeoutRef.current = setTimeout(() => {
        console.log("Timer fired: Setting showResults to true");
        setShowResults(true);
      }, FINAL_MESSAGE_DURATION);
    }

    // Cleanup
    return () => {
      if (showResultsTimeoutRef.current) {
        // console.log(`Clearing show results timer`);
        clearTimeout(showResultsTimeoutRef.current);
        showResultsTimeoutRef.current = null;
      }
    };
   }, [step, isFinalMessageStep, showResults]); // Depend on step and showResults

   // 3. Timer to call onComplete after results are shown
   useEffect(() => {
    // Clear previous timer first
    if (onCompleteTimeoutRef.current) {
      clearTimeout(onCompleteTimeoutRef.current);
      onCompleteTimeoutRef.current = null;
    }

    // If results are being shown
    if (showResults) {
      console.log(`Results shown. Setting timer to call onComplete in ${RESULTS_DURATION}ms`);
      onCompleteTimeoutRef.current = setTimeout(() => {
        console.log("Timer fired: Calling onComplete");
        onComplete();
      }, RESULTS_DURATION);
    }

    // Cleanup
    return () => {
      if (onCompleteTimeoutRef.current) {
        // console.log(`Clearing onComplete timer`);
        clearTimeout(onCompleteTimeoutRef.current);
        onCompleteTimeoutRef.current = null;
      }
    };
   }, [showResults, onComplete]); // Depend only on showResults and onComplete


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

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0">
          {/* Battle scene */}
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

                 // Define animation based on state
                 let animationProps = {};
                 if (isDead) {
                   animationProps = { 
                     rotate: 90, 
                     opacity: 0.3, // Fade out more when dead
                     transition: { duration: 0.5 } 
                   };
                 } else if (isAttacking && attackAnimationParams) {
                   animationProps = {
                     x: [0, attackAnimationParams.attackX, 0], 
                     top: [currentTop, `${attackAnimationParams.defenderYPercent}%`, currentTop],
                     transition: { duration: 0.6, times: [0, 0.5, 1] } 
                   };
                 } else {
                   // Idle state (reset position and ensure full opacity if alive)
                   animationProps = { x: 0, top: currentTop, rotate: 0, opacity: 1 }; 
                 }

                 return (
                  <motion.div
                    key={fighter.id}
                    className="absolute w-20 h-20 flex items-center justify-center" 
                    style={{ 
                      left: '35%', 
                      top: currentTop, 
                      transform: 'translate(-50%, -50%)',
                      zIndex: isAttacking ? 10 : (isDead ? 0 : 1) // Dead behind, attacker front
                    }}
                    animate={animationProps} // Apply the determined animation
                  >
                     <img 
                      src={fighter.sprite_url} 
                      alt={getDisplayName(fighter)} 
                      className="w-14 h-14 object-contain" 
                      style={{ 
                        imageRendering: "pixelated",
                        transform: "scale(-1.5, 1.5)", 
                        // Opacity is now controlled by the main animate prop
                        // opacity: isTarget && !isDead ? "0.7" : "1" // Only dim target if alive
                      }} 
                    />
                    {/* Show hit effect only if target is NOT dead */}
                    {isTarget && !isDead && !currentTurn?.didMiss && (
                      <motion.div /* Attack Effect */
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

                 // Define animation based on state
                 let animationProps = {};
                 if (isDead) {
                   animationProps = { 
                     rotate: -90, // Rotate other way for opponent? Or keep same? Let's try same: 90
                     opacity: 0.3, 
                     transition: { duration: 0.5 } 
                   };
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
                      right: '35%', 
                      top: currentTop, 
                      transform: 'translate(50%, -50%)',
                      zIndex: isAttacking ? 10 : (isDead ? 0 : 1) 
                    }}
                    animate={animationProps} // Apply the determined animation
                  >
                     <img 
                      src={fighter.sprite_url} 
                      alt={getDisplayName(fighter)} 
                      className="w-14 h-14 object-contain" 
                      style={{ 
                        imageRendering: "pixelated",
                        transform: "scale(1.5, 1.5)", 
                        // Opacity controlled by animate prop
                        // opacity: isTarget && !isDead ? "0.7" : "1" 
                      }} 
                    />
                     {/* Show hit effect only if target is NOT dead */}
                    {isTarget && !isDead && !currentTurn?.didMiss && (
                       <motion.div /* Attack Effect */
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
          
          {/* HP bars at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 bg-black bg-opacity-50">
            {/* User team HP bars */}
            <div className="flex flex-col space-y-2 w-1/2 pr-2">
              {userTeam.map((fighter) => {
                const maxHp = fighter.stats?.hp ?? DEFAULT_MAX_HP; 
                const currentHp = hpState[fighter.id] ?? maxHp; 
                const hpPercentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0; 
                
                return (
                  <div key={fighter.id} className="flex items-center">
                    {/* Fighter Name */}
                    <span className="text-white text-xs w-20 truncate mr-2">
                      {getDisplayName(fighter)}
                    </span>
                    {/* HP Bar Background */}
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      {/* HP Bar Fill */}
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          hpPercentage > 50 ? 'bg-green-500' : 
                          hpPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercentage}%` }}
                      ></div>
                    </div>
                    {/* HP Text - Added fixed width and text alignment */}
                    <span className="text-white text-xs ml-2 w-16 text-right"> 
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
                const currentHp = hpState[fighter.id] ?? maxHp;
                const hpPercentage = maxHp > 0 ? Math.max(0, (currentHp / maxHp) * 100) : 0;
                
                return (
                  <div key={fighter.id} className="flex items-center">
                     {/* Fighter Name */}
                    <span className="text-white text-xs w-20 truncate mr-2">
                      {getDisplayName(fighter)}
                    </span>
                     {/* HP Bar Background */}
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                       {/* HP Bar Fill */}
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          hpPercentage > 50 ? 'bg-green-500' : 
                          hpPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercentage}%` }}
                      ></div>
                    </div>
                     {/* HP Text - Added fixed width and text alignment */}
                    <span className="text-white text-xs ml-2 w-16 text-right">
                      {Math.ceil(currentHp)}/{Math.ceil(maxHp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Battle narration */}
          <div className="absolute bottom-28 left-4 right-4">
            <div className="bg-white bg-opacity-90 rounded-lg p-3 text-center">
              {/* Intro Message */}
              {step === 0 && <p>Team Battle start!</p>}
              
              {/* Turn Narration */}
              {currentTurn && (
                <>
                  {currentTurn.didMiss ? (
                    <p>
                      {getAttackerName(currentTurn)} misses the attack!
                    </p>
                  ) : currentTurn.isCriticalHit ? (
                    <p>
                      {getAttackerName(currentTurn)} attacks critically for {currentTurn.damage} damage!
                    </p>
                  ) : (
                    <p>
                      {getAttackerName(currentTurn)} attacks for {currentTurn.damage} damage!
                    </p>
                  )}
                </>
              )}

              {/* Show victory/defeat message during the final animation step */}
              {isFinalMessageStep && !showResults && ( 
                <p>
                  {playerWon
                    ? "Your team is victorious!"
                    : "Your team has been defeated!"}
                </p>
              )}
              
              {/* Show final confirmation after results flag is set */}
              {showResults && ( 
                <div className="mt-2">
                  <p className="font-bold text-lg">
                    {playerWon ? "Victory!" : "Defeat!"}
                  </p>
                </div>
              )}
            </div>
          </div>
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