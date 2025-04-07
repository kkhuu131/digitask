import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import TeamBattleAnimation from "../components/TeamBattleAnimation";

const Battle = () => {
  const { userDigimon, digimonData, allUserDigimon, } = useDigimonStore();
  const { 
    queueForTeamBattle,
    currentTeamBattle,
    teamBattleHistory,
    loading, 
    error, 
    clearCurrentTeamBattle,
    dailyBattlesRemaining,
    checkDailyBattleLimit
  } = useBattleStore();
  
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const [noRealOpponents, setNoRealOpponents] = useState(false);

  useEffect(() => {
    // If we have a current battle result but aren't showing the animation,
    // that means we just got a battle result and should show the animation
    if ((currentTeamBattle) && !showBattleAnimation) {
      setShowBattleAnimation(true);
    }
  }, [currentTeamBattle, showBattleAnimation]);

  useEffect(() => {
    // Check if the current battle is against a dummy opponent
  if (currentTeamBattle && currentTeamBattle.opponent_team.some(d => d.id.startsWith("dummy-"))) {
      setNoRealOpponents(true);
    } else {
      setNoRealOpponents(false);
    }
  }, [currentTeamBattle]);

  useEffect(() => {
    const loadBattleData = async () => {
      await useBattleStore.getState().fetchTeamBattleHistory();
      checkDailyBattleLimit();
    };
    
    loadBattleData();
  }, [checkDailyBattleLimit]);

  const handleQueueForBattle = async () => {
    if (!userDigimon) return;
    
    await queueForTeamBattle();
  };

  const handleBattleComplete = () => {
    setShowBattleAnimation(false);
    clearCurrentTeamBattle();
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
      {showBattleAnimation ? (
        currentTeamBattle ?
          (
            <TeamBattleAnimation 
              teamBattle={currentTeamBattle}
              onComplete={handleBattleComplete} 
            />
          )
        : null
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Battle Arena</h2>
              <div>
                <h3 className="text-lg font-semibold text-center mb-4">Your Team</h3>
                <div className="flex justify-center space-x-4 mb-6">
                  {allUserDigimon.map((digimon) => (
                    <div key={digimon.id} className="text-center">
                      <div className="w-20 h-20 flex items-center justify-center">
                        <img 
                          src={digimon.digimon?.sprite_url} 
                          alt={digimon.name || digimon.digimon?.name} 
                          className="scale-[2]"
                          style={{ imageRendering: "pixelated" }} 
                        />
                      </div>
                      <p className="text-xs mt-1">
                        {digimon.name || digimon.digimon?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Lv.{digimon.current_level}
                      </p>
                    </div>
                  ))}
                  
                  {/* Placeholder slots for missing team members */}
                  {Array.from({ length: Math.max(0, 3 - allUserDigimon.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="text-center">
                      <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-xs mt-1 text-gray-400">Empty Slot</p>
                    </div>
                  ))}
                </div>
                
                {allUserDigimon.length < 2 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <p className="text-sm text-yellow-700">
                      You need at least 2 Digimon for team battles. Visit "Your Digimon" to add more to your team.
                    </p>
                  </div>
                )}
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
              disabled={loading || dailyBattlesRemaining <= 0 || allUserDigimon.length < 2}
              className={`btn-primary w-full ${
                (dailyBattlesRemaining <= 0 || allUserDigimon.length < 2) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {loading 
                ? "Finding Opponent..." 
                : dailyBattlesRemaining <= 0 
                  ? "Daily Limit Reached" 
                  : allUserDigimon.length < 2
                    ? "Need More Digimon"
                    : "Queue for Battle"}
            </button>
            
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {noRealOpponents && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  No real opponents found. You battled against wild Digimon instead. 
                  Invite friends to join the game for real battles!
                </p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Battle History</h2>
            <BattleHistory 
              teamBattles={teamBattleHistory} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Battle; 