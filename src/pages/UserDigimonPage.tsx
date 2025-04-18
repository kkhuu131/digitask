import { useState, useEffect } from "react";
import { useDigimonStore, EvolutionOption, UserDigimon } from "../store/petStore";
import MilestoneProgress from "../components/MilestoneProgress"
import { supabase } from "../lib/supabase";
import DigimonDetailModal from "../components/DigimonDetailModal";
import { motion } from "framer-motion";
import { useNotificationStore } from "../store/notificationStore";

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
  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);

  useEffect(() => {
    fetchAllUserDigimon();
    fetchAllEvolutionPaths();
  }, [fetchAllUserDigimon]);

  // Add event listener for name changes
  useEffect(() => {
    const handleNameChange = (event: CustomEvent) => {
      if (event.detail && event.detail.digimonId) {
        fetchAllUserDigimon();
      }
    };

    window.addEventListener('digimon-name-changed', handleNameChange as EventListener);
    
    return () => {
      window.removeEventListener('digimon-name-changed', handleNameChange as EventListener);
    };
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

  const handleEvolution = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      setEvolvingDigimon(true);
      
      // Call the evolve function from the store
      await evolveDigimon(toDigimonId, showEvolutionModal || undefined);
      
      // Fetch new evolution options for the evolved Digimon
      await fetchEvolutionPathsForDigimon(toDigimonId);
      
      // Refresh all user Digimon data
      await fetchAllUserDigimon();
      
      // Close both modals after successful evolution
      setShowEvolutionModal(null);
      setSelectedDetailDigimon(null);
      
      // Show success notification
      useNotificationStore.getState().addNotification({
        message: `Your Digimon has evolved successfully!`,
        type: "success"
      });
    } catch (error) {
      console.error("Evolution error:", error);
      setEvolutionError((error as Error).message);
    } finally {
      setEvolvingDigimon(false);
    }
  };

  // Add a new function to fetch evolution paths for a specific Digimon ID
  const fetchEvolutionPathsForDigimon = async (digimonId: number) => {
    try {
      const { data: evolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          from_digimon_id,
          to_digimon_id,
          level_required,
          digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url)
        `)
        .eq("from_digimon_id", digimonId);

      if (error) throw error;

      // Update the evolution data for this specific Digimon ID
      if (evolutionPaths.length > 0) {
        const newEvolutions: EvolutionOption[] = evolutionPaths.map(path => ({
          id: path.id,
          digimon_id: (path.digimon as any).id,
          name: (path.digimon as any).name,
          stage: (path.digimon as any).stage,
          sprite_url: (path.digimon as any).sprite_url,
          level_required: path.level_required,
        }));
        
        // Update the evolution data state
        setEvolutionData(prevData => ({
          ...prevData,
          [digimonId]: newEvolutions
        }));
      } else {
        // If no evolutions, set an empty array for this Digimon ID
        setEvolutionData(prevData => ({
          ...prevData,
          [digimonId]: []
        }));
      }
    } catch (error) {
      console.error("Error fetching evolution paths for Digimon:", error);
    }
  };

  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };

  // Add function to handle opening the detail modal
  const handleShowDetailModal = (digimonId: string) => {
    const digimon = allUserDigimon.find(d => d.id === digimonId);
    if (digimon) {
      setSelectedDetailDigimon(digimon);
    }
  };

  // Add function to close the detail modal
  const handleCloseDetailModal = () => {
    setSelectedDetailDigimon(null);
  };

  // Add a helper function to calculate age in days
  const calculateAgeDays = (createdAt: string): number => {
    const creationDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Add this useEffect to listen for digimon-evolved events
  useEffect(() => {
    const handleDigimonEvolved = (event: CustomEvent) => {
      if (event.detail && event.detail.newDigimonId) {
        // Refresh all user Digimon data
        fetchAllUserDigimon();
        
        // Fetch evolution paths for the newly evolved Digimon
        fetchEvolutionPathsForDigimon(event.detail.newDigimonId);
      }
    };

    window.addEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    
    return () => {
      window.removeEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    };
  }, [fetchAllUserDigimon]);

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
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
                        onClick={() => meetsLevelRequirement && handleEvolution(option.digimon_id)}
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

      {/* Digimon Detail Modal - Replace with new component */}
      {selectedDetailDigimon && (
        <DigimonDetailModal
          selectedDigimon={selectedDetailDigimon}
          onClose={handleCloseDetailModal}
          onSetActive={handleSwitchDigimon}
          onShowEvolution={(digimonId) => {
            // Set the evolution modal to show but don't close the detail modal
            handleShowEvolutionModal(digimonId);
          }}
          onRelease={handleReleaseClick}
          evolutionData={evolutionData}
          onNameChange={(updatedDigimon) => {
            // Update the local state immediately
            setSelectedDetailDigimon(updatedDigimon);
            
            // This is a bit of a hack, but we can use this to force a re-render
            // of the digimon cards
            setTimeout(() => {
              const cards = document.querySelectorAll(`.digimon-card-${updatedDigimon.id} .digimon-name`);
              cards.forEach(card => {
                if (card) {
                  card.textContent = updatedDigimon.name || updatedDigimon.digimon?.name || '';
                }
              });
            }, 0);
          }}
          className="z-40" // Add a lower z-index
        />
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
            
            return (
              <div 
                key={digimon.id} 
                className={`digimon-card-${digimon.id} border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleShowDetailModal(digimon.id)}
              >
                <div className="p-4">
                  <div className="flex flex-col mb-2">
                    {/* Name section */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg mb-1 digimon-name">
                        {digimon.name || digimon.digimon?.name}
                      </h3>
                    </div>
                    
                    {/* Tags row */}
                    <div className="flex space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Lv. {digimon.current_level}
                      </span>
                      {digimon.is_on_team && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Team
                        </span>
                      )}
                      {digimon.is_active && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Add back the sprite */}
                  <div className="flex items-center justify-center my-2">
                    <div className="w-16 h-16 flex items-center justify-center">
                      {/* Check if Digimon can evolve */}
                      {evolutionData[digimon.digimon_id]?.some(
                        option => digimon.current_level >= option.level_required
                      ) ? (
                        // If it can evolve, use motion.img with hopping animation
                        <motion.img 
                          src={digimon.digimon?.sprite_url} 
                          alt={digimon.name || digimon.digimon?.name} 
                          className="scale-[1.5]"
                          style={{ imageRendering: "pixelated", scale: "1.5" }}
                          animate={{
                            y: [0, -5, 0, -3, 0, -5, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 1,
                          }}
                        />
                      ) : (
                        // If it can't evolve, use regular img
                        <img 
                          src={digimon.digimon?.sprite_url} 
                          alt={digimon.name || digimon.digimon?.name} 
                          className="scale-[1.5]"
                          style={{ imageRendering: "pixelated" }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Simplified status bars */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>HP</span>
                        <span>{digimon.health}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            digimon.health >= 60 ? 'bg-green-500' : 
                            digimon.health >= 30 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{ width: `${digimon.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Age display */}
                  <div className="text-xs text-gray-500 text-center mb-2">
                    Age: {calculateAgeDays(digimon.created_at)} days
                  </div>
                  
                  {/* Simplified action buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        digimon.is_active ? null : handleSwitchDigimon(digimon.id);
                      }}
                      className={`text-sm px-3 py-1 rounded ${
                        digimon.is_active 
                          ? "bg-gray-100 text-gray-400 cursor-default" 
                          : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                      }`}
                      disabled={digimon.is_active || switchingDigimon}
                    >
                      {digimon.is_active ? "Active" : switchingDigimon ? "Setting..." : "Set Active"}
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      Click for details
                    </div>
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