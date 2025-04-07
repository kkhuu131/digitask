import { useState, useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { motion } from "framer-motion";
import MilestoneProgress from "../components/MilestoneProgress"

const UserDigimonPage = () => {
  const { 
    allUserDigimon, 
    userDigimon, 
    fetchAllUserDigimon, 
    setActiveDigimon,
    releaseDigimon,
    loading, 
    error 
  } = useDigimonStore();
  const [switchingDigimon, setSwitchingDigimon] = useState(false);
  const [digimonToRelease, setDigimonToRelease] = useState<string | null>(null);
  const [releasingDigimon, setReleasingDigimon] = useState(false);

  useEffect(() => {
    fetchAllUserDigimon();
  }, [fetchAllUserDigimon]);

  const handleSwitchDigimon = async (digimonId: string) => {
    if (digimonId === userDigimon?.id) return;
    
    setSwitchingDigimon(true);
    await setActiveDigimon(digimonId);
    setSwitchingDigimon(false);
  };
  
  const handleReleaseClick = (digimonId: string) => {
    setDigimonToRelease(digimonId);
  };
  
  const handleConfirmRelease = async () => {
    if (!digimonToRelease) return;
    
    setReleasingDigimon(true);
    await releaseDigimon(digimonToRelease);
    setReleasingDigimon(false);
    setDigimonToRelease(null);
  };
  
  const handleCancelRelease = () => {
    setDigimonToRelease(null);
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
      {/* Confirmation Dialog */}
      {digimonToRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Release Digimon</h3>
            <p className="mb-6">
              Are you sure you want to release this Digimon? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelRelease}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={releasingDigimon}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={releasingDigimon}
              >
                {releasingDigimon ? "Releasing..." : "Release"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-4">Your Digimon</h1>
        <p className="text-gray-600 mb-6">
          You can have up to 9 Digimon total, with 3 on your battle team. 
          Only one Digimon can be active at a time to gain experience from completed tasks.
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Digimon Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...allUserDigimon]
            .sort((a, b) => b.current_level - a.current_level)
            .map((digimon) => {
            const isActive = digimon.id === userDigimon?.id;
            
            return (
              <div key={digimon.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">
                      {digimon.name || digimon.digimon?.name}
                    </h3>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Lv. {digimon.current_level}
                      </span>
                      {digimon.is_on_team && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Team
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center my-4">
                    <motion.div
                      animate={{y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-24 h-24 flex items-center justify-center"
                    >
                      <img 
                        src={digimon.digimon?.sprite_url} 
                        alt={digimon.name || digimon.digimon?.name} 
                        className="scale-[2]"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>HP</span>
                        <span>{digimon.health}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${digimon.health}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>XP</span>
                        <span>{digimon.experience_points}/{digimon.current_level * 20}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (digimon.experience_points / (digimon.current_level * 20)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
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
                      <div className="text-center text-md text-primary-600 font-medium">
                        Currently Active
                      </div>
                    )}
                    
                    {/* Release button - only show for non-active Digimon */}
                    {!isActive && (
                      <button
                        onClick={() => handleReleaseClick(digimon.id)}
                        className="text-sm w-full py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Release
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {allUserDigimon.length < 9 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-center">
                Digimon slot available
                <br />
                <span className="text-xs">{9 - allUserDigimon.length} slots remaining</span>
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