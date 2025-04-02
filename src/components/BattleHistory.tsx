import { Battle } from "../store/battleStore";
interface BattleHistoryProps {
  battles: Battle[];
}

const BattleHistory: React.FC<BattleHistoryProps> = ({ battles }) => {
  
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
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={playerDigimon?.digimon?.sprite_url} 
                  alt={playerDigimon?.name} 
                  className="scale-[1]"
                  style={{ imageRendering: "pixelated" }} 
                />
              </div>
              
              <div className="mx-2 flex-grow">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{playerDigimon?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${playerWon ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {playerWon ? 'Victory' : 'Defeat'}
                  </span>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>
              </div>
              
              <div className="text-sm mx-1">vs</div>
              
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={opponentDigimon?.digimon?.sprite_url} 
                  alt={opponentDigimon?.name} 
                  className="scale-[1]"
                  style={{ 
                    imageRendering: "pixelated",
                    transform: "scaleX(-1)" // Flip horizontally
                  }} 
                />
              </div>
              
              <div className="ml-2 flex-grow-0">
                <div className="text-sm font-medium">{opponentDigimon?.name}</div>
                <div className="text-xs text-gray-500">
                  {opponentDigimon?.profile?.display_name || opponentDigimon?.profile?.username || 'Wild'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BattleHistory; 