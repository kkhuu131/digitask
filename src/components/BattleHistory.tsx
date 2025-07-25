import { TeamBattleHistory } from "../store/battleStore";
import DigimonSprite from "./DigimonSprite";
interface BattleHistoryProps {
  teamBattles?: TeamBattleHistory[];
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ teamBattles = [] }) => {
  
  if (teamBattles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No battle history yet. Queue for a battle to get started!
      </div>
    );
  }
  
  return (
    <div className="max-h-[700px] md:max-h-[700px] lg:max-h-[700px] overflow-y-auto pr-2 pb-4">
      <div className="space-y-3 sm:space-y-4">
        {teamBattles.map((battle, index) => {
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
          // Determine if the player won
          const playerWon = teamBattle.winner_id === (teamBattle.user_id || '');
          
          return (
            <div 
              key={`${battle.id}-${index}`} 
              className={`px-2 py-3 sm:px-3 rounded-lg border ${
                playerWon 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              }`}
            >
              {/* Victory/Defeat at the top */}
              <div className="text-center text-sm sm:text-base font-bold">
                <span className={playerWon ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {playerWon ? 'Victory' : 'Defeat'}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 ml-1 sm:ml-2">Team Battle</span>
              </div>

              {/* Team Details Section */}
              <div className="flex items-center justify-between mt-2">
                {/* Player Team */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="flex space-x-0 sm:space-x-1">
                    {teamBattle.user_team.map((fighter) => (
                      <div key={fighter.id} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        <DigimonSprite 
                          digimonName={fighter.digimon.name} 
                          fallbackSpriteUrl={fighter.digimon.sprite_url} 
                          size="xs" 
                          showHappinessAnimations={false}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 truncate w-full text-center px-1">
                    {teamBattle.user?.username || "You"}
                  </span>
                </div>

                {/* "vs" Text */}
                <div className="w-auto mx-1 sm:mx-2 flex justify-center text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">vs</div>

                {/* Opponent Team */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="flex space-x-0 sm:space-x-1">
                    {teamBattle.opponent_team.map((fighter) => (
                      <div key={fighter.id} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        <DigimonSprite 
                          digimonName={fighter.digimon.name} 
                          fallbackSpriteUrl={fighter.digimon.sprite_url} 
                          size="xs" 
                          showHappinessAnimations={false}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 truncate w-full text-center px-1">
                    {teamBattle.opponent_id ? (teamBattle.opponent?.username || "Opponent") : "Wild Encounter"}
                  </span>
                </div>
              </div>

              {/* Date at the bottom */}
              <div className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formattedDate}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BattleHistory; 