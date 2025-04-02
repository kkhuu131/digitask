import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import BattleAnimation from "../components/BattleAnimation";

const Battle = () => {
  const { userDigimon, digimonData } = useDigimonStore();
  const { 
    queueForBattle, 
    currentBattle, 
    battleHistory, 
    loading, 
    error, 
    clearCurrentBattle 
  } = useBattleStore();
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);

  useEffect(() => {
    // If we have a current battle result but aren't showing the animation,
    // that means we just got a battle result and should show the animation
    if (currentBattle && !showBattleAnimation) {
      setShowBattleAnimation(true);
    }
  }, [currentBattle, showBattleAnimation]);

  useEffect(() => {
    const loadBattleData = async () => {
      await useBattleStore.getState().fetchBattleHistory();
    };
    
    loadBattleData();
  }, []);

  const handleQueueForBattle = async () => {
    if (!userDigimon) return;
    await queueForBattle(userDigimon.id);
  };

  const handleBattleComplete = () => {
    setShowBattleAnimation(false);
    clearCurrentBattle();
  };

  if (!userDigimon || !digimonData) {
    return (
      <div className="text-center py-12">
        <p>Loading your Digimon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showBattleAnimation && currentBattle ? (
        <BattleAnimation 
          battle={currentBattle} 
          onComplete={handleBattleComplete} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Your Digimon</h2>
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 flex items-center justify-center mb-4">
                <img 
                  src={digimonData.sprite_url} 
                  alt={digimonData.name} 
                  className="scale-[3]"
                  style={{ imageRendering: "pixelated" }} 
                />
              </div>
              <h3 className="text-lg font-semibold">{userDigimon.name}</h3>
              <p className="text-sm text-gray-500">{digimonData.name} - Level {userDigimon.current_level}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Battle Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>HP: {digimonData.hp}</div>
                <div>ATK: {digimonData.atk}</div>
                <div>DEF: {digimonData.def}</div>
                <div>SPD: {digimonData.spd}</div>
              </div>
            </div>
            
            <button 
              onClick={handleQueueForBattle}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Finding Opponent..." : "Queue"}
            </button>
            
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Battle History</h2>
            <BattleHistory battles={battleHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Battle; 