import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";

const Battle = () => {
  const { userDigimon, digimonData, allUserDigimon } = useDigimonStore();
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

  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

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
    
    // Refresh all user Digimon data to update XP and levels in the UI
    useDigimonStore.getState().fetchAllUserDigimon();
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
              disabled={loading || dailyBattlesRemaining <= 0 || teamDigimon.length < 2}
              className={`btn-primary w-full ${
                (dailyBattlesRemaining <= 0 || teamDigimon.length < 2) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {loading 
                ? "Finding Opponent..." 
                : dailyBattlesRemaining <= 0 
                  ? "Daily Limit Reached" 
                  : teamDigimon.length < 2
                    ? "Need 2+ Team Digimon"
                    : "Queue"}
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

            <div className="mt-4">
              <DigimonTeamManager />
            </div>
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