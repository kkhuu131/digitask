import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";

const Battle = () => {
  const { userDigimon, digimonData, allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const { 
    battleOptions,
    getBattleOptions,
    selectAndStartBattle,
    currentTeamBattle,
    teamBattleHistory,
    loading, 
    error, 
    clearCurrentTeamBattle,
    dailyBattlesRemaining,
    checkDailyBattleLimit,
  } = useBattleStore();

  useEffect(() => {
    fetchAllUserDigimon();
    
    // Only fetch battle options if needed
    const battleStore = useBattleStore.getState();
    if (
      battleStore.shouldRefreshOptions || 
      battleStore.battleOptions.length === 0 ||
      !battleStore.lastOptionsRefresh
    ) {
      getBattleOptions();
    }
  }, []);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);

  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  useEffect(() => {
    // If we have a current battle result but aren't showing the animation,
    // that means we just got a battle result and should show the animation
    if ((currentTeamBattle) && !showBattleAnimation) {
      setShowBattleAnimation(true);
    }
  }, [currentTeamBattle, showBattleAnimation]);

  useEffect(() => {
    const loadBattleData = async () => {
      await useBattleStore.getState().fetchTeamBattleHistory();
      checkDailyBattleLimit();
    };
    
    loadBattleData();
  }, [checkDailyBattleLimit]);

  const handleStartBattle = async (optionId: string) => {
    if (!optionId) return;
    setSelectedOption(optionId); // Still set this for visual feedback
    await selectAndStartBattle(optionId);
  };

  const handleBattleComplete = () => {
    setShowBattleAnimation(false);
    clearCurrentTeamBattle();
    
    // Fetch the battle history after clearing the current battle
    useBattleStore.getState().fetchTeamBattleHistory();
    
    // Refresh all user Digimon data to update XP and levels in the UI
    useDigimonStore.getState().fetchAllUserDigimon();
    
    // Refresh the daily battle limit to update the counter
    checkDailyBattleLimit();
    
    // Force refresh battle options immediately
    getBattleOptions(true);
    setSelectedOption(null);
  };

  if (!userDigimon || !digimonData) {
    return (
      <div className="text-center py-12">
        <p>Loading your Digimon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
        <div className="space-y-6">
          {/* Battle Options Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Choose Your Opponent</h2>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium">Daily Battles:</span> {dailyBattlesRemaining} remaining
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {battleOptions.map(option => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedOption === option.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          option.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          option.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {option.difficulty.charAt(0).toUpperCase() + option.difficulty.slice(1)}
                        </span>
                        
                        <span className="text-sm font-medium text-gray-700">
                          {option.isWild ? 'Wild Digimon' : option.team.display_name || option.team.username}
                        </span>
                      </div>
                      
                      <div className="flex justify-center items-center space-x-2 mb-3 min-h-[80px]">
                        {option.team.digimon.map(digimon => (
                          <div key={digimon.id} className="text-center flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 flex items-center justify-center">
                              <img 
                                src={digimon.sprite_url} 
                                alt={digimon.name}
                                className="w-auto h-auto max-w-full max-h-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            </div>
                            <div className="text-xs mt-1">Lv.{digimon.current_level}</div>
                            {digimon.type && digimon.attribute && (
                              <div className="text-xs text-gray-500">
                                {digimon.type}/{digimon.attribute}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => {
                          // Set the selected option and immediately start the battle
                          handleStartBattle(option.id);
                        }}
                        disabled={loading || dailyBattlesRemaining <= 0 || teamDigimon.length < 2}
                        className={`btn-primary w-full ${
                          (dailyBattlesRemaining <= 0 || teamDigimon.length < 2) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {loading ? "Starting..." : 
                         dailyBattlesRemaining <= 0 ? "No remaining battles" : teamDigimon.length < 2 ? "Need 2+ Team Members" : "Battle!"}
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Informational footer */}
                <div className="text-center text-sm text-gray-500 mt-2 border-t pt-3">
                  <p>Battles reward all your digimon with experience. Battle options refresh after each battle.</p>
                  <p>Coming soon: Harder battles will reward more experience.</p>
                </div>
                
                {battleOptions.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No battle options available. Try refreshing or adding more Digimon to your team.</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Team and History Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Your Team</h2>
              <DigimonTeamManager />
            </div>
            
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Battle History</h2>
              <BattleHistory 
                teamBattles={teamBattleHistory} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Battle;