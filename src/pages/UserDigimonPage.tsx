import { useEffect, useState } from "react";
import { useDigimonStore } from "../store/petStore";
import { motion } from "framer-motion";
import MilestoneProgress from "../components/MilestoneProgress"

const UserDigimonPage = () => {
  const { 
    allUserDigimon, 
    userDigimon, 
    fetchAllUserDigimon, 
    setActiveDigimon, 
    loading, 
    error 
  } = useDigimonStore();
  const [switchingDigimon, setSwitchingDigimon] = useState(false);

  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  const handleSwitchDigimon = async (digimonId: string) => {
    if (digimonId === userDigimon?.id) return;
    
    setSwitchingDigimon(true);
    await setActiveDigimon(digimonId);
    setSwitchingDigimon(false);
  };

  if (loading && allUserDigimon.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your Digimon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-4">Your Digimon</h1>
        <p className="text-gray-600 mb-6">
          You can have up to 3 Digimon, but only one can be active at a time. 
          The active Digimon will gain experience from completed tasks and participate in battles.
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUserDigimon.map((digimon) => {
            const isActive = digimon.id === userDigimon?.id;
            
            return (
              <div 
                key={digimon.id} 
                className={`border rounded-lg p-4 ${
                  isActive 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <motion.div
                      animate={isActive ? { y: [0, -5, 0] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-24 h-24 flex items-center justify-center"
                    >
                      <img 
                        src={digimon.digimon?.sprite_url} 
                        alt={digimon.digimon?.name} 
                        className="scale-[2]"
                        style={{ imageRendering: "pixelated" }} 
                      />
                    </motion.div>
                    
                    {isActive && (
                      <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                        Active
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg">
                    {digimon.name || digimon.digimon?.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {digimon.digimon?.name} - Level {digimon.current_level}
                  </p>
                  
                  <div className="w-full space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Health</span>
                        <span>{digimon.health.toFixed(0)}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.max(0, Math.min(100, (digimon.health / 100) * 100))}%`,
                            backgroundColor: digimon.health > 60 ? '#10b981' : digimon.health > 30 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Happiness</span>
                        <span>{digimon.happiness.toFixed(0)}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.max(0, Math.min(100, (digimon.happiness / 100) * 100))}%`,
                            backgroundColor: digimon.happiness > 60 ? '#10b981' : digimon.happiness > 30 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {!isActive && (
                    <button
                      onClick={() => handleSwitchDigimon(digimon.id)}
                      disabled={switchingDigimon}
                      className="btn-primary text-sm w-full"
                    >
                      {switchingDigimon ? "Switching..." : "Make Active"}
                    </button>
                  )}
                  
                  {isActive && (
                    <div className="text-center text-sm text-primary-600 font-medium">
                      Currently Active
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {allUserDigimon.length < 3 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-center">
                Digimon slot available
                <br />
                <span className="text-xs">More ways to get Digimon coming soon!</span>
              </p>
            </div>
          )}

        </div>
      </div>
      <MilestoneProgress />
    </div>
  );
};

export default UserDigimonPage; 