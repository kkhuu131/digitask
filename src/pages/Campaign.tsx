import React, { useEffect, useState, useRef } from "react";
import { CAMPAIGN_OPPONENTS, getBaseStage, isStageUnlocked, getArcForStage } from "../constants/campaignOpponents";
import { DigimonAttribute, DigimonType } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";
import { useInteractiveBattleStore } from "../store/interactiveBattleStore";
import InteractiveBattle from "../components/InteractiveBattle";
import DigimonTeamManager from "../components/DigimonTeamManager";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import TypeAttributeIcon from "@/components/TypeAttributeIcon";
import { supabase } from "../lib/supabase";
import { useTitleStore } from "../store/titleStore";
import { useAuthStore } from "../store/authStore";
import PageTutorial from "../components/PageTutorial";
import { DialogueStep } from "../components/DigimonDialogue";
import DigimonSprite from "@/components/DigimonSprite";
import { calculateUserDigimonPowerRating } from "@/utils/digimonStatCalculation";
interface PreparationModalProps {
  opponent: typeof CAMPAIGN_OPPONENTS[0];
  isOpen: boolean;
  onClose: () => void;
  onStartBattle: () => void;
  isUnlocked: boolean;
  isPast: boolean;
  isBattleActive?: boolean;
  onBattleComplete?: (result: { winner: 'user' | 'opponent'; turns: any[]; userDigimon?: any[] }) => void;
  userDigimon?: any[];
}

const PreparationModal: React.FC<PreparationModalProps> = ({
  opponent,
  isOpen,
  onClose,
  onStartBattle,
  isUnlocked,
  isPast,
  isBattleActive = false,
  onBattleComplete,
  userDigimon = []
}) => {
  const { allUserDigimon } = useDigimonStore();
  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-300 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {isBattleActive ? (
          // Battle View
          <div className="h-full">
            {/* Battle Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-gray-100">{opponent.profile.display_name}</h2>
              <span className="text-md text-gray-500 dark:text-gray-400">Stage {opponent.id}</span>
            </div>
            
            <InteractiveBattle
              onBattleComplete={onBattleComplete || (() => {})}
              userDigimon={userDigimon}
              showRewards={false} // Campaign battles don't give rewards
            />
          </div>
        ) : (
          // Preparation View
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-gray-100">{opponent.profile.display_name}</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <h3 className="text-md text-gray-500 dark:text-gray-400 mb-4">Stage {opponent.id}</h3>

        {/* Opponent Team Section */}
        <div className="mb-4">
          <div className="flex gap-4 justify-center p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
            {opponent.team.map((member) => (
              <div key={member.id} className="text-center flex flex-col items-center">
                <DigimonSprite
                  digimonName={member.digimon.name}
                  fallbackSpriteUrl={member.digimon.sprite_url}
                  size="sm"
                />
                <div className="mt-2 flex justify-center">
                  <TypeAttributeIcon
                    type={member.digimon.type as DigimonType}
                    attribute={member.digimon.attribute as DigimonAttribute}
                    size="sm"
                    showTooltip={true}
                  />
                </div>
                <p className="text-sm mt-1 dark:text-gray-200">{member.digimon.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Lv. {member.current_level}</p>
              </div>
            ))}
          </div>
        </div>

        {opponent.description && (
          <div className="mb-4">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400"><i>{opponent.description}</i></p>
          </div>
        )}

        {/* Battle Button */}
        <div className="flex justify-center">
          <button
            onClick={onStartBattle}
            disabled={(!isUnlocked || teamDigimon.length === 0)}
            className={`
              px-4 py-2 rounded-lg text-white font-semibold
              ${(isUnlocked && teamDigimon.length > 0)
                ? 'bg-blue-500 dark:bg-accent-600 hover:bg-blue-600 dark:hover:bg-accent-700'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {teamDigimon.length === 0
              ? "Add Digimon to Team"
              : !isUnlocked
              ? "Stage Locked"
              : isPast
              ? "Rematch"
              : "Start Battle"}
          </button>
        </div>

            {/* Team Manager Section */}
            <div className="mt-4 mb-8">
              <DigimonTeamManager />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// First, add a helper function to calculate the power level of a campaign team
const calculateCampaignTeamPower = (team: any[]) => {
  const avgPower = team.reduce((total, digimon) => {
    if (!digimon.digimon) return total;
    return total + calculateUserDigimonPowerRating(
      digimon
    );
  }, 0) / team.length;
  
  // If team size is 1, return 1/2 of power, if 2 return 2/3, otherwise full average
  if (team.length === 1) {
    return avgPower / 2;
  } else if (team.length === 2) {
    return (avgPower * 2) / 3;
  } else {
    return avgPower;
  }
};

const CampaignNode: React.FC<{
  stage: typeof CAMPAIGN_OPPONENTS[0];
  isUnlocked: boolean;
  isNext: boolean;
  isPast: boolean;
  onClick: () => void;
}> = ({ stage, isUnlocked, isNext, isPast, onClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth < 640);

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <button
      data-stage={getBaseStage(stage.id)}
      onClick={onClick}
      disabled={!isUnlocked}
      className={`
        relative w-[4.25rem] sm:w-40 rounded-lg p-1 sm:p-4 transition-all text-xs sm:text-base
        ${isUnlocked ? 'bg-white dark:bg-dark-200 shadow-md hover:shadow-lg dark:shadow-dark-100' : 'bg-gray-100 dark:bg-dark-400'}
        ${isNext ? 'ring-2 ring-green-500 dark:ring-green-600' : ''}
        ${isPast ? 'opacity-50' : ''}
        ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <h3 className="font-bold text-[8px] sm:text-[14px] truncate max-w-[70%] dark:text-gray-200">
          {isUnlocked ? stage.profile.display_name : "???"}
        </h3>
        <span className="text-[8px] sm:text-[14px] text-gray-500 dark:text-gray-400">
          {stage.id}
        </span>
      </div>
      
      
      <div className="flex gap-0.5 sm:gap-4 justify-center">
        {stage.team.map((member) => (
          <div 
            key={member.id}
            className="flex flex-col items-center w-6 sm:w-12"
          >
            <div className="block sm:hidden">
              <DigimonSprite
                digimonName={member.digimon.name}
                fallbackSpriteUrl={member.digimon.sprite_url}
                showHappinessAnimations={false}
                size="xxs"
                silhouette={!isUnlocked}
              />
            </div>
            <div className="hidden sm:block">
              <DigimonSprite
                digimonName={member.digimon.name}
                fallbackSpriteUrl={member.digimon.sprite_url}
                showHappinessAnimations={false}
                size="xs"
                silhouette={!isUnlocked}
              />
            </div>
            <div className={`h-3 sm:h-6 flex justify-center items-center ${
              !isUnlocked ? 'mt-1 sm:mt-2' : 'mt-0.5 sm:mt-1'
            }`}>
              {isUnlocked ? (
                <TypeAttributeIcon 
                  size={isMobile ? "xs" : "sm"}
                  type={member.digimon.type as DigimonType} 
                  attribute={member.digimon.attribute as DigimonAttribute} 
                />
              ) : (
                <div className="w-3 h-3 sm:w-6 sm:h-6" />
              )}
            </div>
            <p className="text-[8px] sm:text-xs h-2 sm:h-4 flex items-center dark:text-gray-300">
              {isUnlocked ? `${member.current_level}` : "???"}
            </p>
          </div>
        ))}
      </div>
      <span className="text-[8px] sm:text-[14px] text-gray-500 dark:text-gray-400">
          Power: {Math.round(calculateCampaignTeamPower(stage.team))}
        </span>
    </button>
  );
};

const Campaign: React.FC = () => {
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const {
    isBattleActive: isInteractiveBattleActive,
    startInteractiveBattle,
    endBattle: endInteractiveBattle,
  } = useInteractiveBattleStore();
  const { checkCampaignTitles } = useTitleStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  useEffect(() => {
    const fetchHighestStageCleared = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("highest_stage_cleared")
          .eq("id", user.id)
          .single();
          
        if (!error && data) {
          setHighestStageCleared(data.highest_stage_cleared || 0);
        }
      }
    };
    
    fetchHighestStageCleared();
  }, [user]);

  const [highestStageCleared, setHighestStageCleared] = useState(0);
  const [selectedOpponentIndex, setSelectedOpponentIndex] = useState<number | null>(null);
  const [currentBattleStageId, setCurrentBattleStageId] = useState<string | null>(null);
  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);
  const gridRef = useRef<HTMLDivElement>(null);

  // Group stages by their base number
  const stagesByLevel = CAMPAIGN_OPPONENTS.reduce((acc, stage) => {
    const baseStage = getBaseStage(stage.id);
    if (!acc[baseStage]) acc[baseStage] = [];
    acc[baseStage].push(stage);
    return acc;
  }, {} as Record<number, typeof CAMPAIGN_OPPONENTS>);

  // Get all base stage numbers and sort them
  const stageLevels = Object.keys(stagesByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const handleStartBattle = async () => {
    if (selectedOpponentIndex === null) return;
    
    try {
      const userTeamData = teamDigimon.map(d => ({
        ...d,
        digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id],
      }));

      const opponent = CAMPAIGN_OPPONENTS[selectedOpponentIndex];

      // for each digimon in userTeamData, set its .current_level be to capped at the opponent.team's max level
      userTeamData.forEach(d => {
        d.current_level = Math.min(d.current_level, opponent.team.reduce((max, member) => Math.max(max, member.current_level), 0) + 5);
      });
      
      // Store the current battle stage ID as a string
      setCurrentBattleStageId(opponent.id);
      
      // Start interactive battle
      await startInteractiveBattle(userTeamData, opponent.team);
      
      // Modal stays open to show battle
    } catch (error) {
      console.error("Error starting campaign battle:", error);
      alert("Failed to start battle. Please try again.");
    }
  };

  const handleInteractiveBattleComplete = async (result: { winner: 'user' | 'opponent'; turns: any[]; userDigimon?: any[] }) => {
    console.log('Campaign battle complete:', result);
    
    // End the interactive battle
    endInteractiveBattle();
    
    // If battle was won and we have a current battle stage ID
    if (result.winner === 'user' && currentBattleStageId !== null) {
      const baseStage = getBaseStage(currentBattleStageId);
      
      if (baseStage > highestStageCleared) {
        // Update highest stage cleared in database
        await supabase
          .from('profiles')
          .update({ highest_stage_cleared: baseStage })
          .eq('id', user?.id || '');
        
        console.log("baseStage", baseStage);
        // Check for new titles
        await checkCampaignTitles(baseStage);
        
        // Update local state
        setHighestStageCleared(baseStage);
      }
    }
    
    // Clear the current battle stage ID and close the modal
    setCurrentBattleStageId(null);
    setSelectedOpponentIndex(null);
    
    // Refresh Digimon data
    fetchAllUserDigimon();
  };

  const scrollToCurrentStage = () => {
    if (!gridRef.current) return;
    
    // Find the element for the next stage
    const nextStageElement = gridRef.current.querySelector(`[data-stage="${highestStageCleared + 1}"]`);
    if (nextStageElement) {
      nextStageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const campaignPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to the Campaign! Here you can travel to the Digital World and battle against predetermined teams of Digimon to progress through the story and earn titles."
    },
    {
      speaker: 'neemon',
      text: "Oh, that Digimon doesn't look too tough. I'm sure you can take it down with your team!"
    },
    {
      speaker: 'bokomon',
      text: "Your journey may start easy, but as you progress, the challenges will become tougher. I hear there's a Digimon that's been causing trouble in the Digital World. I hope you're up for the challenge!"
    },
    {
      speaker: 'both',
      text: "Good luck, Tamer!"
    }
  ];

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">Campaign</h1>
      
      {/* Add the speed control near the top */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Battle against these teams to progress and earn titles. Levels will be capped at the opponent's max level + 5.
        </p>
      </div>
      
      {/* Campaign Map */}
      <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md dark:shadow-lg p-6 dark:border dark:border-dark-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-gray-100">Digital World</h2>
          <button
            onClick={scrollToCurrentStage}
            className="px-4 py-2 bg-blue-500 dark:bg-accent-600 hover:bg-blue-600 dark:hover:bg-accent-700 text-white rounded-lg text-sm"
          >
            Go to Stage {highestStageCleared + 1}
          </button>
        </div>
        
        {/* Scrollable container */}
        <div 
          ref={gridRef}
          className="h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-dark-200"
        >
          <div className="relative py-8">
            {stageLevels.map(level => {
              // Get the first stage in this level to determine if we need to show an arc title
              const firstStageInLevel = stagesByLevel[level][0];
              const arc = getArcForStage(firstStageInLevel.id);
              const isFirstStageInArc = arc && arc.startStage === getBaseStage(firstStageInLevel.id);
              
              return (
                <div key={`level-${level}`} className="relative mb-16">
                  {/* Arc Title - only show if this is the first level containing stages from this arc */}
                  {isFirstStageInArc && (
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{arc.title}</h2>
                      {arc.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{arc.description}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-center px-[10%] sm:px-4">
                    <div className="flex gap-2 sm:gap-8">
                      {stagesByLevel[level].map((stage, stageIndex) => {
                        const isUnlocked = isStageUnlocked(stage.id, highestStageCleared);
                        const isNext = getBaseStage(stage.id) === highestStageCleared + 1;
                        const isPast = getBaseStage(stage.id) <= highestStageCleared;

                        return (
                          <div key={`stage-${stage.id}-${stageIndex}`} className="relative">
                            <CampaignNode
                              stage={stage}
                              isUnlocked={isUnlocked}
                              isNext={isNext}
                              isPast={isPast}
                              onClick={() => isUnlocked ? 
                                setSelectedOpponentIndex(CAMPAIGN_OPPONENTS.indexOf(stage)) : 
                                null
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preparation Modal */}
      {selectedOpponentIndex !== null && (
        <PreparationModal
          opponent={CAMPAIGN_OPPONENTS[selectedOpponentIndex]}
          isOpen={true}
          onClose={() => setSelectedOpponentIndex(null)}
          onStartBattle={handleStartBattle}
          isUnlocked={isStageUnlocked(CAMPAIGN_OPPONENTS[selectedOpponentIndex].id, highestStageCleared)}
          isPast={getBaseStage(CAMPAIGN_OPPONENTS[selectedOpponentIndex].id) <= highestStageCleared}
          isBattleActive={isInteractiveBattleActive}
          onBattleComplete={handleInteractiveBattleComplete}
          userDigimon={teamDigimon}
        />
      )}

      {/* Interactive Battle is now handled inside the modal */}
    </div>
    <PageTutorial tutorialId="campaign_intro" steps={campaignPageTutorialSteps} />
    </>
  );
};

export default Campaign; 