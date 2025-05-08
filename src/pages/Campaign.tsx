import React, { useEffect, useState } from "react";
import { CAMPAIGN_OPPONENTS } from "../constants/campaignOpponents";
import { DigimonAttribute, DigimonType, useBattleStore } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";
import TeamBattleAnimation from "../components/TeamBattleAnimation";
import DigimonTeamManager from "../components/DigimonTeamManager";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import TypeAttributeIcon from "@/components/TypeAttributeIcon";

const Campaign: React.FC = () => {
  const { allUserDigimon, fetchAllUserDigimon } = useDigimonStore();
  const {
    currentTeamBattle,
    clearCurrentTeamBattle,
  } = useBattleStore();

  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const teamDigimon = allUserDigimon.filter(d => d.is_on_team);

  // Function to start a campaign battle
  const handleStartBattle = async (opponentIndex: number) => {
    if (teamDigimon.length === 0) {
      alert("You need at least one Digimon on your team to battle!");
      return;
    }
    
    try {
      // Prepare user team data
      const userTeamData = teamDigimon.map(d => ({
        ...d,
        digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id],
      }));
      
      // Get opponent data
      const opponent = CAMPAIGN_OPPONENTS[opponentIndex];
      
      // Simulate the battle directly using the battle store's internal function
      const battleResult = await useBattleStore.getState().simulateCampaignBattle(
        userTeamData,
        opponent.team
      );
      
      // Set the current battle in the store
      useBattleStore.setState({
        currentTeamBattle: battleResult
      });
      
      // Show battle animation
      setShowBattleAnimation(true);
    } catch (error) {
      console.error("Error starting campaign battle:", error);
      alert("Failed to start battle. Please try again.");
    }
  };

  // Handle battle completion
  const handleBattleComplete = () => {
    setShowBattleAnimation(false);
    clearCurrentTeamBattle();
    
    // Refresh all user Digimon data to update XP and levels in the UI
    fetchAllUserDigimon();
  };

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Campaign</h1>
      <p className="mb-8 text-gray-600">
            Battle against these teams to progress through the campaign and earn titles.
          </p>
      
      {/* Show battle animation when a battle is in progress */}
      {showBattleAnimation && currentTeamBattle && (
        <TeamBattleAnimation 
          teamBattle={currentTeamBattle} 
          onComplete={handleBattleComplete} 
        />
      )}

      <div className="flex gap-8">
        {/* Left column - Team Manager */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Team</h2>
            <DigimonTeamManager />
          </div>
        </div>

        {/* Right column - Campaign Battles */}
        <div className="w-1/2">
          <div className="space-y-8">
            {CAMPAIGN_OPPONENTS.map((opponent, index) => (
              <div key={opponent.profile.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{opponent.profile.display_name}</h2>
                    <p className="text-sm text-gray-500">Stage {index + 1}</p>
                  </div>
                  <button 
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={() => handleStartBattle(index)}
                    disabled={teamDigimon.length === 0}
                  >
                    Battle
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3">Team</h3>
                  <div className="flex flex-wrap gap-4">
                    {opponent.team.map((member) => (
                      <div key={member.id} className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src={member.digimon.sprite_url} 
                            alt={member.digimon.name}
                            className="w-16 h-16 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{member.digimon.name}</p>
                          <div className="flex justify-center gap-2 my-1">
                            <TypeAttributeIcon type={member.digimon.type as DigimonType} attribute={member.digimon.attribute as DigimonAttribute} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500">Lv. {member.current_level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaign; 