import { useState, useEffect } from "react";
import { UserDigimon, useDigimonStore } from "../store/petStore";
import { motion, AnimatePresence } from "framer-motion";
import statModifier, { DigimonAttribute, DigimonType } from "../store/battleStore";
import { supabase } from "../lib/supabase";
import TypeAttributeIcon from "./TypeAttributeIcon";

// Define the stat types
type StatType = "HP" | "SP" | "ATK" | "DEF" | "INT" | "SPD";

interface DigimonDetailModalProps {
  selectedDigimon: UserDigimon | null;
  onClose: () => void;
  onSetActive?: (digimonId: string) => Promise<void>;
  onShowEvolution?: (digimonId: string) => void;
  onRelease?: (digimonId: string) => void;
  onNameChange?: (updatedDigimon: UserDigimon) => void;
  evolutionData?: {[key: number]: any[]};
  className?: string;
  onShowDevolution?: (digimonId: string) => void;
}

const DigimonDetailModal: React.FC<DigimonDetailModalProps> = ({
  selectedDigimon,
  onClose,
  onSetActive,
  onShowEvolution,
  onRelease,
  evolutionData = {},
  onNameChange,
  className = "",
  onShowDevolution,
}) => {
  const { discoveredDigimon } = useDigimonStore();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(1);
  const [savedStats, setSavedStats] = useState<Record<string, number>>({
    hp: 0, sp: 0, atk: 0, def: 0, int: 0, spd: 0
  });
  const [allocating, setAllocating] = useState(false);
  const [belongsToCurrentUser, setBelongsToCurrentUser] = useState(false);

  useEffect(() => {
    // Check if the Digimon belongs to the current user
    const checkOwnership = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && selectedDigimon) {
        setBelongsToCurrentUser(userData.user.id === selectedDigimon.user_id);
      } else {
        setBelongsToCurrentUser(false);
      }
    };
    
    checkOwnership();
  }, [selectedDigimon]);

  useEffect(() => {
    // Load saved stats from localStorage and database
    const loadSavedStats = async () => {
      // First try localStorage for immediate display
      const localStats = localStorage.getItem("savedStats");
      if (localStats) {
        setSavedStats(JSON.parse(localStats));
      }
      
      // Then fetch from database for accuracy
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("saved_stats")
          .eq("id", userData.user.id)
          .single();
          
        if (profileData && profileData.saved_stats) {
          setSavedStats(profileData.saved_stats);
          localStorage.setItem("savedStats", JSON.stringify(profileData.saved_stats));
        }
      }
    };
    
    loadSavedStats();
  }, []);

  // Function to allocate a stat point
  const allocateStat = async (statType: StatType) => {
    // Check for both uppercase and lowercase keys
    const upperType = statType.toUpperCase() as StatType;
    const lowerType = statType.toLowerCase() as StatType;
    
    // Get the stat value regardless of case
    const statValue = savedStats[upperType] || savedStats[lowerType] || 0;
    
    if (statValue <= 0 || allocating || !selectedDigimon) return;
    
    try {
      setAllocating(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setAllocating(false);
        return;
      }
      
      // Make a copy of the current digimon for UI updates
      const currentDigimon = { ...selectedDigimon };
      
      // Call the RPC function - use the same case as in the database (uppercase for keys, lowercase for field names)
      const { data, error } = await supabase.rpc('allocate_stat', {
        p_digimon_id: selectedDigimon.id,
        p_stat_type: upperType, // Keep uppercase for the saved_stats keys
        p_user_id: userData.user.id
      });
      
      if (error) throw error;
      
      if (!data) {
        throw new Error("Failed to allocate stat - no stats available");
      }
      
      // Refresh saved stats
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("saved_stats")
        .eq("id", userData.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Update local saved stats
      const newSavedStats = profileData?.saved_stats || {
        HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0
      };
      setSavedStats(newSavedStats);
      localStorage.setItem("savedStats", JSON.stringify(newSavedStats));
      
      // Update the local digimon object with the new stat - use lowercase for field names
      const statField = `${lowerType}_bonus`;
      const currentBonus = (currentDigimon as any)[statField] || 0;
      const updatedDigimon = {
        ...currentDigimon,
        [statField]: currentBonus + 1
      };
      
      // Notify the parent component about the change
      if (onNameChange) {
        onNameChange(updatedDigimon);
      }
      
      // Update the pet store's userDailyStatGains
      useDigimonStore.getState().fetchUserDailyStatGains();
      
      setAllocating(false);
    } catch (error) {
      console.error("Error allocating stat:", error);
      setAllocating(false);
    }
  };

  // Update the renderStatRow function to be more compact
  const renderStatRow = (
    label: StatType, 
    baseValue: number,
    bonusValue: number
  ) => {
    // Check for both uppercase and lowercase keys
    const upperLabel = label.toUpperCase();
    const lowerLabel = label.toLowerCase();
    
    // Get the stat value regardless of case
    const statValue = savedStats[upperLabel] || savedStats[lowerLabel] || 0;
    
    return (
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        <div className="flex items-center">
          <div className="text-right mr-2">
            <span className="font-semibold">{baseValue}</span>
            <span className={bonusValue > 0 ? "text-green-600 ml-1" : "text-gray-400 ml-1"}>
              (+{bonusValue})
            </span>
          </div>
          
          {/* Allocation Button */}
          {statValue > 0 && belongsToCurrentUser && (
            <button 
              className="w-6 h-6 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full flex items-center justify-center relative"
              onClick={() => allocateStat(lowerLabel as StatType)}
              disabled={allocating}
            >
              <span className="text-xs">+</span>
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]">
                {statValue}
              </span>
            </button>
          )}
          
          {/* Placeholder for when there are no stats to allocate */}
          {(statValue <= 0 || !belongsToCurrentUser) && (
            <div className="w-6"></div>
          )}
        </div>
      </div>
    );
  };

  if (!selectedDigimon) return null;

  // Add a helper function to calculate age in days
  const calculateAgeDays = (createdAt: string): number => {
    const creationDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Add this function to handle sprite clicks in the modal
  const handleModalSpriteClick = () => {
    if (isAnimating) return; // Prevent multiple animations
    
    setIsAnimating(true);
    
    // Random chance (1/5) to show heart
    if (Math.random() < 0.2) {
      setShowHeart(true);
    }
    
    // Look left and right sequence
    setTimeout(() => setLookDirection(-1), 200);
    setTimeout(() => setLookDirection(1), 400);
    
    // End animations
    setTimeout(() => {
      setIsAnimating(false);
      setShowHeart(false);
      setLookDirection(1); // Reset direction to neutral scale
    }, 1000);
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
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Exit edit mode
      setEditingName(null);
      
      // IMPORTANT: Create a modified copy of selectedDigimon with the new name
      // This is crucial for the UI to update immediately
      const updatedDigimon = {
        ...selectedDigimon,
        name: nameToSave
      };
      
      // Force a re-render by dispatching a custom event with the updated digimon
      window.dispatchEvent(new CustomEvent('digimon-name-changed', { 
        detail: { digimonId, newName: nameToSave }
      }));
      
      // This is the key part - directly update the parent component's state
      // by passing the updated digimon back through a callback
      if (onNameChange) {
        onNameChange(updatedDigimon);
      }
    } catch (error) {
      console.error("Error updating Digimon name:", error);
      alert("Failed to update name. Please try again.");
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

  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };

  // Define animation variants
  const animationVariants = {
    hop: {
      y: [0, -10, 0, -7, 0],
      transition: { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }
    },
    idle: { y: 0 }
  };
  
  const heartVariants = {
    initial: { opacity: 0, scale: 0, y: 0 },
    animate: { 
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
      y: -30,
      transition: { duration: 1 }
    }
  };

  // Get evolution options for this Digimon
  const evolutions = evolutionData[selectedDigimon.digimon_id] || [];

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ${className}`}
      onClick={(e) => {
        // Only close if clicking the backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold">Digimon Details</h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="md:w-2/5 flex flex-col items-center">
            <div className="w-32 h-32 mt-4 mb-8 relative">
              <motion.img 
                src={selectedDigimon.digimon?.sprite_url} 
                alt={selectedDigimon.name || selectedDigimon.digimon?.name} 
                className="w-full h-full object-contain cursor-pointer"
                style={{ 
                  imageRendering: "pixelated",
                  transform: `scale(${lookDirection}, 1)`
                }}
                animate={isAnimating ? "hop" : "idle"}
                variants={animationVariants}
                onClick={handleModalSpriteClick}
              />
              
              {/* Heart animation */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2"
                    variants={heartVariants}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-3xl">❤️</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="text-center mb-1">
              {editingName === selectedDigimon.id ? (
                <div className="flex items-center justify-center mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, selectedDigimon.id)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={20}
                    placeholder={selectedDigimon.digimon?.name || "Enter nickname"}
                    autoFocus
                  />
                  <div className="flex ml-1">
                    <button
                      onClick={() => handleSaveName(selectedDigimon.id)}
                      className="p-1 bg-green-100 text-green-600 hover:bg-green-200 rounded-md"
                      title="Save name (or press Enter)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEdit}
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
                <div className="flex items-center justify-center mb-2">
                  <h4 className="text-xl font-semibold mr-1">
                    {selectedDigimon.name || selectedDigimon.digimon?.name}
                  </h4>
                  <button
                    onClick={() => handleEditName(selectedDigimon.id, selectedDigimon.name, selectedDigimon.digimon?.name || "")}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Edit name"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex justify-center space-x-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Lv. {selectedDigimon.current_level}
                </span>
                {selectedDigimon.is_on_team && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Team
                  </span>
                )}
                {selectedDigimon.is_active && (
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Age: {calculateAgeDays(selectedDigimon.created_at)} days
              </p>
            </div>

            {/* Description - keep as is */}
            <p className="text-center text-gray-600 mb-2">
              {`${selectedDigimon.digimon?.name} is a ${selectedDigimon.digimon?.attribute} ${selectedDigimon.digimon?.type}, ${selectedDigimon.digimon?.stage} level Digimon.`}
            </p>
            <div className="flex justify-center mb-2">
              <TypeAttributeIcon
                type={selectedDigimon.digimon?.type as DigimonType}
                attribute={selectedDigimon.digimon?.attribute as DigimonAttribute}
                size="md"
                showLabel={false}
              />
            </div>
            {/* Status bars - keep as is */}
            <div className="w-full space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Happiness</span>
                  <span>{selectedDigimon.happiness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      selectedDigimon.happiness >= 60 ? 'bg-green-500' : 
                      selectedDigimon.happiness >= 30 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${selectedDigimon.happiness}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Experience</span>
                  <span>{selectedDigimon.experience_points}/{selectedDigimon.current_level * 20}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (selectedDigimon.experience_points / (selectedDigimon.current_level * 20)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="flex flex-col h-full md:w-3/5">
            <div className="flex-grow">
              <h4 className="text-lg font-semibold mb-2">Stats</h4>

              {/* Add a section showing total available stat points if any */}
              {Object.values(savedStats).some(val => val > 0) && belongsToCurrentUser && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    You have saved stat points to allocate! Click the + buttons to improve this Digimon.
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {renderStatRow(
                  "HP",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.hp_level1 ?? 0,
                    selectedDigimon.digimon?.hp ?? 0,
                    selectedDigimon.digimon?.hp_level99 ?? 0
                  ),
                  selectedDigimon.hp_bonus ?? 0
                )}
                
                {renderStatRow(
                  "SP",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.sp_level1 ?? 0,
                    selectedDigimon.digimon?.sp ?? 0,
                    selectedDigimon.digimon?.sp_level99 ?? 0
                  ),
                  selectedDigimon.sp_bonus ?? 0
                )}
                
                {renderStatRow(
                  "ATK",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.atk_level1 ?? 0,
                    selectedDigimon.digimon?.atk ?? 0,
                    selectedDigimon.digimon?.atk_level99 ?? 0
                  ),
                  selectedDigimon.atk_bonus ?? 0
                )}
                
                {renderStatRow(
                  "DEF",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.def_level1 ?? 0,
                    selectedDigimon.digimon?.def ?? 0,
                    selectedDigimon.digimon?.def_level99 ?? 0
                  ),
                  selectedDigimon.def_bonus ?? 0
                )}

                {renderStatRow(
                  "INT",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.int_level1 ?? 0,
                    selectedDigimon.digimon?.int ?? 0,
                    selectedDigimon.digimon?.int_level99 ?? 0
                  ),
                  selectedDigimon.int_bonus ?? 0
                )}
                
                {renderStatRow(
                  "SPD",
                  statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.spd_level1 ?? 0,
                    selectedDigimon.digimon?.spd ?? 0,
                    selectedDigimon.digimon?.spd_level99 ?? 0
                  ),
                  selectedDigimon.spd_bonus ?? 0
                )}
              </div>
              
              {/* Evolution Options - Only show for the current user's Digimon */}
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Evolution Options</h4> 
                {belongsToCurrentUser ? (
                  evolutions?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {evolutions.map((option) => {
                        // Calculate base stats for current level
                        const baseHP = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.hp_level1 ?? 0,
                          selectedDigimon.digimon?.hp ?? 0,
                          selectedDigimon.digimon?.hp_level99 ?? 0
                        );
                        
                        const baseSP = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.sp_level1 ?? 0,
                          selectedDigimon.digimon?.sp ?? 0,
                          selectedDigimon.digimon?.sp_level99 ?? 0
                        );
                        
                        const baseATK = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.atk_level1 ?? 0,
                          selectedDigimon.digimon?.atk ?? 0,
                          selectedDigimon.digimon?.atk_level99 ?? 0
                        );
                        
                        const baseDEF = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.def_level1 ?? 0,
                          selectedDigimon.digimon?.def ?? 0,
                          selectedDigimon.digimon?.def_level99 ?? 0
                        );
                        
                        const baseINT = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.int_level1 ?? 0,
                          selectedDigimon.digimon?.int ?? 0,
                          selectedDigimon.digimon?.int_level99 ?? 0
                        );
                        
                        const baseSPD = statModifier(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.spd_level1 ?? 0,
                          selectedDigimon.digimon?.spd ?? 0,
                          selectedDigimon.digimon?.spd_level99 ?? 0
                        );
                        
                        // Check level requirement
                        const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;
                        
                        // Check stat requirements
                        let meetsStatRequirements = true;
                        const statRequirementsList = [];
                        
                        if (option.stat_requirements) {
                          const statReqs = option.stat_requirements;
                          
                          // Check each stat requirement and build display list
                          if (statReqs.hp && statReqs.hp > 0) {
                            const currentHP = baseHP + (selectedDigimon.hp_bonus || 0);
                            if (currentHP < statReqs.hp) meetsStatRequirements = false;
                            statRequirementsList.push({
                              name: 'HP',
                              current: currentHP,
                              required: statReqs.hp,
                              meets: currentHP >= statReqs.hp
                            });
                          }
                          
                          if (statReqs.sp && statReqs.sp > 0) {
                            const currentSP = baseSP + (selectedDigimon.sp_bonus || 0);
                            if (currentSP < statReqs.sp) meetsStatRequirements = false;
                            statRequirementsList.push({
                              name: 'SP',
                              current: currentSP,
                              required: statReqs.sp,
                              meets: currentSP >= statReqs.sp
                            });
                          }
                          
                          if (statReqs.atk && statReqs.atk > 0) {
                            const currentATK = baseATK + (selectedDigimon.atk_bonus || 0);
                            if (currentATK < statReqs.atk) meetsStatRequirements = false;
                            statRequirementsList.push({
                              name: 'ATK',
                              current: currentATK,
                              required: statReqs.atk,
                              meets: currentATK >= statReqs.atk
                            });
                          }
                          
                          if (statReqs.def && statReqs.def > 0) {
                            const currentDEF = baseDEF + (selectedDigimon.def_bonus || 0);
                            if (currentDEF < statReqs.def) meetsStatRequirements = false;
                            statRequirementsList.push({
                              name: 'DEF',
                              current: currentDEF,
                              required: statReqs.def,
                              meets: currentDEF >= statReqs.def
                            });
                          }
                          
                          if (statReqs.int && statReqs.int > 0) {
                            const currentINT = baseINT + (selectedDigimon.int_bonus || 0);
                            if (currentINT < statReqs.int) meetsStatRequirements = false;
                            statRequirementsList.push({
                              name: 'INT',
                              current: currentINT,
                              required: statReqs.int,
                              meets: currentINT >= statReqs.int
                            });
                          }
                          
                          if (statReqs.spd && statReqs.spd > 0) {
                            const currentSPD = baseSPD + (selectedDigimon.spd_bonus || 0);
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
                            className={`border rounded-lg p-2 ${
                              canEvolve 
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
                              <div className="flex-1 hidden sm:block">
                                <p className="font-medium text-sm">
                                  {discovered ? option.name : "???"}
                                </p>
                                <div className="flex justify-between">
                                  <p className="text-xs text-gray-500">
                                    {discovered ? option.stage : "Unknown"}
                                  </p>
                                  {/* <p className={`text-xs ${meetsLevelRequirement ? "text-green-600" : "text-red-600"}`}>
                                    Lv. {option.level_required}
                                  </p> */}
                                </div>
                                
                                {/* Add stat requirements display */}
                                {/* {statRequirementsList.length > 0 && (
                                  <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1">
                                    {statRequirementsList.map(stat => (
                                      <div key={stat.name} className="flex justify-between text-xs">
                                        <span>{stat.name}:</span>
                                        <span className={stat.meets ? "text-green-600" : "text-red-600"}>
                                          {stat.current}/{stat.required}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )} */}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No evolution options available.</p>
                  )
                ) : (
                  <p className="text-gray-500 text-sm">Evolution options are only visible to the Digimon's owner.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Update the buttons section at the bottom of the modal */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full mt-4">
          {/* All the buttons */}
          {!selectedDigimon.is_active && onSetActive && (
            <button
              onClick={() => {
                onSetActive(selectedDigimon.id);
                onClose();
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Set Active
            </button>
          )}
          
          {/* Active indicator - show instead of Set Active button if already active */}
          {selectedDigimon.is_active && (
            <div className="flex-1 bg-blue-100 text-blue-800 py-2 px-4 rounded text-center">
              Active
            </div>
          )}

          {/* Release button - only show if NOT active */}
          {!selectedDigimon.is_active && onRelease && (
            <button
              onClick={() => {
                onRelease(selectedDigimon.id);
                onClose();
              }}
              className="flex-1 border border-red-500 bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded"
            >
              Release
            </button>
          )}

          {/* Digivolve button - only show if evolution options exist */}
          {evolutions?.length > 0 && onShowEvolution && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                onShowEvolution(selectedDigimon.id);
              }}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            >
              Digivolve
            </button>
          )}

          {/* De-Digivolve button */}
          {onShowDevolution && (
            <button
              onClick={() => onShowDevolution(selectedDigimon.id)}
              className="flex-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 py-2 px-4"
            >
              De-Digivolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigimonDetailModal; 