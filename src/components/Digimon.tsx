import { motion } from "framer-motion";
import { useDigimonStore, UserDigimon, Digimon as DigimonType, EvolutionOption } from "../store/petStore";
import { useState } from "react";

interface DigimonProps {
  userDigimon: UserDigimon;
  digimonData: DigimonType;
  evolutionOptions: EvolutionOption[];
}

const Digimon = ({ userDigimon, digimonData, evolutionOptions }: DigimonProps) => {
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const { evolveDigimon, discoveredDigimon } = useDigimonStore();
  
  // Calculate experience percentage
  const expNeeded = userDigimon.current_level * 20;
  const expPercentage = (userDigimon.experience_points / expNeeded) * 100;
  
  // Calculate health and happiness percentages
  const healthPercentage = (userDigimon.health / 100) * 100;
  const happinessPercentage = (userDigimon.happiness / 100) * 100;
  
  const handleEvolve = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      await evolveDigimon(toDigimonId);
      setShowEvolutionModal(false);
    } catch (error) {
      setEvolutionError((error as Error).message);
    }
  };
  
  // Filter evolution options to only show those that meet the level requirement
  const availableEvolutions = evolutionOptions.filter(
    option => userDigimon.current_level >= option.level_required
  );
  
  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };
  
  return (
    <div className="card flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-1">{userDigimon.name}</h2>
      <p className="text-sm text-gray-500 mb-4">{digimonData.name} - {digimonData.stage}</p>
      
      <div className="relative mb-6">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-40 h-40 flex items-center justify-center"
        >
          <img 
            src={digimonData.sprite_url} 
            alt={digimonData.name} 
            className="scale-[3] w-auto h-auto"
            style={{ imageRendering: "pixelated" }} 
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
            }}
          />
        </motion.div>
        
        {/* Mood indicator */}
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
          {userDigimon.happiness > 80 ? (
            <span className="text-2xl">😄</span>
          ) : userDigimon.happiness > 50 ? (
            <span className="text-2xl">🙂</span>
          ) : userDigimon.happiness > 30 ? (
            <span className="text-2xl">😐</span>
          ) : (
            <span className="text-2xl">😢</span>
          )}
        </div>
      </div>
      
      <div className="w-full space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Health</span>
            <span>{userDigimon.health}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: healthPercentage > 60 ? '#10b981' : healthPercentage > 30 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Happiness</span>
            <span>{userDigimon.happiness}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${happinessPercentage}%`,
                backgroundColor: happinessPercentage > 60 ? '#10b981' : happinessPercentage > 30 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Level {userDigimon.current_level}</span>
            <span>{userDigimon.experience_points}/{expNeeded} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-secondary-500 h-2.5 rounded-full" 
              style={{ width: `${expPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Stage: {digimonData.stage}</p>
        <p>Type: {(digimonData as any)?.type || "Unknown"}</p>
        <p>Attribute: {(digimonData as any)?.attribute || "Unknown"}</p>
        <p>Stats: HP {digimonData.hp} | ATK {digimonData.atk} | DEF {digimonData.def} | SPD {digimonData.spd}</p>
      </div>
      
      {evolutionOptions.length > 0 && (
        <button
          onClick={() => setShowEvolutionModal(true)}
          className={`mt-4 ${
            availableEvolutions.length > 0 ? "btn-secondary" : "btn-outline"
          }`}
        >
          {availableEvolutions.length > 0 ? "Digivolve" : "View Evolution Options"}
        </button>
      )}
      
      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Evolution Options</h3>
            
            {evolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{evolutionError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {evolutionOptions.map((option) => {
                const meetsLevelRequirement = userDigimon.current_level >= option.level_required;
                const discovered = isDiscovered(option.digimon_id);
                
                return (
                  <div 
                    key={option.id}
                    className={`border rounded-lg p-3 transition-all ${
                      meetsLevelRequirement 
                        ? "cursor-pointer hover:bg-primary-50 hover:border-primary-300" 
                        : "opacity-60 bg-gray-100"
                    }`}
                    onClick={() => meetsLevelRequirement && handleEvolve(option.digimon_id)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-2">
                        <img 
                          src={option.sprite_url} 
                          alt={discovered ? option.name : "Unknown Digimon"}
                          style={{ imageRendering: "pixelated" }} 
                          className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                          }}
                        />
                        {!discovered && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                              src={option.sprite_url} 
                              alt="Unknown Digimon"
                              style={{ imageRendering: "pixelated" }} 
                              className="w-full h-full object-contain brightness-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-center">
                        {discovered ? option.name : "???"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {discovered ? option.stage : "Unknown Stage"}
                      </span>
                      <span className={`text-xs mt-1 ${
                        meetsLevelRequirement ? "text-green-600" : "text-red-600"
                      }`}>
                        Required Level: {option.level_required}
                        {!meetsLevelRequirement && ` (Current: ${userDigimon.current_level})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setEvolutionError(null);
                  setShowEvolutionModal(false);
                }}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Digimon; 