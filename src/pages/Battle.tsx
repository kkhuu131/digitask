import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore, DigimonAttribute, DigimonType } from "../store/battleStore";
import BattleHistory from "../components/BattleHistory";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";
import WeeklyBossRaid from "../components/WeeklyBossRaid";
import { useAuthStore } from "../store/authStore";
import TypeAttributeIcon from "../components/TypeAttributeIcon";
import BattleSpeedControl from "../components/BattleSpeedControl";
import PageTutorial from "../components/PageTutorial";
import { DialogueStep } from "../components/DigimonDialogue";
import DigimonSprite from "@/components/DigimonSprite";
import { Tab } from '@headlessui/react';

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
  const [selectedTab, setSelectedTab] = useState(0);

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

  const digimonPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to the Battle Arena! Here you can battle against other players' teams and wild Digimon to earn experience and level up your team."
    },
    {
      speaker: 'neemon',
      text: "Ooh, some of these Digimon look pretty tough!"
    },
    {
      speaker: 'bokomon',
      text: "You can choose from three teams of varying difficulty. However, the more difficult the team, the more experience you'll earn!"
    },
    {
      speaker: 'neemon',
      text: "W-wait, what happens if we lose?"
    },
    {
      speaker: 'bokomon',
      text: "There's no need to worry! Your Digimon won't die, they just won't earn nearly as much experience."
    },
    {
      speaker: 'neemon',
      text: "In that case, we should probably choose and prep our team carefully!"
    },
    {
      speaker: 'bokomon',
      text: "Yes, Digimon have a Type and an Attribute. These will increase or decrease your damage output."
    },
    {
      speaker: 'bokomon',
      text: "Hover over the Type/Attribute text to see the advantages and disadvantages."
    },
    {
      speaker: 'both',
      text: "Good luck, Tamer!"
    }
  ];

  if (!userDigimon || !digimonData) {
    return (
      <div className="text-center py-12">
        <p>Loading your Digimon...</p>
      </div>
    );
  }

  const tabs = [
    { name: 'Arena Battle', component: 'arena' },
    { name: 'Weekly Boss', component: 'boss' },
    { name: 'Team Manager', component: 'team' },
    { name: 'Battle History', component: 'history' }
  ];

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold dark:text-gray-100">Battle Arena</h1>
        <BattleSpeedControl />
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? 'bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-blue-400'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels>
          {/* Arena Battle Tab */}
          <Tab.Panel>
            {showBattleAnimation ? (
              currentTeamBattle ? (
                <TeamBattleAnimation 
                  teamBattle={currentTeamBattle}
                  onComplete={handleBattleComplete} 
                />
              ) : null
            ) : (
              <div className="space-y-6">
                {/* Battle Options Section */}
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-gray-100">Choose Opponent</h2>
                  
                    <div className="flex items-center space-x-4">
                      {/* Refresh button - only visible in development environment */}
                      {import.meta.env.DEV && (
                        <button
                          onClick={() => getBattleOptions(true)}
                          className="text-sm px-3 py-1 bg-gray-200 dark:bg-dark-200 hover:bg-gray-300 dark:hover:bg-dark-100 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Refreshing..." : "Refresh Options"}
                        </button>
                      )}
                      <div className="text-xs sm:text-base dark:text-gray-200">
                      <span className="font-medium dark:text-gray-200">Daily Battles:</span> {dailyBattlesRemaining} left
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-amber-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {battleOptions.map((option) => (
                          <div 
                            key={option.id}
                            className={`border rounded-lg p-2 sm:p-4 transition-colors ${
                              selectedOption === option.id 
                                ? 'border-primary-500 dark:border-amber-500 bg-primary-50 dark:bg-amber-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
                                option.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                option.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              }`}>
                                {option.difficulty.charAt(0).toUpperCase() + option.difficulty.slice(1)}
                              </span>
                              
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                {option.isWild ? 'Wild Digimon' : option.team.display_name || option.team.username}
                              </span>
                            </div>
                            
                            <div className="flex justify-center items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3 min-h-[60px] sm:min-h-[80px]">
                              {option.team.digimon.map((digimon) => (
                                <div key={`${digimon.id}-${digimon.name}`} className="text-center flex-1 flex flex-col items-center">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative group">
                                    <div className="hidden sm:block">
                                      <DigimonSprite 
                                        digimonName={digimon.name} 
                                        fallbackSpriteUrl={digimon.sprite_url}
                                        showHappinessAnimations={false}
                                        size="sm" 
                                      />
                                    </div>
                                    <div className="block sm:hidden">
                                      <DigimonSprite 
                                        digimonName={digimon.name} 
                                        fallbackSpriteUrl={digimon.sprite_url} 
                                        size="xs" 
                                        showHappinessAnimations={false}
                                      />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                      {digimon.name}
                                    </div>
                                  </div>
                  
                                  {digimon.type && digimon.attribute && (
                                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                      <div className="flex justify-center mb-1">
                                        <TypeAttributeIcon
                                          type={digimon.type as DigimonType}
                                          attribute={digimon.attribute as DigimonAttribute}
                                          size="sm"
                                          showLabel={false}
                                          showTooltip={true}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-[10px] sm:text-xs mt-1 dark:text-gray-300">Lv.{digimon.current_level}</div>
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
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 border-t dark:border-gray-700 pt-3">
                        <p>Battles reward all your digimon with experience. Battle options refresh after each battle.</p>
                      </div>
                      
                      {battleOptions.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <p>No battle options available. Try adding more Digimon to your team and refresh the page.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </Tab.Panel>

          {/* Weekly Boss Tab */}
          <Tab.Panel>
            <WeeklyBossRaid />
          </Tab.Panel>

          {/* Team Manager Tab */}
          <Tab.Panel>
            <div className="card">
              <DigimonTeamManager />
            </div>
          </Tab.Panel>

          {/* Battle History Tab */}
          <Tab.Panel>
            <div className="card">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Battle History</h2>
              <BattleHistory 
                teamBattles={teamBattleHistory} 
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
    <PageTutorial tutorialId="battle_intro" steps={digimonPageTutorialSteps} />
    </>
  );
};

export default Battle; 