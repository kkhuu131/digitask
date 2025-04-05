import { Battle } from "../store/battleStore";
import { useDigimonStore } from "../store/petStore";
interface BattleHistoryProps {
  battles: Battle[];
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ battles }) => {
  const { getDigimonDisplayName } = useDigimonStore();
  const userDigimonDisplayName = getDigimonDisplayName();
  
  if (battles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No battle history yet. Queue for a battle to get started!
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {battles.map((battle) => {
        // Since we're only showing user-initiated battles, the user's Digimon is always the initiator
        const playerDigimon = battle.user_digimon;
        const opponentDigimon = battle.opponent_digimon;
        
        // Use the detailed information if available
        const playerDetails = battle.user_digimon_details;
        const opponentDetails = battle.opponent_digimon_details;
        
        // Determine if the player won
        const playerWon = battle.winner_digimon_id === playerDigimon?.id;
        
        // Format the date
        const battleDate = new Date(battle.created_at);
        const formattedDate = battleDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return (
          <div 
            key={battle.id} 
            className={`p-3 rounded-lg border ${
              playerWon ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            {/* Victory/Defeat at the top */}
            <div className="text-center text-sm font-bold">
              <span className={playerWon ? 'text-green-600' : 'text-red-600'}>
                {playerWon ? 'Victory' : 'Defeat'}
              </span>
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
                      {opponentDetails?.name || opponentDetails?.digimon_name}{" "}
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
      })}
    </div>
  );
};

export default BattleHistory; 