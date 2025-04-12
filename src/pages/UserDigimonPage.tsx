import { useState, useEffect } from "react";
import { useDigimonStore, EvolutionOption } from "../store/petStore";
import { motion } from "framer-motion";
import MilestoneProgress from "../components/MilestoneProgress"
import { supabase } from "../lib/supabase";

const UserDigimonPage = () => {
  const { 
    allUserDigimon, 
    userDigimon, 
    fetchAllUserDigimon, 
    setActiveDigimon,
    releaseDigimon,
    loading, 
    error,
    discoveredDigimon,
    evolveDigimon
  } = useDigimonStore();
  const [switchingDigimon, setSwitchingDigimon] = useState(false);
  const [digimonToRelease, setDigimonToRelease] = useState<string | null>(null);
  const [releasingDigimon, setReleasingDigimon] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{[key: number]: EvolutionOption[]}>({});
  const [showEvolutionModal, setShowEvolutionModal] = useState<string | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [evolvingDigimon, setEvolvingDigimon] = useState(false);

  useEffect(() => {
    fetchAllUserDigimon();
    fetchAllEvolutionPaths();
  }, [fetchAllUserDigimon]);

  // Fetch all evolution paths for all user's Digimon at once
  const fetchAllEvolutionPaths = async () => {
    try {
      // Get unique digimon_ids from all user Digimon
      const digimonIds = [...new Set(allUserDigimon.map(d => d.digimon_id))];
      
      if (digimonIds.length === 0) return;

      // Fetch evolution paths for all digimon_ids
      const { data: evolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          from_digimon_id,
          to_digimon_id,
          level_required,
          digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url)
        `)
        .in("from_digimon_id", digimonIds);

      if (error) throw error;

      // Organize evolution paths by from_digimon_id
      const evolutionsByDigimon: {[key: number]: EvolutionOption[]} = {};
      
      evolutionPaths.forEach(path => {
        if (!evolutionsByDigimon[path.from_digimon_id]) {
          evolutionsByDigimon[path.from_digimon_id] = [];
        }
        
        evolutionsByDigimon[path.from_digimon_id].push({
          id: path.id,
          digimon_id: (path.digimon as any).id,
          name: (path.digimon as any).name,
          stage: (path.digimon as any).stage,
          sprite_url: (path.digimon as any).sprite_url,
          level_required: path.level_required,
        });
      });

      setEvolutionData(evolutionsByDigimon);
    } catch (error) {
      console.error("Error fetching evolution paths:", error);
    }
  };

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

  const handleShowEvolutionModal = (digimonId: string) => {
    setShowEvolutionModal(digimonId);
    setEvolutionError(null);
  };

  const handleCloseEvolutionModal = () => {
    setShowEvolutionModal(null);
    setEvolutionError(null);
  };

  const handleEvolve = async (digimonId: string, toDigimonId: number) => {
    try {
      setEvolutionError(null);
      setEvolvingDigimon(true);
      
      // First make this the active Digimon if it's not already
      if (userDigimon?.id !== digimonId) {
        await setActiveDigimon(digimonId);
      }
      
      // Then evolve it
      await evolveDigimon(toDigimonId);
      
      // Refresh evolution data
      await fetchAllEvolutionPaths();
      
      setEvolvingDigimon(false);
      setShowEvolutionModal(null);
    } catch (error) {
      setEvolutionError((error as Error).message);
      setEvolvingDigimon(false);
    }
  };

  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
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
      {/* Confirmation Dialog for Release */}
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
            
            {evolvingDigimon && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Evolving your Digimon...</p>
              </div>
            )}
            
            {!evolvingDigimon && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {(() => {
                  const selectedDigimon = allUserDigimon.find(d => d.id === showEvolutionModal);
                  if (!selectedDigimon) return <p>Digimon not found</p>;
                  
                  const evolutions = evolutionData[selectedDigimon.digimon_id] || [];
                  
                  if (evolutions.length === 0) {
                    return <p className="col-span-2 text-center py-4">No evolution options available for this Digimon.</p>;
                  }
                  
                  return evolutions.map((option) => {
                    const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;
                    const discovered = isDiscovered(option.digimon_id);
                    
                    return (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-3 transition-all ${
                          meetsLevelRequirement 
                            ? "cursor-pointer hover:bg-primary-50 hover:border-primary-300" 
                            : "opacity-60 bg-gray-100"
                        }`}
                        onClick={() => meetsLevelRequirement && handleEvolve(showEvolutionModal, option.digimon_id)}
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
                            {!meetsLevelRequirement && ` (Current: ${selectedDigimon.current_level})`}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={handleCloseEvolutionModal}
                className="btn-outline"
                disabled={evolvingDigimon}
              >
                Close
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
            const hasEvolutions = evolutionData[digimon.digimon_id]?.length > 0;
            const availableEvolutions = evolutionData[digimon.digimon_id]?.filter(
              option => digimon.current_level >= option.level_required
            ) || [];
            const canEvolve = availableEvolutions.length > 0;
            
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
                    <div className="flex space-x-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSwitchDigimon(digimon.id)}
                          disabled={switchingDigimon}
                          className="btn-primary text-sm flex-1 flex items-center justify-center"
                        >
                          {switchingDigimon ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Switching...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Make Active
                            </span>
                          )}
                        </button>
                      )}
                      
                      {isActive && (
                        <div className="text-center text-md text-primary-600 font-medium flex-1 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Currently Active
                        </div>
                      )}
                      
                      {/* Release button as an icon button for non-active Digimon */}
                      {!isActive && (
                        <button
                          onClick={() => handleReleaseClick(digimon.id)}
                          className="p-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                          title="Release Digimon"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Evolution button */}
                    {hasEvolutions && (
                      <button
                        onClick={() => handleShowEvolutionModal(digimon.id)}
                        className={`text-sm w-full ${
                          canEvolve ? "btn-secondary" : "btn-outline"
                        } flex items-center justify-center`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {canEvolve ? "Digivolve" : "Evolutions"}
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