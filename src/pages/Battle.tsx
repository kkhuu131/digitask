import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore, DigimonAttribute, DigimonType } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";
import { useAuthStore } from "../store/authStore";
import TypeAttributeIcon from "../components/TypeAttributeIcon";
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
  const { user } = useAuthStore();

  useEffect(() => {
    // Fetch user's Digimon data whenever the component mounts or user changes
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
    
    // Also refresh the daily battle limit
    checkDailyBattleLimit();
  }, [user?.id]); // Add user ID as a dependency
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

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
    // Prevent multiple clicks while loading (either global or local loading state)
    if (!optionId || loading || localLoading) return;
    
    try {
      setLocalLoading(true); // Set local loading state immediately
      setSelectedOption(optionId);
      await selectAndStartBattle(optionId);
    } finally {
      setLocalLoading(false); // Reset local loading state when done
    }
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
                {/* Refresh button - only visible in development environment */}
                {import.meta.env.DEV && (
                  <button
                    onClick={() => getBattleOptions(true)}
                    className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Refreshing..." : "Refresh Options"}
                  </button>
                )}
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
                      className={`border rounded-lg p-2 sm:p-4 transition-colors ${
                        selectedOption === option.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
                          option.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          option.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {option.difficulty.charAt(0).toUpperCase() + option.difficulty.slice(1)}
                        </span>
                        
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {option.isWild ? 'Wild Digimon' : option.team.display_name || option.team.username}
                        </span>
                      </div>
                      
                      <div className="flex justify-center items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3 min-h-[60px] sm:min-h-[80px]">
                        {option.team.digimon.map(digimon => (
                          <div key={digimon.id} className="text-center flex-1 flex flex-col items-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative group">
                              <img 
                                src={digimon.sprite_url} 
                                alt={digimon.name}
                                className="w-auto h-auto max-w-full max-h-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                {digimon.name}
                              </div>
                            </div>
            
                            {digimon.type && digimon.attribute && (
                              <div className="text-[10px] sm:text-xs text-gray-500">
                                <div className="flex justify-center mb-1">
                                  <TypeAttributeIcon
                                    type={digimon.type as DigimonType}
                                    attribute={digimon.attribute as DigimonAttribute}
                                    size="sm"
                                    showLabel={false}
                                  />
                                </div>
                                <span className="hidden sm:inline relative group cursor-help font-medium">
                                  {digimon.type}
                                  {/* Type advantage tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                                    <div className="font-bold mb-1 text-center">Type Advantages</div>
                                    <div className="grid grid-cols-2 gap-1 text-center">
                                      <div className="text-green-400">Strong vs:</div>
                                      <div>{digimon.type === 'Vaccine' ? 'Virus' : digimon.type === 'Virus' ? 'Data' : digimon.type === 'Data' ? 'Vaccine' : 'None'}</div>
                                      <div className="text-red-400">Weak vs:</div>
                                      <div>{digimon.type === 'Vaccine' ? 'Data' : digimon.type === 'Virus' ? 'Vaccine' : digimon.type === 'Data' ? 'Virus' : 'None'}</div>
                                    </div>
                                  </div>
                                </span>
                                <span className="hidden sm:inline">/</span>
                                <span className="hidden sm:inline relative group cursor-help font-medium">
                                  {digimon.attribute}
                                  {/* Attribute advantage tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                                    <div className="font-bold mb-1 text-center">Attribute Advantages</div>
                                    <div className="grid grid-cols-2 gap-1 text-center">
                                      <div className="text-green-400">Strong vs:</div>
                                      <div>
                                        {digimon.attribute === 'Fire' ? 'Plant' : 
                                         digimon.attribute === 'Water' ? 'Fire' : 
                                         digimon.attribute === 'Plant' ? 'Water' : 
                                         digimon.attribute === 'Electric' ? 'Wind' : 
                                         digimon.attribute === 'Wind' ? 'Earth' : 
                                         digimon.attribute === 'Earth' ? 'Electric' : 
                                         digimon.attribute === 'Light' ? 'Dark' : 
                                         digimon.attribute === 'Dark' ? 'Light' : 'None'}
                                      </div>
                                      <div className="text-red-400">Weak vs:</div>
                                      <div>
                                        {digimon.attribute === 'Fire' ? 'Water' : 
                                         digimon.attribute === 'Water' ? 'Plant' : 
                                         digimon.attribute === 'Plant' ? 'Fire' : 
                                         digimon.attribute === 'Electric' ? 'Earth' : 
                                         digimon.attribute === 'Wind' ? 'Electric' : 
                                         digimon.attribute === 'Earth' ? 'Wind' : 
                                         digimon.attribute === 'Light' ? 'Dark' : 
                                         digimon.attribute === 'Dark' ? 'Light' : 'None'}
                                      </div>
                                    </div>
                                    {digimon.attribute === 'Neutral' && (
                                      <div className="mt-1 text-center">Neutral has no advantages or disadvantages</div>
                                    )}
                                  </div>
                                </span>
                              </div>
                            )}
                            <div className="text-[10px] sm:text-xs mt-1">Lv.{digimon.current_level}</div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleStartBattle(option.id)}
                        disabled={loading || localLoading || dailyBattlesRemaining <= 0 || teamDigimon.length < 1}
                        className={`btn-primary w-full text-xs sm:text-sm py-1 sm:py-2 ${
                          (loading || localLoading || dailyBattlesRemaining <= 0 || teamDigimon.length < 1) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {loading || localLoading ? "Starting..." : 
                         dailyBattlesRemaining <= 0 ? "No battles" : teamDigimon.length < 1 ? "Need team" : "Battle!"}
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Informational footer */}
                <div className="text-center text-sm text-gray-500 mt-2 border-t pt-3">
                  <p>Battles reward all your digimon with experience. Battle options refresh after each battle.</p>
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