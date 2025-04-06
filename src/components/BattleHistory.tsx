import { Battle, TeamBattle } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";

interface BattleHistoryProps {
  battles?: Battle[];
  teamBattles?: TeamBattle[];
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ battles = [], teamBattles = [] }) => {
  const { getDigimonDisplayName } = useDigimonStore();
  const userDigimonDisplayName = getDigimonDisplayName();
  
  if (battles.length === 0 && teamBattles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No battle history yet. Queue for a battle to get started!
      </div>
    );
  }
  
  // Combine and sort all battles by date
  const allBattles = [
    ...battles.map(b => ({ ...b, type: 'single' as const })),
    ...teamBattles.map(b => ({ ...b, type: 'team' as const }))
  ].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return (
    <div className="space-y-4">
      {allBattles.map((battle) => {
        // Format the date
        const battleDate = new Date(battle.created_at);
        const formattedDate = battleDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        if (battle.type === 'single') {
          // Regular 1v1 battle
          const singleBattle = battle as Battle & { type: 'single' };
          
          // Since we're only showing user-initiated battles, the user's Digimon is always the initiator
          const playerDigimon = singleBattle.user_digimon;
          const opponentDigimon = singleBattle.opponent_digimon;
          
          // Use the detailed information if available
          const playerDetails = singleBattle.user_digimon_details;
          const opponentDetails = singleBattle.opponent_digimon_details;
          
          // Determine if the player won
          const playerWon = singleBattle.winner_digimon_id === playerDigimon?.id;
          
          return (
            <div 
              key={singleBattle.id} 
              className={`p-3 rounded-lg border ${
                playerWon ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {/* Victory/Defeat at the top */}
              <div className="text-center text-sm font-bold">
                <span className={playerWon ? 'text-green-600' : 'text-red-600'}>
                  {playerWon ? 'Victory' : 'Defeat'}
                </span>
                <span className="text-xs text-gray-500 ml-2">1v1</span>
              </div>

              {/* Digimon Details Section */}
              <div className="flex items-center justify-between">
                {/* Player Digimon */}
                <div className="flex items-center w-full">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={playerDetails?.sprite_url || playerDigimon?.digimon?.sprite_url} 
                      alt={playerDetails?.name || playerDigimon?.name} 
                      className="scale-[1]"
                      style={{ imageRendering: "pixelated", transform: "scaleX(-1)" }} 
                    />
                  </div>

                  <div className="ml-2 flex flex-col">
                    <div className="flex items-end">
                      <span className="text-sm font-medium">
                        {userDigimonDisplayName}{" "}
                        <span className="text-xs text-gray-500">Lv.{playerDetails?.level || playerDigimon?.current_level}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* "vs" Text */}
                <div className="w-16 flex justify-center text-sm font-bold text-gray-700">vs</div>

                {/* Opponent Digimon */}
                <div className="flex items-center w-full justify-end">
                  <div className="text-right mr-2 flex flex-col">
                    <div className="flex items-end">
                      <span className="text-sm font-medium">
                        {opponentDetails?.name || opponentDetails?.digimon_name || opponentDigimon?.digimon?.name}{" "}
                        <span className="text-xs text-gray-500">Lv.{opponentDetails?.level || opponentDigimon?.current_level}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {opponentDigimon?.profile?.display_name || opponentDigimon?.profile?.username || 'Wild'}
                    </span>
                  </div>

                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={opponentDetails?.sprite_url || opponentDigimon?.digimon?.sprite_url} 
                      alt={opponentDetails?.name || opponentDigimon?.name} 
                      style={{ 
                        imageRendering: "pixelated",
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Date at the bottom */}
              <div className="text-center text-xs text-gray-500 mt-2">
                {formattedDate}
              </div>
            </div>
          );
        } else {
          // Team battle
          const teamBattle = battle as TeamBattle & { type: 'team' };
          
          // Determine if the player won
          const playerWon = teamBattle.winner_id === (teamBattle.user_team[0]?.id || '');
          
          return (
            <div 
              key={teamBattle.id} 
              className={`p-3 rounded-lg border ${
                playerWon ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {/* Victory/Defeat at the top */}
              <div className="text-center text-sm font-bold">
                <span className={playerWon ? 'text-green-600' : 'text-red-600'}>
                  {playerWon ? 'Victory' : 'Defeat'}
                </span>
                <span className="text-xs text-gray-500 ml-2">Team Battle</span>
              </div>

              {/* Team Details Section */}
              <div className="flex items-center justify-between mt-2">
                {/* Player Team */}
                <div className="flex items-center w-full">
                  <div className="flex space-x-1">
                    {teamBattle.user_team.map((fighter) => (
                      <div key={fighter.id} className="w-8 h-8 flex items-center justify-center">
                        <img 
                          src={fighter.sprite_url} 
                          alt={fighter.name} 
                          className="scale-[1]"
                          style={{ imageRendering: "pixelated" }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* "vs" Text */}
                <div className="w-16 flex justify-center text-sm font-bold text-gray-700">vs</div>

                {/* Opponent Team */}
                <div className="flex items-center w-full justify-end">
                  <div className="flex space-x-1">
                    {teamBattle.opponent_team.map((fighter) => (
                      <div key={fighter.id} className="w-8 h-8 flex items-center justify-center">
                        <img 
                          src={fighter.sprite_url} 
                          alt={fighter.name} 
                          className="scale-[1]"
                          style={{ imageRendering: "pixelated" }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date at the bottom */}
              <div className="text-center text-xs text-gray-500 mt-2">
                {formattedDate}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default BattleHistory; 