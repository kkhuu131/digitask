import { Battle, TeamBattleHistory } from "../store/battleStore";
interface BattleHistoryProps {
  battles?: Battle[];
  teamBattles?: TeamBattleHistory[];
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ teamBattles = [] }) => {
  
  if (teamBattles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No battle history yet. Queue for a battle to get started!
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {teamBattles.map((battle) => {
        // Format the date
        const battleDate = new Date(battle.created_at);
        const formattedDate = battleDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Team battle
        const teamBattle = battle as TeamBattleHistory & { type: 'team' };
        console.log("teamBattle", teamBattle);
        
        // Determine if the player won
        const playerWon = teamBattle.winner_id === (teamBattle.user_id || '');
        
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
                        src={fighter.digimon.sprite_url} 
                        alt={fighter.name || fighter.digimon.name} 
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
                        src={fighter.digimon.sprite_url}
                        alt={fighter.name || fighter.digimon.name}
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
      })}
    </div>
  );
};

export default BattleHistory; 