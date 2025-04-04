import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import BattleAnimation from "../components/BattleAnimation";

const Battle = () => {
  const { userDigimon, digimonData, getDigimonDisplayName, allUserDigimon } = useDigimonStore();
  const { 
    queueForBattle, 
    currentBattle, 
    battleHistory, 
    loading, 
    error, 
    clearCurrentBattle,
    dailyBattlesRemaining,
    checkDailyBattleLimit
  } = useBattleStore();
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const [noRealOpponents, setNoRealOpponents] = useState(false);

  const playerDigimonDisplayName = getDigimonDisplayName();
  const totalDigimon = allUserDigimon.length;

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
      checkDailyBattleLimit();
    };
    
    loadBattleData();
  }, [checkDailyBattleLimit]);

  useEffect(() => {
    // Check if the current battle is against a dummy opponent
    if (currentBattle && currentBattle.opponent_digimon?.id.startsWith("dummy-")) {
      setNoRealOpponents(true);
    } else {
      setNoRealOpponents(false);
    }
  }, [currentBattle]);

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
              <h3 className="text-lg font-semibold">{playerDigimonDisplayName}</h3>
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
            
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-sm">
                <span className="font-medium">Daily Battles:</span> {dailyBattlesRemaining} remaining
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Your battle limit resets at midnight.
              </p>
            </div>
            
            <button 
              onClick={handleQueueForBattle}
              disabled={loading || dailyBattlesRemaining <= 0}
              className={`btn-primary w-full ${dailyBattlesRemaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Finding Opponent..." : 
               dailyBattlesRemaining <= 0 ? "Daily Limit Reached" : "Queue"}
            </button>
            
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {noRealOpponents && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  No real opponents found. You battled against a wild Digimon instead. 
                  Invite friends to join the game for real battles!
                </p>
              </div>
            )}
            
            {totalDigimon > 1 && (
              <div className="text-sm text-gray-600 mb-4">
                This is your active Digimon. You can switch your active Digimon in the 
                <a href="/your-digimon" className="text-primary-600 hover:text-primary-500 mx-1">Your Digimon</a> 
                section.
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