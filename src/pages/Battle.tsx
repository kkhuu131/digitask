import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useBattleStore, DigimonAttribute, DigimonType } from "../store/battleStore";
import { useInteractiveBattleStore } from "../store/interactiveBattleStore";
import { useTaskStore } from "../store/taskStore";
import { useCurrencyStore } from "../store/currencyStore";
import { supabase } from "../lib/supabase";
import BattleHistory from "../components/BattleHistory";
// import TeamBattleAnimation from "../components/TeamBattleAnimation"; // Removed - using interactive battles only
import InteractiveBattle from "../components/InteractiveBattle";
import DigimonTeamManager from "../components/DigimonTeamManager";
import { useAuthStore } from "../store/authStore";
import TypeAttributeIcon from "../components/TypeAttributeIcon";
import PageTutorial from "../components/PageTutorial";
import { DialogueStep } from "../components/DigimonDialogue";
import DigimonSprite from "@/components/DigimonSprite";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { Tab } from '@headlessui/react';

const Battle = () => {
  const { userDigimon, digimonData, allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const { 
    battleOptions,
    getBattleOptions,
    teamBattleHistory,
    loading, 
    error
  } = useBattleStore();
  const { 
    isBattleActive: isInteractiveBattleActive,
    startInteractiveBattle,
    endBattle: endInteractiveBattle,
  } = useInteractiveBattleStore();
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
    
    // Daily battle limit removed; energy system in effect
  }, [user?.id]); // Add user ID as a dependency
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  // Removed auto battle animation logic - using interactive battles only

  useEffect(() => {
    const loadBattleData = async () => {
      await useBattleStore.getState().fetchTeamBattleHistory();
    };
    loadBattleData();
  }, []);

  // Energy read for gating UI
  const [energy, setEnergy] = useState<{ current: number; max: number }>({ current: 0, max: 100 });
  useEffect(() => {
    const fetchEnergy = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_energy, max_battle_energy')
        .eq('id', userData.user.id)
        .single();
      if (profile) setEnergy({ current: profile.battle_energy ?? 0, max: profile.max_battle_energy ?? 100 });
    };
    fetchEnergy();
    const onEnergyUpdated = () => fetchEnergy();
    window.addEventListener('energy-updated', onEnergyUpdated);
    return () => window.removeEventListener('energy-updated', onEnergyUpdated);
  }, []);

  const handleStartBattle = async (optionId: string) => {
    // Prevent multiple clicks while loading (either global or local loading state)
    if (!optionId || loading || localLoading) return;
    
    try {
      setLocalLoading(true); // Set local loading state immediately
      setSelectedOption(optionId);
      
      // Spend energy upfront for interactive battle (20⚡)
      try {
        const { data: spentOk } = await supabase.rpc('spend_energy_self', { p_amount: 20 });
        if (!spentOk) {
          alert('Not enough Battle Energy (20⚡)');
          setLocalLoading(false);
          return;
        }
        try { window.dispatchEvent(new Event('energy-updated')); } catch {}
      } catch (e) {
        console.error('spend_energy_self(20) failed (interactive):', e);
        setLocalLoading(false);
        return;
      }

      // Start interactive battle
      const option = battleOptions.find(opt => opt.id === optionId);
      if (option) {
        const userTeamData = teamDigimon.map(d => ({
          ...d,
          digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id as keyof typeof DIGIMON_LOOKUP_TABLE],
        }));
        const opponentTeamData = option.team.digimon.map((d: any) => ({
          ...d,
          digimon_id: d.digimon_id || d.id,
          digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id || d.id as keyof typeof DIGIMON_LOOKUP_TABLE],
        }));
        
        console.log('Starting interactive battle with:', {
          userTeamData: userTeamData.map(d => ({ 
            id: d.id, 
            name: d.name, 
            digimon_id: d.digimon_id, 
            hasDigimon: !!d.digimon,
            digimonName: d.digimon?.name,
            fullData: d
          })),
          opponentTeamData: opponentTeamData.map(d => ({ 
            id: d.id, 
            name: d.name, 
            digimon_id: d.digimon_id, 
            hasDigimon: !!d.digimon,
            digimonName: d.digimon?.name,
            fullData: d
          }))
        });
        
        await startInteractiveBattle(userTeamData, opponentTeamData);
      }
    } finally {
      setLocalLoading(false); // Reset local loading state when done
    }
  };

  const handleInteractiveBattleComplete = async (result: { winner: 'user' | 'opponent'; turns: any[]; userDigimon?: any[] }) => {
    console.log('Interactive battle complete:', result);
    
    try {
      // Get the current battle option to determine difficulty and XP rewards
      const currentOption = battleOptions.find(opt => opt.id === selectedOption);
      if (!currentOption) {
        console.error('No current battle option found');
        endInteractiveBattle();
        return;
      }

      console.log('Found current option:', currentOption);

      // Calculate XP rewards similar to auto battle
      const BASE_XP_GAIN = {
        easy: 30,
        medium: 50,
        hard: 70,
      };

      const expModifier = 0.025;
      
      // Calculate opponent team average level (we need to get this from the battle data)
      // For now, we'll use a simplified calculation
      const opponentLevel = 25; // Default level, could be improved by passing this data
      const userLevel = teamDigimon.reduce((sum, d) => sum + d.current_level, 0) / teamDigimon.length;
      
      let xpGain = BASE_XP_GAIN[currentOption.difficulty] * (1 + expModifier * (opponentLevel - userLevel));
      
      // Reduce XP for losses
      if (result.winner !== 'user') xpGain *= 0.12;
      
      xpGain = Math.max(xpGain, 20);
      xpGain = Math.floor(xpGain);

      // Get the XP multiplier from taskStore
      const expMultiplier = useTaskStore.getState().getExpMultiplier();
      xpGain = Math.round(xpGain * expMultiplier);

      console.log('Calculated XP gain:', xpGain);

      // Apply XP to all Digimon - use the same method as auto battles
      console.log('About to apply XP rewards...');
      
      // Use the same XP application method as auto battles to avoid issues
      try {
        await useDigimonStore.getState().feedAllDigimon(xpGain);
        console.log('XP rewards applied successfully');
      } catch (error) {
        console.error('Error applying XP rewards:', error);
        // Continue with battle completion even if XP fails
      }

      // Award bits based on difficulty and outcome (same logic as auto battles)
      const calculateBitsReward = (difficulty: string, playerWon: boolean): number => {
        if (playerWon) {
          switch (difficulty) {
            case "hard": return 200;
            case "medium": return 100;
            case "easy": return 75;
            default: return 75;
          }
        } else {
          switch (difficulty) {
            case "hard": return 40;
            case "medium": return 50;
            case "easy": return 50;
            default: return 50;
          }
        }
      };

      const bitsReward = calculateBitsReward(currentOption.difficulty, result.winner === 'user');
      if (bitsReward > 0) {
        // Add the bits to the player's currency
        const currencyStore = useCurrencyStore.getState();
        currencyStore.addCurrency("bits", bitsReward);
        console.log(`Bits reward applied: ${bitsReward}`);
      }

      // End the interactive battle
      console.log('Ending interactive battle...');
      endInteractiveBattle();
      
      // Refresh data (same as auto battle)
      console.log('Refreshing data...');
      fetchAllUserDigimon();
      useBattleStore.getState().fetchTeamBattleHistory();
      
      // Force refresh battle options immediately
      console.log('Refreshing battle options...');
      getBattleOptions(true);
      setSelectedOption(null);
      
      console.log('Interactive battle completion finished successfully');
    } catch (error) {
      console.error('Error in handleInteractiveBattleComplete:', error);
      // Still try to end the battle even if there's an error
      endInteractiveBattle();
    }
  };

  // Removed auto battle completion handler - using interactive battles only

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
    { name: 'Arena', component: 'arena' },
    { name: 'History', component: 'history' }
  ];

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold dark:text-gray-100">Battle</h1>
        {/* <BattleSpeedControl /> */}
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
      {isInteractiveBattleActive ? (
            <InteractiveBattle
              onBattleComplete={handleInteractiveBattleComplete}
              userDigimon={teamDigimon}
              battleOption={battleOptions.find(opt => opt.id === selectedOption)}
              showRewards={true}
            />
          ) : (
              <div>

                {/* Battle Options Main Content */}
                <div className="lg:col-span-2 order-1 lg:order-2">
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
                    {loading ? "Refreshing..." : "♻️"}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                    ⚡ {energy.current}/{energy.max}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-accent-900/20 border border-indigo-200 dark:border-accent-700 text-xs sm:text-sm text-indigo-700 dark:text-accent-300">
                    20⚡
                  </span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                  {battleOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`rounded-lg p-2 sm:p-4 transition-colors ${
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
                      
                      <div className="flex justify-center items-center gap-2 sm:gap-3 mb-2 sm:mb-3 min-h-[64px]">
                        {option.team.digimon.map((digimon) => (
                          <div key={`${digimon.id}-${digimon.name}`} className="flex flex-col items-center">
                            <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                              <DigimonSprite 
                                digimonName={digimon.name} 
                                fallbackSpriteUrl={digimon.sprite_url}
                                showHappinessAnimations={true}
                                size="sm" 
                              />
                              {/* Type/Attribute top-right */}
                              {digimon.type && digimon.attribute && (
                                <div className="absolute top-0 right-0">
                                  <TypeAttributeIcon
                                    type={digimon.type as DigimonType}
                                    attribute={digimon.attribute as DigimonAttribute}
                                    size="sm"
                                    showLabel={false}
                                  />
                                </div>
                              )}
                              {/* Level bottom-left */}
                              <span className="absolute bottom-0.5 left-0.5 text-[10px] font-bold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
                                {digimon.current_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleStartBattle(option.id)}
                        disabled={loading || localLoading || teamDigimon.length < 1 || energy.current < 20}
                        className={`w-full text-xs sm:text-sm py-1 sm:py-2 rounded-md font-semibold ${
                          (loading || localLoading || teamDigimon.length < 1 || energy.current < 20)
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                      >
                        {loading || localLoading ? "Starting..." : teamDigimon.length < 1 ? "Need team" : "20⚡"}
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
                                {/* Team Manager Sidebar */}
                                <div className="">
                  <div className="">
                    <DigimonTeamManager />
                  </div>
                </div>
              </div>
            )}
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