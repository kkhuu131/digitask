import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Battle } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";

interface BattleAnimationProps {
  battle: Battle;
  onComplete: () => void;
}

const BattleAnimation: React.FC<BattleAnimationProps> = ({ battle, onComplete }) => {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { userDigimon, getDigimonDisplayName } = useDigimonStore();
  
  const isUserWinner = battle.winner_digimon_id === battle.user_digimon?.id;
  const isUserDigimon = userDigimon?.id === battle.user_digimon?.id;
  
  // Determine which Digimon is the player's and which is the opponent's
  const playerDigimon = isUserDigimon ? battle.user_digimon : battle.opponent_digimon;
  const opponentDigimon = isUserDigimon ? battle.opponent_digimon : battle.user_digimon;
  
  // Determine if the player won
  const playerWon = isUserDigimon ? isUserWinner : !isUserWinner;
  
  // Get player and opponent usernames
  const playerUsername = playerDigimon?.profile?.display_name || 
                         playerDigimon?.profile?.username || 
                         'Your';
  
  const opponentUsername = opponentDigimon?.profile?.display_name || 
                           opponentDigimon?.profile?.username || 
                           'Gragas';
  
  // Get the display names for both Digimon
  const getDisplayName = (digimon: any) => {
    if (!digimon) return "Unknown";
    
    // If it's the user's current Digimon, use the helper function
    if (digimon.id === userDigimon?.id) {
      return getDigimonDisplayName();
    }
    
    // For other Digimon, implement the same logic
    if (!digimon.name || digimon.name === "") {
      return digimon.digimon?.name || digimon.digimon_details?.name || "Unknown";
    }
    
    return digimon.name;
  };
  
  // Get display names for both Digimon
  const playerDigimonDisplayName = getDisplayName(playerDigimon);
  const opponentDigimonDisplayName = getDisplayName(opponentDigimon);
  
  // Format the Digimon names with usernames
  const playerDigimonFullName = `${playerUsername}'s ${playerDigimonDisplayName}`;
  const opponentDigimonFullName = opponentUsername === "Wild"
    ? `Wild ${opponentDigimonDisplayName}`
    : `${opponentUsername}'s ${opponentDigimonDisplayName}`;
  
  // Use the detailed information if available
  const playerDetails = battle.user_digimon_details;
  const opponentDetails = battle.opponent_digimon_details;

  const battleTurns = battle.turns || [];
  const totalTurns = battleTurns.length;

  const maxSteps = 1 + totalTurns + 1;
  
  useEffect(() => {
    // Animation sequence timing
    const baseTimings = [2000]; // Initial pause
    
    // Add timing for each turn
    if (battleTurns.length > 0) {
      battleTurns.forEach(() => baseTimings.push(2000));
    } else {
      // Fallback to old animation if no turns data
      baseTimings.push(2000, 2000, 2000, 2000, 2000);
    }
    
    // Add final defeat animation timing
    baseTimings.push(3000);

    const timer = setTimeout(() => {
      if (step < baseTimings.length - 1) {
        setStep(step + 1);
      } else {
        setShowResults(true);
      }
    }, baseTimings[step]);
    
    return () => clearTimeout(timer);
  }, [step, battleTurns.length]);
  
  const getCurrentTurn = () => {
    if (step === 0 || step >= totalTurns + 1) {
      return null; // No turn for intro or defeat
    }
    return battleTurns[step - 1]; // Adjust for intro step
  };

  const currentTurn = getCurrentTurn();

  // Determine if player is attacking in current turn
  const isPlayerAttacking = currentTurn ? 
    (isUserDigimon ? 
      currentTurn.attacker === "user" : 
      currentTurn.attacker === "opponent") : 
    false;
  
  // Determine if opponent is attacking in current turn
  const isOpponentAttacking = currentTurn ? 
    (isUserDigimon ? 
      currentTurn.attacker === "opponent" : 
      currentTurn.attacker === "user") : 
    false;
  
  // For the final step (defeat animation)
  const isFinalStep = step === maxSteps - 1;
  
  // Calculate HP percentages for both Digimon - use values directly since they're already percentages
  const playerHPPercent = currentTurn ? 
    Math.max(0, Math.min(100, currentTurn.remainingUserHP)) : 100;
  
  const opponentHPPercent = currentTurn ? 
    Math.max(0, Math.min(100, currentTurn.remainingOpponentHP)) : 100;
  
  // Fix for health bars at the final step
  const finalPlayerHP = playerWon ? 
    // Keep the last known HP value for the winner
    (battleTurns.length > 0 ? 
      battleTurns[battleTurns.length - 1].remainingUserHP : 
      100) : 
    0;

  const finalOpponentHP = playerWon ? 
    0 : 
    // Keep the last known HP value for the winner
    (battleTurns.length > 0 ? 
      battleTurns[battleTurns.length - 1].remainingOpponentHP : 
      100);
  
  // Use the appropriate HP values based on the current step
  const displayPlayerHP = isFinalStep ? finalPlayerHP : playerHPPercent;
  const displayOpponentHP = isFinalStep ? finalOpponentHP : opponentHPPercent;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {showResults ? (
          // Results screen (reverted to original)
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">
              {playerWon ? "Victory!" : "Defeat!"}
            </h2>
            
            <div className="flex justify-center items-center mb-8">
              <div className="text-center mx-4">
                <div className="w-32 h-32 mx-auto flex items-center justify-center">
                  <img 
                    src={playerDetails?.sprite_url || playerDigimon?.digimon?.sprite_url} 
                    alt={playerDigimonDisplayName} 
                    className="my-auto mx-auto"
                    style={{ imageRendering: "pixelated", transform: "scale(-3, 3)" }} 
                  />
                </div>
                <p className="font-semibold">
                  {playerDigimonDisplayName}
                </p>
                <p className="text-sm text-gray-600">
                  Lv. {playerDetails?.level || playerDigimon?.current_level}
                </p>
              </div>
              
              <div className="text-2xl font-bold mx-4">VS</div>
              
              <div className="text-center mx-4 ">
                <div className="w-32 h-32 mx-auto flex items-center justify-center">
                  <img 
                    src={opponentDetails?.sprite_url || opponentDigimon?.digimon?.sprite_url} 
                    alt={opponentDigimonDisplayName} 
                    className="scale-[3] my-auto mx-auto"
                    style={{ 
                      imageRendering: "pixelated", 
                      opacity: playerWon ? 0.5 : 1
                    }} 
                  />
                </div>
                <p className="font-semibold mt-2">
                  {opponentDigimonDisplayName}
                </p>
                <p className="text-sm text-gray-600">
                  Lv. {opponentDetails?.level || opponentDigimon?.current_level}
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-lg">
                {playerWon 
                  ? `${playerUsername}'s ${playerDigimonDisplayName} won the battle!` 
                  : `${playerUsername}'s ${playerDigimonDisplayName} was defeated!`}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {playerWon 
                  ? "You earned 15 XP from this victory!" 
                  : "You earned 5 XP from this battle."}
              </p>
            </div>
            
            <button 
              onClick={onComplete}
              className="btn-primary"
            >
              Return
            </button>
          </div>
        ) : (
          // Battle animation
          <div className="relative h-[60vh] bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden">
            {/* Battle arena */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-300 to-green-200"></div>
            
            {/* Battle info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="bg-white bg-opacity-80 rounded-lg p-2 w-1/3">
                <p className="font-bold">{playerUsername}'s {playerDigimonDisplayName}</p>
                <p className="text-sm">Lv. {playerDigimon?.current_level}</p>
                
                {/* Player HP bar - with fixed HP for final step */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${displayPlayerHP}%`,
                      transition: "width 0.5s ease-in-out"
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-80 rounded-lg p-2 w-1/3">
                <p className="font-bold">{opponentUsername === "Wild"
                    ? `Wild ${opponentDigimonDisplayName}`
                    : `${opponentUsername}'s ${opponentDigimonDisplayName}`}
                </p>
                <p className="text-sm">Lv. {opponentDigimon?.current_level}</p>
                
                {/* Opponent HP bar - with fixed HP for final step */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${displayOpponentHP}%`,
                      transition: "width 0.5s ease-in-out"
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Player Digimon (now on the left) */}
            <motion.div
              className="absolute bottom-[25%] left-[20%] w-32 h-32 flex flex-col items-center"
              animate={{
                x: isPlayerAttacking ? [0, 150, 0] : 0,
                y: isFinalStep && !playerWon ? [0, 20] : 0,
                rotate: isFinalStep && !playerWon ? 90 : 0,
                opacity: isFinalStep && !playerWon ? 0.5 : 1,
              }}
              transition={{
                duration: isPlayerAttacking ? 0.5 : 0.8,
                times: isPlayerAttacking ? [0, 0.5, 1] : [0, 1],
              }}
            >
              <img 
                src={playerDetails?.sprite_url || playerDigimon?.digimon?.sprite_url} 
                alt={playerDigimonDisplayName} 
                className="my-auto mx-auto"
                style={{ 
                  imageRendering: "pixelated", transform: "scale(-3, 3)"
                }} 
              />
            </motion.div>
            
            {/* Opponent Digimon */}
            <motion.div
              className="absolute bottom-[25%] right-[20%] w-32 h-32 flex flex-col items-center"
              animate={{
                x: isOpponentAttacking ? [0, -150, 0] : 0,
                y: isFinalStep && playerWon ? [0, 20] : 0,
                rotate: isFinalStep && playerWon ? 90 : 0,
                opacity: isFinalStep && playerWon ? 0.5 : 1,
              }}
              transition={{
                duration: isOpponentAttacking ? 0.5 : 0.8,
                times: isOpponentAttacking ? [0, 0.5, 1] : [0, 1],
              }}
            >
              <img 
                src={opponentDetails?.sprite_url || opponentDigimon?.digimon?.sprite_url} 
                alt={opponentDigimonDisplayName} 
                className="my-auto mx-auto"
                style={{ 
                  imageRendering: "pixelated",
                  transform: "scale(3, 3)"
                }} 
              />
            </motion.div>
            
            {/* Battle narration */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white bg-opacity-90 rounded-lg p-3 text-center">
              {step === 0 && <p>Battle start!</p>}
              {currentTurn && isPlayerAttacking && (
                <>
                  {currentTurn.didMiss ? (
                    <p>{playerDigimonFullName} misses the attack!</p>
                  ) : currentTurn.isCriticalHit ? (
                    <p>
                      {playerDigimonFullName} attacks critically for {currentTurn.damage} damage!
                    </p>
                  ) : (
                    <p>
                      {playerDigimonFullName} attacks for {currentTurn.damage} damage!
                    </p>
                  )}
                </>
              )}

              {currentTurn && isOpponentAttacking && (
                <>
                  {currentTurn.didMiss ? (
                    <p>{opponentDigimonFullName} misses the attack!</p>
                  ) : currentTurn.isCriticalHit ? (
                    <p>
                      {opponentDigimonFullName} attacks critically for {currentTurn.damage} damage!
                    </p>
                  ) : (
                    <p>
                      {opponentDigimonFullName} attacks for {currentTurn.damage} damage!
                    </p>
                  )}
                </>
              )}

              {isFinalStep && (
                <p>
                  {playerWon
                    ? `${opponentDigimonFullName} is defeated!`
                    : `${playerDigimonFullName} is defeated!`}
                </p>
              )}
                
                {/* Fallback for when no turns data is available */}
                {!currentTurn && !isFinalStep && step > 0 && (
                  <>
                    {step === 1 && <p>{playerDigimonFullName} attacks!</p>}
                    {step === 2 && <p>{opponentDigimonFullName} attacks!</p>}
                    {step === 3 && <p>{playerDigimonFullName} attacks again!</p>}
                    {step === 4 && <p>{opponentDigimonFullName} attacks again!</p>}
                    {step === 5 && <p>{playerWon ? playerDigimonFullName : opponentDigimonFullName} prepares a final attack!</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleAnimation; 