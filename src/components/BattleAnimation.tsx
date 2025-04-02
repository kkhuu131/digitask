import { useState, useEffect } from "react";
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
  const { userDigimon } = useDigimonStore();
  
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
                           'Wild';
  
  // Format the Digimon names with usernames
  const playerDigimonFullName = `${playerUsername}'s ${playerDigimon?.name}`;
  const opponentDigimonFullName = `${opponentUsername}'s ${opponentDigimon?.name}`;
  
  useEffect(() => {
    // Animation sequence timing
    const timings = [
      2000,  // Initial pause
      2000,  // Player attack
      2000,  // Opponent attack
      2000,  // Player attack
      2000,  // Opponent attack
      2000,  // Final attack from winner
      3000,  // Defeat animation
    ];
    
    // Progress through animation steps
    const timer = setTimeout(() => {
      if (step < timings.length - 1) {
        setStep(step + 1);
      } else {
        setShowResults(true);
      }
    }, timings[step]);
    
    return () => clearTimeout(timer);
  }, [step]);
  
  // Determine which Digimon is attacking in the current step
  const isPlayerAttacking = step === 1 || step === 3 || (step === 5 && playerWon);
  const isOpponentAttacking = step === 2 || step === 4 || (step === 5 && !playerWon);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {showResults ? (
          // Results screen
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">
              {playerWon ? "Victory!" : "Defeat!"}
            </h2>
            
            <div className="flex justify-center items-center mb-8">
              <div className="text-center mx-4">
                <div className="w-32 h-32 mx-auto flex items-center justify-center">
                  <img 
                    src={playerDigimon?.digimon?.sprite_url} 
                    alt={playerDigimon?.name} 
                    className="my-auto mx-auto"
                    style={{ imageRendering: "pixelated", transform: "scale(-3, 3)" }} 
                  />
                </div>
                <p className="font-semibold">{playerDigimon?.name}</p>
                <p className="text-sm text-gray-600">
                  Lv. {playerDigimon?.current_level}
                </p>
              </div>
              
              <div className="text-2xl font-bold mx-4">VS</div>
              
              <div className="text-center mx-4 ">
                <div className="w-32 h-32 mx-auto flex items-center justify-center">
                  <img 
                    src={opponentDigimon?.digimon?.sprite_url} 
                    alt={opponentDigimon?.name} 
                    className="scale-[3] my-auto mx-auto"
                    style={{ 
                      imageRendering: "pixelated",
                      opacity: playerWon ? 0.5 : 1
                    }} 
                  />
                </div>
                <p className="font-semibold mt-2">{opponentDigimon?.name}</p>
                <p className="text-sm text-gray-600">
                  Lv. {opponentDigimon?.current_level}
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-lg">
                {playerWon 
                  ? `${playerUsername}'s ${playerDigimon?.name} won the battle!` 
                  : `${playerUsername}'s ${playerDigimon?.name} was defeated!`}
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
            
            {/* Player Digimon (now on the left) */}
            <motion.div
              className="absolute bottom-[25%] left-[20%] w-32 h-32 flex flex-col items-center"
              animate={{
                x: isPlayerAttacking ? [0, 150, 0] : 0,
                y: step === 6 && !playerWon ? [0, 20] : 0,
                rotate: step === 6 && !playerWon ? 90 : 0,
                opacity: step === 6 && !playerWon ? 0.5 : 1,
              }}
              transition={{
                duration: isPlayerAttacking ? 0.5 : 0.8,
                times: isPlayerAttacking ? [0, 0.5, 1] : [0, 1],
              }}
            >
              <img 
                src={playerDigimon?.digimon?.sprite_url} 
                alt={playerDigimon?.name} 
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
                y: step === 6 && playerWon ? [0, 20] : 0,
                rotate: step === 6 && playerWon ? 90 : 0,
                opacity: step === 6 && playerWon ? 0.5 : 1,
              }}
              transition={{
                duration: isOpponentAttacking ? 0.5 : 0.8,
                times: isOpponentAttacking ? [0, 0.5, 1] : [0, 1],
              }}
            >
              <img 
                src={opponentDigimon?.digimon?.sprite_url} 
                alt={opponentDigimon?.name} 
                className="my-auto mx-auto"
                style={{ 
                  imageRendering: "pixelated",
                  transform: "scale(3, 3)"
                }} 
              />
            </motion.div>
            
            {/* Attack effects
            <AnimatePresence>
              {(isPlayerAttacking || isOpponentAttacking) && (
                <motion.div 
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    bottom: "25%",
                    left: isOpponentAttacking ? "25%" : "65%",
                  }}
                >
                  <div className="text-4xl">💥</div>
                </motion.div>
              )}
            </AnimatePresence> */}
            
            {/* Battle info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="bg-white bg-opacity-80 rounded-lg p-2">
                <p className="font-bold">{playerUsername}'s {playerDigimon?.name}</p>
                <p className="text-sm">Lv. {playerDigimon?.current_level}</p>
              </div>
              
              <div className="bg-white bg-opacity-80 rounded-lg p-2">
                <p className="font-bold">{opponentUsername}'s {opponentDigimon?.name}</p>
                <p className="text-sm">Lv. {opponentDigimon?.current_level}</p>
              </div>
            </div>
            
            {/* Battle narration */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white bg-opacity-90 rounded-lg p-3 text-center">
                {step === 0 && <p>Battle start!</p>}
                {step === 1 && <p>{playerDigimonFullName} attacks!</p>}
                {step === 2 && <p>{opponentDigimonFullName} attacks!</p>}
                {step === 3 && <p>{playerDigimonFullName} attacks again!</p>}
                {step === 4 && <p>{opponentDigimonFullName} attacks again!</p>}
                {step === 5 && <p>{playerWon ? playerDigimonFullName : opponentDigimonFullName} prepares a final attack!</p>}
                {step === 6 && <p>{playerWon ? opponentDigimonFullName : playerDigimonFullName} is defeated!</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleAnimation; 