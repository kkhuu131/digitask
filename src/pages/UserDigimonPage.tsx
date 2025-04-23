import { useState, useEffect } from "react";
import { useDigimonStore, EvolutionOption, UserDigimon, expToBoostPoints } from "../store/petStore";
import MilestoneProgress from "../components/MilestoneProgress"
import { supabase } from "../lib/supabase";
import DigimonDetailModal from "../components/DigimonDetailModal";
import { motion } from "framer-motion";
import statModifier, { DigimonType, DigimonAttribute } from "../store/battleStore";
import TypeAttributeIcon from '../components/TypeAttributeIcon';

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
    evolveDigimon,
    devolveDigimon
  } = useDigimonStore();
  const [switchingDigimon, setSwitchingDigimon] = useState(false);
  const [digimonToRelease, setDigimonToRelease] = useState<string | null>(null);
  const [releasingDigimon, setReleasingDigimon] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{[key: number]: EvolutionOption[]}>({});
  const [showEvolutionModal, setShowEvolutionModal] = useState<string | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);
  const [showDevolutionModal, setShowDevolutionModal] = useState<string | null>(null);
  const [devolutionError, setDevolutionError] = useState<string | null>(null);
  const [devolutionData, setDevolutionData] = useState<{[key: number]: EvolutionOption[]}>({});

  useEffect(() => {
    fetchAllUserDigimon();
    fetchAllEvolutionPaths();
    fetchAllDevolutionPaths();
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
          stat_requirements,
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
          stat_requirements: path.stat_requirements || {}
        });
      });

      setEvolutionData(evolutionsByDigimon);
    } catch (error) {
      console.error("Error fetching evolution paths:", error);
    }
  };

  // Add function to fetch devolution paths
  const fetchAllDevolutionPaths = async () => {
    try {
      const { data: devolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          to_digimon_id,
          from_digimon_id,
          digimon:from_digimon_id (id, digimon_id, name, stage, sprite_url)
        `);
        
      if (error) throw error;
      
      // Group by to_digimon_id (the current form that can devolve)
      const groupedPaths: {[key: number]: EvolutionOption[]} = {};
      
      devolutionPaths.forEach(path => {
        if (!groupedPaths[path.to_digimon_id]) {
          groupedPaths[path.to_digimon_id] = [];
        }
        
        groupedPaths[path.to_digimon_id].push({
          id: path.id,
          digimon_id: path.from_digimon_id,
          name: (path.digimon as any).name,
          stage: (path.digimon as any).stage,
          sprite_url: (path.digimon as any).sprite_url,
          level_required: 0 // Not applicable for devolution
        });
      });
      
      setDevolutionData(groupedPaths);
    } catch (error) {
      console.error("Error fetching devolution paths:", error);
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
          stat_requirements,
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
          stat_requirements: path.stat_requirements || {}
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
      console.error("Error fetching evolution paths:", error);
    }
  };

  const handleEvolution = async (digimonId: string, toDigimonId: number) => {
    try {
      setEvolutionError(null);
      setShowEvolutionModal(null);
      setSelectedDetailDigimon(null);
      
      // Evolve the Digimon
      await evolveDigimon(toDigimonId, digimonId);

      await fetchEvolutionPathsForDigimon(toDigimonId);

      // Refresh all user Digimon data
      await fetchAllUserDigimon();
      
      
      
    } catch (error) {
      setEvolutionError((error as Error).message);
    }
  };

  const handleDevolve = async (digimonId: string, fromDigimonId: number) => {
    try {
      setDevolutionError(null);

      setShowDevolutionModal(null);
      setSelectedDetailDigimon(null);

      await devolveDigimon(fromDigimonId, digimonId);
      await fetchEvolutionPathsForDigimon(fromDigimonId);
    } catch (error) {
      setDevolutionError((error as Error).message);
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
        fetchAllEvolutionPaths();
        fetchAllDevolutionPaths();
      }
    };

    window.addEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    
    return () => {
      window.removeEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    };
  }, [fetchAllUserDigimon]);

  // Add this function to UserDigimonPage.tsx
  const handleShowDevolutionModal = (digimonId: string) => {
    setShowDevolutionModal(digimonId);
    setDevolutionError(null);
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
      {showEvolutionModal && selectedDetailDigimon && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEvolutionModal(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Evolution Options</h3>
            <div className="text-md text-gray-500 mb-4">
              Evolving will<b className="text-red-500"> reset your Digimon level back to 1</b> and give {expToBoostPoints(selectedDetailDigimon.current_level, selectedDetailDigimon.experience_points, true)} bonus points to all stats.
            </div>
            {evolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{evolutionError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {(evolutionData[selectedDetailDigimon.digimon_id] || []).map((option) => {
                // Calculate base stats for current level
                const baseHP = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.hp_level1 || 0,
                  selectedDetailDigimon.digimon?.hp || 0,
                  selectedDetailDigimon.digimon?.hp_level99 || 0
                );
                
                const baseSP = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.sp_level1 || 0,
                  selectedDetailDigimon.digimon?.sp || 0,
                  selectedDetailDigimon.digimon?.sp_level99 || 0
                );
                
                const baseATK = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.atk_level1 || 0,
                  selectedDetailDigimon.digimon?.atk || 0,
                  selectedDetailDigimon.digimon?.atk_level99 || 0
                );
                
                const baseDEF = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.def_level1 || 0,
                  selectedDetailDigimon.digimon?.def || 0,
                  selectedDetailDigimon.digimon?.def_level99 || 0
                );
                
                const baseINT = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.int_level1 || 0,
                  selectedDetailDigimon.digimon?.int || 0,
                  selectedDetailDigimon.digimon?.int_level99 || 0
                );
                
                const baseSPD = statModifier(
                  selectedDetailDigimon.current_level,
                  selectedDetailDigimon.digimon?.spd_level1 || 0,
                  selectedDetailDigimon.digimon?.spd || 0,
                  selectedDetailDigimon.digimon?.spd_level99 || 0
                );
                
                // Check level requirement
                const meetsLevelRequirement = selectedDetailDigimon.current_level >= option.level_required;
                
                // Check stat requirements
                let meetsStatRequirements = true;
                const statRequirementsList = [];
                
                if (option.stat_requirements) {
                  const statReqs = option.stat_requirements;
                  
                  // Check each stat requirement and build display list
                  if (statReqs.hp && statReqs.hp > 0) {
                    const currentHP = baseHP + (selectedDetailDigimon.hp_bonus || 0);
                    if (currentHP < statReqs.hp) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'HP',
                      current: currentHP,
                      required: statReqs.hp,
                      meets: currentHP >= statReqs.hp
                    });
                  }
                  
                  if (statReqs.sp && statReqs.sp > 0) {
                    const currentSP = baseSP + (selectedDetailDigimon.sp_bonus || 0);
                    if (currentSP < statReqs.sp) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'SP',
                      current: currentSP,
                      required: statReqs.sp,
                      meets: currentSP >= statReqs.sp
                    });
                  }
                  
                  if (statReqs.atk && statReqs.atk > 0) {
                    const currentATK = baseATK + (selectedDetailDigimon.atk_bonus || 0);
                    if (currentATK < statReqs.atk) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'ATK',
                      current: currentATK,
                      required: statReqs.atk,
                      meets: currentATK >= statReqs.atk
                    });
                  }
                  
                  if (statReqs.def && statReqs.def > 0) {
                    const currentDEF = baseDEF + (selectedDetailDigimon.def_bonus || 0);
                    if (currentDEF < statReqs.def) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'DEF',
                      current: currentDEF,
                      required: statReqs.def,
                      meets: currentDEF >= statReqs.def
                    });
                  }
                  
                  if (statReqs.int && statReqs.int > 0) {
                    const currentINT = baseINT + (selectedDetailDigimon.int_bonus || 0);
                    if (currentINT < statReqs.int) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'INT',
                      current: currentINT,
                      required: statReqs.int,
                      meets: currentINT >= statReqs.int
                    });
                  }
                  
                  if (statReqs.spd && statReqs.spd > 0) {
                    const currentSPD = baseSPD + (selectedDetailDigimon.spd_bonus || 0);
                    if (currentSPD < statReqs.spd) meetsStatRequirements = false;
                    statRequirementsList.push({
                      name: 'SPD',
                      current: currentSPD,
                      required: statReqs.spd,
                      meets: currentSPD >= statReqs.spd
                    });
                  }
                }
                
                const canEvolve = meetsLevelRequirement && meetsStatRequirements;
                    const discovered = isDiscovered(option.digimon_id);
                    
                    return (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-4 flex flex-col items-center ${
                      canEvolve ? "hover:shadow-md cursor-pointer opacity-100" : "opacity-60 bg-gray-100"
                        }`}
                        onClick={() => canEvolve && handleEvolution(showEvolutionModal, option.digimon_id)}
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
                            {option.stage}
                          </span>
                      
                      {/* Level requirement */}
                          <span className={`text-xs mt-1 ${
                            meetsLevelRequirement ? "text-green-600" : "text-red-600"
                          }`}>
                            Required Level: {option.level_required}
                        {!meetsLevelRequirement && ` (Current: ${selectedDetailDigimon.current_level})`}
                          </span>
                      
                      {/* Stat requirements */}
                      {statRequirementsList.length > 0 && (
                        <div className="mt-2 w-full">
                          <div className="space-y-1 mt-1">
                            {statRequirementsList.map(stat => (
                              <div key={stat.name} className="flex justify-between text-xs">
                                <span>{stat.name}</span>
                                <span className={stat.meets ? "text-green-600" : "text-red-600"}>
                                  {stat.current}/{stat.required}
                          </span>
                        </div>
                            ))}
                      </div>
              </div>
            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setShowEvolutionModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
          onShowDevolution={(digimonId) => handleShowDevolutionModal(digimonId)}
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

      {/* Devolution Modal */}
      {showDevolutionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDevolutionModal(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">De-Digivolution Options</h3>
            <div className="text-md text-gray-500 mb-4">
              Devolving will<b className="text-red-500"> reset your Digimon level back to 1</b> and give {expToBoostPoints(selectedDetailDigimon?.current_level || 1, selectedDetailDigimon?.experience_points || 0, false)} bonus points to all stats.
            </div>
            {devolutionError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{devolutionError}</p>
                    </div>
                  )}
            
            {/* Find the selected digimon */}
            {(() => {
              const selectedDigimon = allUserDigimon.find(d => d.id === showDevolutionModal);
              if (!selectedDigimon) return <p>Digimon not found</p>;
              
              const options = devolutionData[selectedDigimon.digimon_id] || [];
                      
                return (
                  <div>
                    {options.length === 0 && (
                      <p className="text-gray-500 text-center">No options available.</p>
                    )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {options.map((option) => {
                      const discovered = isDiscovered(option.digimon_id);
                      return (
                        <div 
                          key={option.id}
                        className={`border rounded-lg p-4 flex flex-col items-center ${
                          discovered ? "hover:shadow-md cursor-pointer opacity-100" : "opacity-60 bg-gray-100"
                        }`}
                        onClick={() => discovered && handleDevolve(showDevolutionModal, option.digimon_id)}
                      >
                          <img 
                            src={option.sprite_url} 
                            alt={discovered ? option.name : "Unknown Digimon"}
                            className={`w-24 h-24 object-contain mb-2 ${
                              discovered ? "opacity-100" : "brightness-0"
                            }`}
                            style={{ imageRendering: "pixelated" }}
                          />
                        <h4 className="font-bold">{discovered ? option.name : "???"}</h4>
                        <p className="text-sm text-gray-500">{option.stage}</p>
                                </div>
                      );
                    })}
                  </div>
                </div>
                );
            })()}
            
            <div className="flex justify-end mt-4">
                    <button
                onClick={() => setShowDevolutionModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
            
            return (
              <div 
                key={digimon.id} 
                className={`digimon-card-${digimon.id} border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative`}
                onClick={() => handleShowDetailModal(digimon.id)}
              >
                {/* Add TypeAttributeIcon in the top right corner */}
                {digimon.digimon?.type && digimon.digimon?.attribute && (
                  <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-75 p-1 rounded">
                    <TypeAttributeIcon 
                      type={digimon.digimon.type as DigimonType} 
                      attribute={digimon.digimon.attribute as DigimonAttribute}
                      size="md"
                    />
                  </div>
                )}
                
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