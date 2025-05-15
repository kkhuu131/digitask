import React, { useEffect, useState, useRef } from "react";
import { CAMPAIGN_OPPONENTS, getBaseStage, isStageUnlocked, getArcForStage } from "../constants/campaignOpponents";
import { DigimonAttribute, DigimonType, useBattleStore } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import TypeAttributeIcon from "@/components/TypeAttributeIcon";
import { supabase } from "../lib/supabase";
import { useTitleStore } from "../store/titleStore";
import { useAuthStore } from "../store/authStore";
import BattleSpeedControl from "../components/BattleSpeedControl";

interface PreparationModalProps {
  opponent: typeof CAMPAIGN_OPPONENTS[0];
  isOpen: boolean;
  onClose: () => void;
  onStartBattle: () => void;
  isUnlocked: boolean;
  isPast: boolean;
}

const PreparationModal: React.FC<PreparationModalProps> = ({
  opponent,
  isOpen,
  onClose,
  onStartBattle,
  isUnlocked,
  isPast
}) => {
  const { allUserDigimon } = useDigimonStore();
  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{opponent.profile.display_name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <h3 className="text-md text-gray-500 mb-4">Stage {opponent.id}</h3>

        {/* Opponent Team Section */}
        <div className="mb-4">
          <div className="flex gap-4 justify-center p-4 bg-gray-50 rounded-lg">
            {opponent.team.map((member) => (
              <div key={member.id} className="text-center">
                <img
                  src={member.digimon.sprite_url}
                  alt={member.name || member.digimon.name}
                  className="w-16 h-16 mx-auto"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="mt-2 flex justify-center">
                  <TypeAttributeIcon
                    type={member.digimon.type as DigimonType}
                    attribute={member.digimon.attribute as DigimonAttribute}
                    size="sm"
                  />
                </div>
                <p className="text-sm mt-1">{member.digimon.name}</p>
                <p className="text-xs text-gray-600">Lv. {member.current_level}</p>
              </div>
            ))}
          </div>
        </div>

        {opponent.description && (
          <div className="mb-4">
            <p className="text-sm text-center text-gray-600"><i>{opponent.description}</i></p>
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
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
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
        <div className="mb-8">
          <DigimonTeamManager />
        </div>
      </div>
    </div>
  );
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
        ${isUnlocked ? 'bg-white shadow-md hover:shadow-lg' : 'bg-gray-100'}
        ${isNext ? 'ring-2 ring-green-500' : ''}
        ${isPast ? 'opacity-50' : ''}
        ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <h3 className="font-bold text-[8px] sm:text-[14px] truncate max-w-[70%]">
          {isUnlocked ? stage.profile.display_name : "???"}
        </h3>
        <span className="text-[8px] sm:text-[14px] text-gray-500">
          {stage.id}
        </span>
      </div>
      
      <div className="flex gap-0.5 sm:gap-4 justify-center">
        {stage.team.map((member) => (
          <div 
            key={member.id}
            className="flex flex-col items-center w-6 sm:w-12"
          >
            <img
              src={member.digimon.sprite_url}
              alt={member.digimon.name}
              draggable="false"
              className={`w-4 h-4 sm:w-8 sm:h-8 select-none ${
                !isUnlocked ? 'brightness-0' : ''
              }`}
              style={{ imageRendering: "pixelated" }}
            />
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
            <p className="text-[8px] sm:text-xs h-2 sm:h-4 flex items-center">
              {isUnlocked ? `${member.current_level}` : "???"}
            </p>
          </div>
        ))}
      </div>
    </button>
  );
};

const Campaign: React.FC = () => {
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const {
    currentTeamBattle,
    clearCurrentTeamBattle,
  } = useBattleStore();
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

  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
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
      
      const battleResult = await useBattleStore.getState().simulateCampaignBattle(
        userTeamData,
        opponent.team,
        opponent.hint,
        opponent.description
      );
      
      useBattleStore.setState({
        currentTeamBattle: battleResult
      });
      
      setSelectedOpponentIndex(null); // Close modal
      setShowBattleAnimation(true);
    } catch (error) {
      console.error("Error starting campaign battle:", error);
      alert("Failed to start battle. Please try again.");
    }
  };

  const handleBattleComplete = async () => {
    setShowBattleAnimation(false);
    clearCurrentTeamBattle();
    
    // If battle was won and we have a current battle stage ID
    if (currentTeamBattle?.winner_id === user?.id && currentBattleStageId !== null) {
      // No need to convert to string since we're already storing it as a string
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
    
    // Clear the current battle stage ID
    setCurrentBattleStageId(null);
    
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Campaign</h1>
      
      {/* Add the speed control near the top */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Battle against these teams to progress through the campaign and earn titles. Digimon levels will be capped at the opponent's max level + 5.
        </p>
        <BattleSpeedControl />
      </div>
      
      {/* Campaign Map */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Digital World</h2>
          <button
            onClick={scrollToCurrentStage}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
          >
            Go to Current Stage
          </button>
        </div>
        
        {/* Scrollable container */}
        <div 
          ref={gridRef}
          className="h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
                      <h2 className="text-2xl font-bold text-indigo-700">{arc.title}</h2>
                      {arc.description && (
                        <p className="text-sm text-gray-600 mt-1">{arc.description}</p>
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
        />
      )}

      {/* Battle Animation */}
      {showBattleAnimation && currentTeamBattle && (
        <TeamBattleAnimation
          teamBattle={currentTeamBattle}
          onComplete={handleBattleComplete}
        />
      )}
    </div>
  );
};

export default Campaign; 