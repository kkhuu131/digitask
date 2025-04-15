import { useState, useEffect } from "react";
import { useDigimonStore, EvolutionOption } from "../store/petStore";
import MilestoneProgress from "../components/MilestoneProgress"
import { supabase } from "../lib/supabase";
import statModifier from "../store/battleStore";

interface UserDigimon {
  id: string;
  user_id: string;
  digimon_id: number;
  name: string;
  current_level: number;
  experience_points: number;
  health: number;
  happiness: number;
  created_at: string;
  last_updated_at: string;
  is_active: boolean;
  is_on_team: boolean;
  hp_bonus: number;
  sp_bonus: number;
  atk_bonus: number;
  def_bonus: number;
  int_bonus: number;
  spd_bonus: number;
  digimon?: {
    id: number;
    name: string;
    stage: string;
    sprite_url: string;
    hp?: number;
    sp?: number;
    atk?: number;
    def?: number;
    int?: number;
    spd?: number;
    hp_level1?: number;
    sp_level1?: number;
    atk_level1?: number;
    def_level1?: number;
    int_level1?: number;
    spd_level1?: number;
    hp_level99?: number;
    sp_level99?: number;
    atk_level99?: number;
    def_level99?: number;
    int_level99?: number;
    spd_level99?: number;
  };
}

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
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);

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
      
      // Directly evolve the Digimon without making it active
      await evolveDigimon(toDigimonId, digimonId);
      
      // After evolution, explicitly refresh the data to update the UI
      await fetchAllUserDigimon();
      
      // Fetch evolution paths for the newly evolved Digimon
      await fetchEvolutionPathsForDigimon(toDigimonId);
      
      setEvolvingDigimon(false);
      setShowEvolutionModal(null);
    } catch (error) {
      setEvolutionError((error as Error).message);
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

  // Add function to handle name editing
  const handleEditName = (digimonId: string, currentName: string, speciesName: string) => {
    setEditingName(digimonId);
    // If the current name is empty or matches the species name, start with empty field
    setNewName(currentName === speciesName ? "" : currentName);
  };

  // Add function to save the new name
  const handleSaveName = async (digimonId: string) => {
    try {
      // If name is empty or just whitespace, set it to empty string (will show species name)
      const nameToSave = newName.trim() || "";
      
      // Update the name in the database
      const { error } = await supabase
        .from("user_digimon")
        .update({ name: nameToSave })
        .eq("id", digimonId);
        
      if (error) throw error;
      
      // Refresh the Digimon data
      await fetchAllUserDigimon();
      
      // Exit edit mode
      setEditingName(null);
    } catch (error) {
      console.error("Error updating Digimon name:", error);
    }
  };

  // Add function to cancel editing
  const handleCancelEdit = () => {
    setEditingName(null);
    setNewName("");
  };

  // Add keyboard event handlers for the input field
  const handleKeyDown = (e: React.KeyboardEvent, digimonId: string) => {
    if (e.key === 'Enter') {
      // Enter key pressed - save the name
      handleSaveName(digimonId);
    } else if (e.key === 'Escape') {
      // Escape key pressed - cancel editing
      handleCancelEdit();
    }
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

      {/* Digimon Detail Modal */}
      {selectedDetailDigimon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">Digimon Details</h3>
              <button 
                onClick={handleCloseDetailModal}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Image and basic info */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mt-4 mb-8">
                  <img 
                    src={selectedDetailDigimon.digimon?.sprite_url} 
                    alt={selectedDetailDigimon.name || selectedDetailDigimon.digimon?.name} 
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                
                <div className="text-center mb-4">
                  <h4 className="text-xl font-semibold">
                    {selectedDetailDigimon.name || "No Nickname"}
                  </h4>
                  <p className="text-gray-600">
                    {selectedDetailDigimon.digimon?.name}
                  </p>
                  <p className="text-gray-600">
                    Stage: {selectedDetailDigimon.digimon?.stage}
                  </p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Lv. {selectedDetailDigimon.current_level}
                    </span>
                    {selectedDetailDigimon.is_on_team && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Team
                      </span>
                    )}
                    {selectedDetailDigimon.is_active && (
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Age: {calculateAgeDays(selectedDetailDigimon.created_at)} days
                  </p>
                </div>
                
                {/* Status bars */}
                <div className="w-full space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span>{selectedDetailDigimon.health}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          selectedDetailDigimon.health >= 60 ? 'bg-green-500' : 
                          selectedDetailDigimon.health >= 30 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${selectedDetailDigimon.health}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Happiness</span>
                      <span>{selectedDetailDigimon.happiness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          selectedDetailDigimon.happiness >= 60 ? 'bg-green-500' : 
                          selectedDetailDigimon.happiness >= 30 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${selectedDetailDigimon.happiness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experience</span>
                      <span>{selectedDetailDigimon.experience_points}/{selectedDetailDigimon.current_level * 20}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (selectedDetailDigimon.experience_points / (selectedDetailDigimon.current_level * 20)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Stats and evolution */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Stats</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">HP</span>
                    <p className="text-lg">
                      {statModifier(
                        selectedDetailDigimon.current_level,
                        selectedDetailDigimon.digimon?.hp_level1 ?? 0,
                        selectedDetailDigimon.digimon?.hp ?? 0,
                        selectedDetailDigimon.digimon?.hp_level99 ?? 0
                      )}+{selectedDetailDigimon.hp_bonus ?? 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">SP</span>
                    <p className="text-lg">{statModifier(selectedDetailDigimon.current_level, selectedDetailDigimon.digimon?.sp_level1 ?? 0, selectedDetailDigimon.digimon?.sp ?? 0, selectedDetailDigimon.digimon?.sp_level99 ?? 0)}+{selectedDetailDigimon.sp_bonus ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">ATK</span>
                    <p className="text-lg">{statModifier(selectedDetailDigimon.current_level, selectedDetailDigimon.digimon?.atk_level1 ?? 0, selectedDetailDigimon.digimon?.atk ?? 0, selectedDetailDigimon.digimon?.atk_level99 ?? 0)}+{selectedDetailDigimon.atk_bonus ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">DEF</span>
                    <p className="text-lg">{statModifier(selectedDetailDigimon.current_level, selectedDetailDigimon.digimon?.def_level1 ?? 0, selectedDetailDigimon.digimon?.def ?? 0, selectedDetailDigimon.digimon?.def_level99 ?? 0)}+{selectedDetailDigimon.def_bonus ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">INT</span>
                    <p className="text-lg">{statModifier(selectedDetailDigimon.current_level, selectedDetailDigimon.digimon?.int_level1 ?? 0, selectedDetailDigimon.digimon?.int ?? 0, selectedDetailDigimon.digimon?.int_level99 ?? 0)}+{selectedDetailDigimon.int_bonus ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">SPD</span>
                    <p className="text-lg">{statModifier(selectedDetailDigimon.current_level, selectedDetailDigimon.digimon?.spd_level1 ?? 0, selectedDetailDigimon.digimon?.spd ?? 0, selectedDetailDigimon.digimon?.spd_level99 ?? 0)}+{selectedDetailDigimon.spd_bonus ?? 0}</p>
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold mb-3">Evolution Options</h4>
                {evolutionData[selectedDetailDigimon.digimon_id]?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {evolutionData[selectedDetailDigimon.digimon_id].map((option) => {
                      const meetsLevelRequirement = selectedDetailDigimon.current_level >= option.level_required;
                      const discovered = isDiscovered(option.digimon_id);
                      
                      return (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-2 ${
                            meetsLevelRequirement 
                              ? "border-primary-300 bg-primary-50" 
                              : "border-gray-300 bg-gray-50 opacity-70"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 mr-2 flex items-center justify-center">
                              {discovered ? (
                                <img 
                                  src={option.sprite_url} 
                                  alt={option.name}
                                  style={{ imageRendering: "pixelated" }}
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center">
                                  <img 
                                    src={option.sprite_url} 
                                    alt="Unknown Digimon"
                                    style={{ imageRendering: "pixelated" }} 
                                    className="brightness-0 opacity-70"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {discovered ? option.name : "???"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {discovered ? option.stage : "Unknown"} (Lv. {option.level_required})
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No evolution options available.</p>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  {/* Action buttons */}
                  {!selectedDetailDigimon.is_active && (
                    <button
                      onClick={() => {
                        handleSwitchDigimon(selectedDetailDigimon.id);
                        handleCloseDetailModal();
                      }}
                      className="btn-primary"
                    >
                      Set Active
                    </button>
                  )}
                  
                  {evolutionData[selectedDetailDigimon.digimon_id]?.some(
                    option => selectedDetailDigimon.current_level >= option.level_required
                  ) && (
                    <button
                      onClick={() => {
                        handleShowEvolutionModal(selectedDetailDigimon.id);
                        handleCloseDetailModal();
                      }}
                      className="btn-secondary"
                    >
                      Digivolve
                    </button>
                  )}
                  
                  {!selectedDetailDigimon.is_active && (
                    <button
                      onClick={() => {
                        handleReleaseClick(selectedDetailDigimon.id);
                        handleCloseDetailModal();
                      }}
                      className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Release
                    </button>
                  )}
                </div>
              </div>
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
                className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleShowDetailModal(digimon.id)}
              >
                <div className="p-4">
                  <div className="flex flex-col mb-2">
                    {/* Name section */}
                    <div className="flex items-center justify-between">
                      {editingName === digimon.id ? (
                        <div className="flex items-center w-full">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, digimon.id)}
                            className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            maxLength={20}
                            placeholder={digimon.digimon?.name || "Enter nickname"}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-shrink-0 flex ml-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveName(digimon.id);
                              }}
                              className="p-1 bg-green-100 text-green-600 hover:bg-green-200 rounded-md"
                              title="Save name (or press Enter)"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md ml-1"
                              title="Cancel (or press Escape)"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold">
                            {digimon.name || digimon.digimon?.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditName(digimon.id, digimon.name, digimon.digimon?.name || "");
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Edit name"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </>
                      )}
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
                      <img 
                        src={digimon.digimon?.sprite_url} 
                        alt={digimon.name || digimon.digimon?.name} 
                        className="scale-[1.5]"
                        style={{ imageRendering: "pixelated" }}
                      />
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