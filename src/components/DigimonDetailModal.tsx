import { useState, useEffect } from "react";
import { EvolutionOption, UserDigimon, getRemainingStatPoints, useDigimonStore } from "../store/petStore";
import calculateBaseStat, { calculateFinalStats } from "../utils/digimonStatCalculation";
import { DigimonAttribute, DigimonType } from "../store/battleStore";
import { supabase } from "../lib/supabase";
import TypeAttributeIcon from "./TypeAttributeIcon";
import DigimonEvolutionModal from "./DigimonEvolutionModal";
import { StatType, isUnderStatCap } from "../store/petStore";
import DigimonSprite from "./DigimonSprite";
import PageTutorial from "./PageTutorial";
import { DialogueStep } from "./DigimonDialogue";

interface DigimonDetailModalProps {
  selectedDigimon: UserDigimon | null;
  onClose: () => void;
  onSetActive?: (digimonId: string) => Promise<void>;
  onNameChange?: (updatedDigimon: UserDigimon) => void;
  className?: string;
}

const DigimonDetailModal: React.FC<DigimonDetailModalProps> = ({
  selectedDigimon,
  onClose,
  onSetActive,
  onNameChange,
  className = "",
}) => {
  const { discoveredDigimon, evolveDigimon, devolveDigimon, allUserDigimon } = useDigimonStore();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedStats, setSavedStats] = useState<Record<string, number>>({
    hp: 0, sp: 0, atk: 0, def: 0, int: 0, spd: 0,
  });
  const [allocating, setAllocating] = useState(false);
  const [belongsToCurrentUser, setBelongsToCurrentUser] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showDevolutionModal, setShowDevolutionModal] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [devolutionError, setDevolutionError] = useState<string | null>(null);
  const [devolutionOptions, setDevolutionOptions] = useState<EvolutionOption[]>([]);
  const [evolutionOptions, setEvolutionOptions] = useState<EvolutionOption[]>([]);

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
    // Get the available stat points for this type
    const upperType = statType.toUpperCase();
    const availablePoints = savedStats[upperType] || 0;

    if (availablePoints <= 0 || allocating || !selectedDigimon) return;
    
    try {
      setAllocating(true);

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setAllocating(false);
        return;
      }
      
      // Calculate the new bonus value
      const statField = `${statType.toLowerCase()}_bonus`;
      const currentBonus = (selectedDigimon as any)[statField] || 0;
      const newBonus = currentBonus + 1;

      // 1. OPTIMISTIC UPDATE: Immediately update the UI with the new value
      // Create a copy of the selectedDigimon with the updated stat
      const updatedDigimon = {
        ...selectedDigimon,
        [statField]: newBonus
      };
      
      // 2. Update the local state immediately
      if (onNameChange) {
        onNameChange(updatedDigimon);
      }
      
      // 3. Update the global store state immediately for UI consistency
      useDigimonStore.getState().updateDigimonInStore(updatedDigimon);
      
      // 4. Optimistically update the savedStats display
      const newSavedStats = { ...savedStats };
      newSavedStats[upperType] = Math.max(0, (newSavedStats[upperType] || 0) - 1);
      setSavedStats(newSavedStats);
      localStorage.setItem("savedStats", JSON.stringify(newSavedStats));

      // 5. Now perform the actual database update in the background
      const { error } = await supabase.rpc('allocate_stat', {
        p_digimon_id: selectedDigimon.id,
        p_stat_type: upperType,
        p_user_id: userData.user.id
      });

      if (error) {
        // If error, revert the optimistic update
        if (onNameChange) {
          onNameChange(selectedDigimon); // Revert to original
        }
        
        // Revert the store update
        useDigimonStore.getState().updateDigimonInStore(selectedDigimon);
        
        // Revert the savedStats
        const originalSavedStats = { ...savedStats };
        setSavedStats(originalSavedStats);
        localStorage.setItem("savedStats", JSON.stringify(originalSavedStats));
        
        throw error;
      }

      // 6. Fetch the updated saved stats from the database (in the background)
      supabase
        .from("profiles")
        .select("saved_stats")
        .eq("id", userData.user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData?.saved_stats) {
            // Only update if different from our optimistic update
            if (JSON.stringify(profileData.saved_stats) !== JSON.stringify(newSavedStats)) {
              setSavedStats(profileData.saved_stats);
              localStorage.setItem("savedStats", JSON.stringify(profileData.saved_stats));
            }
          }
        });
      
      // 7. In the background, refresh other relevant data
      useDigimonStore.getState().fetchUserDailyStatGains();
      
    } catch (error) {
      console.error("Error allocating stat:", error);
      // Error notification can be added here if needed
    } finally {
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
              {bonusValue > 0 ? `(+${bonusValue})` : ""}
            </span>
          </div>
          
          {/* Allocation Button */}
          {belongsToCurrentUser && statValue > 0 && isUnderStatCap(selectedDigimon) && (
            <button 
              className="w-6 h-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full flex items-center justify-center relative"
              onClick={() => allocateStat(lowerLabel as StatType)}
              disabled={allocating}
            >
              <span className="text-xs">+</span>
              <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {statValue}
              </span>
            </button>
          )}
          
          {/* Placeholder for when there are no stats to allocate */}
          {(statValue <= 0 || !belongsToCurrentUser || !isUnderStatCap(selectedDigimon)) && (
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
  };

  // Add function to handle name editing
  const handleEditName = (id: string, currentName: string, originalName: string) => {
    setEditingName(id); // Set to the ID string, not boolean
    setNewName(currentName || originalName);
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
      handleSaveName(digimonId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Check if a Digimon has been discovered
  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };

  const stats = calculateFinalStats(selectedDigimon);

  // Handle evolution
  const handleEvolution = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      await evolveDigimon(toDigimonId, selectedDigimon.id);
      onClose();
    } catch (error) {
      console.error("Evolution error:", error);
      setEvolutionError((error as Error).message);
    }
  };
  
  // Handle devolution
  const handleDevolution = async (toDigimonId: number) => {
    try {
      setDevolutionError(null);
      setShowDevolutionModal(false);
      onClose();
      await devolveDigimon(toDigimonId, selectedDigimon.id);
    } catch (error) {
      setDevolutionError((error as Error).message);
    }
  };

  // Add this useEffect to fetch devolution options when the modal opens
  useEffect(() => {
    const loadDevolutionOptions = async () => {
      if (!selectedDigimon || !selectedDigimon.digimon_id) return;
      
      const options = await useDigimonStore.getState().fetchDevolutionOptions(selectedDigimon.digimon_id);
      setDevolutionOptions(options);
    };
    
    loadDevolutionOptions();
  }, [selectedDigimon]);

  // Add this useEffect to fetch evolution options when the modal opens or digimon changes
  useEffect(() => {
    const loadEvolutionOptions = async () => {
      if (!selectedDigimon || !selectedDigimon.digimon_id) return;
      
      const options = await useDigimonStore.getState().fetchEvolutionOptions(selectedDigimon.digimon_id);
      setEvolutionOptions(options);
    };
    
    loadEvolutionOptions();
  }, [selectedDigimon]);

  const digimonDetailModalTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Here you can see more details about your Digimon, including their stats, level, and evolution options."
    },
    {
      speaker: 'neemon',
      text: "Oh, you can also change their nickname here!"
    },
    {
      speaker: 'bokomon',
      text: "You can also allocate stat points gained from your tasks here, as well as evolve and devolve your Digimon."
    },
    {
      speaker: 'bokomon',
      text: "There's a lot of important information here about your Digimon. Your Digimon has a personality, which increases one of their stats by 5%!"
    },
    {
      speaker: 'neemon',
      text: `Ooh, your Digimon's personality is ${selectedDigimon.personality}!`
    },
    {
      speaker: 'bokomon',
      text: "Click the Digivolve button to view possible evolutions for your Digimon!"
    },
    {
      speaker: 'neemon',
      text: "You can also click the Devolve button to view possible devolutions for your Digimon!"
    },
  ];

  return (
    <>
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
        className="bg-white rounded-lg px-6 pb-4 pt-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
          {/* X Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="md:w-2/5 flex flex-col items-center">
            <div className="w-32 h-32 flex items-center justify-center mt-4 mb-8">
              <DigimonSprite
                digimonName={selectedDigimon.digimon?.name || ""}
                fallbackSpriteUrl={selectedDigimon.digimon?.sprite_url || "/assets/pet/egg.svg"}
                happiness={selectedDigimon.happiness}
                size="lg"
                onClick={handleModalSpriteClick}
              />
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      handleEditName(selectedDigimon.id, selectedDigimon.name, selectedDigimon.digimon?.name || "");
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 z-10" // Add z-index
                    title="Edit name"
                    type="button" // Explicitly set button type
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
                {selectedDigimon.has_x_antibody && (
                <div className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  <span className="text-sm font-medium text-indigo-600">X-Antibody</span>
                </div>
              )}
              </div>
              <div className="grid grid-cols-2 gap-x-1 text-sm text-gray-500 mt-2">
                <p className="text-right">Age:</p>
                <p className="text-left">{calculateAgeDays(selectedDigimon.created_at)} days</p>

                <p className="text-right">Personality:</p>
                <p className="text-left">{selectedDigimon.personality}</p>
              </div>
            </div>

            {/* Description - fix the nesting issue */}
            <div className="text-center text-gray-600 text-sm mt-1 mb-2 flex flex-wrap items-center justify-center gap-x-1">
              <span>{`${selectedDigimon.digimon?.name} is a `}</span>
              <TypeAttributeIcon
                type={selectedDigimon.digimon?.type as DigimonType}
                attribute={selectedDigimon.digimon?.attribute as DigimonAttribute}
                size="sm"
                showLabel={false}
              />
              <span>{`${selectedDigimon.digimon?.attribute} ${selectedDigimon.digimon?.type}, ${selectedDigimon.digimon?.stage} Digimon.`}</span>
            </div>
            {/* Status bars - keep as is */}
            <div className="w-full space-y-4 mb-6 mt-4">
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
                <div className="text-xs text-gray-500 text-right mt-1">
                  {20 * selectedDigimon.current_level * (selectedDigimon.current_level - 1) / 2 + selectedDigimon.experience_points} Total EXP
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
                <div className="mb-3 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    {isUnderStatCap(selectedDigimon) ? "You have saved stat points to allocate! " + getRemainingStatPoints(selectedDigimon) + " stat points until cap." : "This Digimon has reached its stat cap. Increase its ABI through evolution and devolution to unlock more stat points."}
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {renderStatRow("HP", stats.hp, selectedDigimon.hp_bonus)}
                {renderStatRow("SP", stats.sp, selectedDigimon.sp_bonus)}
                {renderStatRow("ATK", stats.atk, selectedDigimon.atk_bonus)}
                {renderStatRow("DEF", stats.def, selectedDigimon.def_bonus)}
                {renderStatRow("INT", stats.int, selectedDigimon.int_bonus)}
                {renderStatRow("SPD", stats.spd, selectedDigimon.spd_bonus)}
                {renderStatRow("ABI", selectedDigimon.abi, 0)}
              </div>
              
              {/* Evolution Options - Only show for the current user's Digimon */}
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Evolution Options</h4>
                {belongsToCurrentUser ? (
                  evolutionOptions.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {evolutionOptions.map((option) => {
                        // Calculate base stats for current level
                        const baseHP = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.hp_level1 ?? 0,
                          selectedDigimon.digimon?.hp ?? 0,
                          selectedDigimon.digimon?.hp_level99 ?? 0
                        );
                        
                        const baseSP = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.sp_level1 ?? 0,
                          selectedDigimon.digimon?.sp ?? 0,
                          selectedDigimon.digimon?.sp_level99 ?? 0
                        );
                        
                        const baseATK = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.atk_level1 ?? 0,
                          selectedDigimon.digimon?.atk ?? 0,
                          selectedDigimon.digimon?.atk_level99 ?? 0
                        );
                        
                        const baseDEF = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.def_level1 ?? 0,
                          selectedDigimon.digimon?.def ?? 0,
                          selectedDigimon.digimon?.def_level99 ?? 0
                        );
                        
                        const baseINT = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.int_level1 ?? 0,
                          selectedDigimon.digimon?.int ?? 0,
                          selectedDigimon.digimon?.int_level99 ?? 0
                        );
                        
                        const baseSPD = calculateBaseStat(
                          selectedDigimon.current_level,
                          selectedDigimon.digimon?.spd_level1 ?? 0,
                          selectedDigimon.digimon?.spd ?? 0,
                          selectedDigimon.digimon?.spd_level99 ?? 0
                        );
                        
                        // Check level requirement
                        const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;
                        
                        // Check stat requirements
                        let meetsStatRequirements = true;
                        
                        if (option.stat_requirements) {
                          const statReqs = option.stat_requirements;
                          
                          if (statReqs.hp && statReqs.hp > 0) {
                            const currentHP = baseHP + 10 * (selectedDigimon.hp_bonus || 0);
                            if (currentHP < statReqs.hp) meetsStatRequirements = false;
                          }
                          
                          if (statReqs.sp && statReqs.sp > 0) {
                            const currentSP = baseSP + (selectedDigimon.sp_bonus || 0);
                            if (currentSP < statReqs.sp) meetsStatRequirements = false;
                          }
                          
                          if (statReqs.atk && statReqs.atk > 0) {
                            const currentATK = baseATK + (selectedDigimon.atk_bonus || 0);
                            if (currentATK < statReqs.atk) meetsStatRequirements = false;
                          }
                          
                          if (statReqs.def && statReqs.def > 0) {
                            const currentDEF = baseDEF + (selectedDigimon.def_bonus || 0);
                            if (currentDEF < statReqs.def) meetsStatRequirements = false;
                          }
                          
                          if (statReqs.int && statReqs.int > 0) {
                            const currentINT = baseINT + (selectedDigimon.int_bonus || 0);
                            if (currentINT < statReqs.int) meetsStatRequirements = false;
                          }
                          
                          if (statReqs.spd && statReqs.spd > 0) {
                            const currentSPD = baseSPD + (selectedDigimon.spd_bonus || 0);
                            if (currentSPD < statReqs.spd) meetsStatRequirements = false;
                          }

                          if (statReqs.abi && statReqs.abi > 0) {
                            const currentABI = selectedDigimon.abi || 0;
                            if (currentABI < statReqs.abi) meetsStatRequirements = false;
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
                                  <DigimonSprite
                                    digimonName={option.name}
                                    fallbackSpriteUrl={option.sprite_url}
                                    size="xs"
                                    showHappinessAnimations={false}
                                  />
                                ) : (
                                  <div className="w-10 h-10 flex items-center justify-center">
                                    <DigimonSprite
                                      digimonName={option.name}
                                      fallbackSpriteUrl={option.sprite_url}
                                      size="xs"
                                      showHappinessAnimations={false}
                                      silhouette={true}
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
                                </div>
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
              className="flex-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 py-2 px-4"
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

          {/* Digivolve button - only show if evolution options exist */}
          {belongsToCurrentUser && (
            <button
              onClick={() => setShowEvolutionModal(true)}
              className="flex-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 py-2 px-4"
            >
              Digivolve
            </button>
          )}

          {/* De-Digivolve button */}
          {belongsToCurrentUser && (
            <button
              onClick={() => setShowDevolutionModal(true)}
              className="flex-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 py-2 px-4"
            >
              De-Digivolve
            </button>
          )}
        </div>
      </div>
      
      {/* Evolution Modal */}
      <DigimonEvolutionModal
        isOpen={showEvolutionModal}
        onClose={() => {
          setShowEvolutionModal(false);
          // For DNA evolution, we need to make sure the detail modal closes too
          // This will be called after the animation completes
          onClose();
        }}
        selectedDigimon={selectedDigimon}
        options={evolutionOptions}
        onEvolve={handleEvolution}
        isDevolution={false}
        error={evolutionError}
        isDiscovered={isDiscovered}
        allUserDigimon={allUserDigimon}
      />
      
      {/* Devolution Modal */}
      <DigimonEvolutionModal
        isOpen={showDevolutionModal}
        onClose={() => setShowDevolutionModal(false)}
        selectedDigimon={selectedDigimon}
        options={devolutionOptions}
        onEvolve={handleDevolution}
        isDevolution={true}
        error={devolutionError}
        isDiscovered={isDiscovered}
        allUserDigimon={allUserDigimon}
      />
    </div>
    <PageTutorial tutorialId="digimon_detail_modal_intro" steps={digimonDetailModalTutorialSteps} />
    </>
  );
};

export default DigimonDetailModal; 