import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EvolutionOption, UserDigimon, getRemainingStatPoints, useDigimonStore } from "../store/petStore";
import { calculateFinalStats, xpForNextLevel, totalCumulativeXp } from "../utils/digimonStatCalculation";
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
  className = "",
}) => {
  const { discoveredDigimon, evolveDigimon, devolveDigimon, allUserDigimon } = useDigimonStore();
  const [localDigimon, setLocalDigimon] = useState<UserDigimon | null>(selectedDigimon);
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
    setLocalDigimon(selectedDigimon);
  }, [selectedDigimon]);

  useEffect(() => {
    // Check if the Digimon belongs to the current user
    const checkOwnership = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && localDigimon) {
        setBelongsToCurrentUser(userData.user.id === localDigimon.user_id);
      } else {
        setBelongsToCurrentUser(false);
      }
    };
    
    checkOwnership();
  }, [localDigimon]);

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

    if (availablePoints <= 0 || allocating || !localDigimon) return;
    
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
      const currentBonus = (localDigimon as any)[statField] || 0;
      const newBonus = currentBonus + 1;

      // 1. OPTIMISTIC UPDATE: Immediately update the UI with the new value
      // Create a copy of the selectedDigimon with the updated stat
      const updatedDigimon = {
        ...localDigimon,
        [statField]: newBonus
      };
      
      // 2. Update the local state immediately
      setLocalDigimon(updatedDigimon);
      
      // 3. Update the global store state immediately for UI consistency
      useDigimonStore.getState().updateDigimonInStore(updatedDigimon);
      
      // 4. Optimistically update the savedStats display
      const newSavedStats = { ...savedStats };
      newSavedStats[upperType] = Math.max(0, (newSavedStats[upperType] || 0) - 1);
      setSavedStats(newSavedStats);
      localStorage.setItem("savedStats", JSON.stringify(newSavedStats));

      // 5. Now perform the actual database update in the background
      const { error } = await supabase.rpc('allocate_stat', {
        p_digimon_id: localDigimon.id,
        p_stat_type: upperType,
        p_user_id: userData.user.id
      });

      if (error) {
        // If error, revert the optimistic update
        setLocalDigimon(localDigimon);
        
        // Revert the store update
        useDigimonStore.getState().updateDigimonInStore(localDigimon);
        
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

  // Stat bar color map
  const statColors: Record<string, string> = {
    HP: 'bg-red-500',
    SP: 'bg-cyan-500',
    ATK: 'bg-orange-500',
    DEF: 'bg-blue-500',
    INT: 'bg-purple-500',
    SPD: 'bg-green-500',
    ABI: 'bg-amber-500',
  };

  // Max reference values for progress bars (lv99 reference)
  const statMaxRef: Record<string, number> = {
    HP: localDigimon?.digimon?.hp_level99 ?? 2000,
    SP: localDigimon?.digimon?.sp_level99 ?? 600,
    ATK: localDigimon?.digimon?.atk_level99 ?? 600,
    DEF: localDigimon?.digimon?.def_level99 ?? 600,
    INT: localDigimon?.digimon?.int_level99 ?? 600,
    SPD: localDigimon?.digimon?.spd_level99 ?? 600,
    ABI: 200,
  };

  const renderStatRow = (
    label: StatType,
    baseValue: number,
    bonusValue: number
  ) => {
    const upperLabel = label.toUpperCase();
    const lowerLabel = label.toLowerCase();
    const statValue = savedStats[upperLabel] || savedStats[lowerLabel] || 0;
    const total = baseValue + bonusValue;
    const maxRef = statMaxRef[upperLabel] ?? 600;
    const pct = Math.min(100, (total / maxRef) * 100);
    const barColor = statColors[upperLabel] ?? 'bg-purple-500';

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-heading font-semibold text-gray-700 dark:text-gray-200 w-10">{label}</span>
          <div className="flex-1 mx-3">
            <div className="h-2 bg-gray-200 dark:bg-dark-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 w-20 justify-end">
            <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{baseValue}</span>
            {bonusValue > 0 && (
              <span className="text-green-500 dark:text-green-400 text-xs tabular-nums">+{bonusValue}</span>
            )}
            {/* Allocation Button */}
            {belongsToCurrentUser && statValue > 0 && isUnderStatCap(localDigimon) && (
              <button
                className="w-5 h-5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/30 dark:hover:bg-amber-700/50 text-amber-700 dark:text-amber-300 rounded-full flex items-center justify-center relative flex-shrink-0"
                onClick={() => allocateStat(lowerLabel as StatType)}
                disabled={allocating}
                title={`Allocate ${label} stat point (${statValue} available)`}
              >
                <span className="text-[10px] font-bold leading-none">+</span>
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {statValue}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hooks must be called before any early returns (Rules of Hooks)
  // Add this useEffect to fetch devolution options when the modal opens
  useEffect(() => {
    const loadDevolutionOptions = async () => {
      if (!localDigimon || !localDigimon.digimon_id) return;

      const options = await useDigimonStore.getState().fetchDevolutionOptions(localDigimon.digimon_id);
      setDevolutionOptions(options);
    };

    loadDevolutionOptions();
  }, [localDigimon]);

  // Add this useEffect to fetch evolution options when the modal opens or digimon changes
  useEffect(() => {
    const loadEvolutionOptions = async () => {
      if (!localDigimon || !localDigimon.digimon_id) return;

      const options = await useDigimonStore.getState().fetchEvolutionOptions(localDigimon.digimon_id);
      setEvolutionOptions(options);
    };

    loadEvolutionOptions();
  }, [localDigimon]);

  if (!localDigimon) return null;

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
      if (!localDigimon) return;
      const updatedDigimon: UserDigimon = {
        ...localDigimon,
        name: nameToSave
      };
      
      // Force a re-render by dispatching a custom event with the updated digimon
      window.dispatchEvent(new CustomEvent('digimon-name-changed', { 
        detail: { digimonId, newName: nameToSave }
      }));
      
      // This is the key part - directly update the parent component's state
      // by passing the updated digimon back through a callback
      setLocalDigimon(updatedDigimon);
      useDigimonStore.getState().updateDigimonInStore(updatedDigimon);
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

  const stats = calculateFinalStats(localDigimon);

  // Handle evolution
  const handleEvolution = async (toDigimonId: number) => {
    try {
      setEvolutionError(null);
      if (!localDigimon) return;
      await evolveDigimon(toDigimonId, localDigimon.id);
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
      if (!localDigimon) return;
      await devolveDigimon(toDigimonId, localDigimon.id);
    } catch (error) {
      setDevolutionError((error as Error).message);
    }
  };

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
      text: `Ooh, your Digimon's personality is ${localDigimon.personality}!`
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
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => {
        // Only close if clicking the backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="bg-white dark:bg-dark-300 rounded-lg px-6 pb-4 pt-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* X Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                digimonName={localDigimon.digimon?.name || ""}
                fallbackSpriteUrl={localDigimon.digimon?.sprite_url || "/assets/pet/egg.svg"}
                happiness={localDigimon.happiness}
                size="lg"
                onClick={handleModalSpriteClick}
              />
            </div>
            
            <div className="text-center mb-1">
              {editingName === (localDigimon?.id || null) ? (
                <div className="flex items-center justify-center mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, localDigimon.id)}
                    className="px-2 py-1 border border-gray-300 dark:border-dark-100 rounded-md text-gray-800 dark:text-gray-200 dark:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-accent-500"
                    maxLength={20}
                    placeholder={localDigimon.digimon?.name || "Enter nickname"}
                    autoFocus
                  />
                  <div className="flex ml-1">
                    <button
                      onClick={() => handleSaveName(localDigimon.id)}
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
          <h4 className="text-xl font-semibold mr-1 dark:text-gray-100">
            {localDigimon.name || localDigimon.digimon?.name}
          </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      if (!localDigimon) return;
                      handleEditName(localDigimon.id, localDigimon.name, localDigimon.digimon?.name || "");
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10" // Add z-index
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
                <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                  Lv. {localDigimon.current_level}
                </span>
                {localDigimon.is_on_team && (
                  <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    Team
                  </span>
                )}
                {localDigimon.is_active && (
                  <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                    Active
                  </span>
                )}
                {localDigimon.has_x_antibody && (
                <div className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">X-Antibody</span>
                </div>
              )}
              </div>
              <div className="grid grid-cols-2 gap-x-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                <p className="text-right">Age:</p>
                <p className="text-left">{calculateAgeDays(localDigimon.created_at)} days</p>

                <p className="text-right">Personality:</p>
                <p className="text-left">{localDigimon.personality}</p>
              </div>
            </div>

            {/* Description - fix the nesting issue */}
            <div className="text-center text-gray-600 dark:text-gray-300 text-sm mt-1 mb-2 flex flex-wrap items-center justify-center gap-x-1">
              <span>{`${localDigimon.digimon?.name} is a `}</span>
              <TypeAttributeIcon
                type={localDigimon.digimon?.type as DigimonType}
                attribute={localDigimon.digimon?.attribute as DigimonAttribute}
                size="sm"
                showLabel={false}
              />
              <span>{`${localDigimon.digimon?.attribute} ${localDigimon.digimon?.type}, ${localDigimon.digimon?.stage} Digimon.`}</span>
            </div>
            {/* Status bars */}
            <div className="w-full space-y-4 mb-6 mt-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center justify-center w-8 h-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-dark-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        localDigimon.happiness >= 60 ? 'bg-green-500' :
                        localDigimon.happiness >= 30 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${localDigimon.happiness}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Happiness</span>
                  <span>{localDigimon.happiness}%</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Level text directly left of the bar - fixed width */}
                  <div className="flex items-center justify-center w-8 h-4 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
                      Lv{localDigimon.current_level}
                    </span>
                  </div>
                  
                  {/* Experience Progress Bar */}
                  <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (localDigimon.experience_points / xpForNextLevel(localDigimon.current_level)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                {/* Experience details below */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{localDigimon.experience_points}/{xpForNextLevel(localDigimon.current_level)} XP</span>
                  <span>{totalCumulativeXp(localDigimon.current_level, localDigimon.experience_points)} Total EXP</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="flex flex-col h-full md:w-3/5">
            <div className="flex-grow">
              <h4 className="font-heading font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200">Stats</h4>

              {/* Stat cap info */}
              {belongsToCurrentUser && (
                <div className={`mb-3 p-2 rounded-lg text-xs font-body ${
                  isUnderStatCap(localDigimon)
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 text-purple-800 dark:text-purple-300'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300'
                }`}>
                  {isUnderStatCap(localDigimon) ? (
                    <>Bonus stat slots remaining: <strong>{getRemainingStatPoints(localDigimon)}</strong>. Tap <strong>+</strong> on any stat to allocate.</>
                  ) : (
                    <>Stat cap reached. Increase ABI via evolution/devolution to unlock more.</>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-4">
                {renderStatRow("HP", stats.hp, localDigimon.hp_bonus)}
                {renderStatRow("SP", stats.sp, localDigimon.sp_bonus)}
                {renderStatRow("ATK", stats.atk, localDigimon.atk_bonus)}
                {renderStatRow("DEF", stats.def, localDigimon.def_bonus)}
                {renderStatRow("INT", stats.int, localDigimon.int_bonus)}
                {renderStatRow("SPD", stats.spd, localDigimon.spd_bonus)}
                {renderStatRow("ABI", localDigimon.abi, 0)}
              </div>

            </div>
          </div>
        </div>
        
        {/* Update the buttons section at the bottom of the modal */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full mt-4">
          {/* All the buttons */}
          {!localDigimon.is_active && onSetActive && (
            <button
              onClick={() => {
                onSetActive(localDigimon.id);
                onClose();
              }}
              className="flex-1 bg-indigo-100 dark:bg-amber-900/30 text-indigo-800 dark:text-amber-200 rounded hover:bg-indigo-200 dark:hover:bg-amber-800/50 py-2 px-4"
            >
              Set Active
            </button>
          )}
          
          {/* Active indicator - show instead of Set Active button if already active */}
          {localDigimon.is_active && (
            <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 py-2 px-4 rounded text-center">
              Active
            </div>
          )}

          {/* Digivolve button - only show if evolution options exist */}
          {belongsToCurrentUser && (
            <button
              onClick={() => setShowEvolutionModal(true)}
              className="flex-1 bg-indigo-100 dark:bg-amber-900/30 text-indigo-800 dark:text-amber-200 rounded hover:bg-indigo-200 dark:hover:bg-amber-800/50 py-2 px-4"
            >
              Digivolve
            </button>
          )}

          {/* De-Digivolve button */}
          {belongsToCurrentUser && (
            <button
              onClick={() => setShowDevolutionModal(true)}
              className="flex-1 bg-indigo-100 dark:bg-amber-900/30 text-indigo-800 dark:text-amber-200 rounded hover:bg-indigo-200 dark:hover:bg-amber-800/50 py-2 px-4"
            >
              De-Digivolve
            </button>
          )}
        </div>
      </motion.div>

      {/* Evolution Modal */}
      <DigimonEvolutionModal
        isOpen={showEvolutionModal}
        onClose={() => {
          setShowEvolutionModal(false);
          // For DNA evolution, we need to make sure the detail modal closes too
          // This will be called after the animation completes
          onClose();
        }}
        selectedDigimon={localDigimon as UserDigimon}
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
        selectedDigimon={localDigimon as UserDigimon}
        options={devolutionOptions}
        onEvolve={handleDevolution}
        isDevolution={true}
        error={devolutionError}
        isDiscovered={isDiscovered}
        allUserDigimon={allUserDigimon}
      />
    </motion.div>
    <PageTutorial tutorialId="digimon_detail_modal_intro" steps={digimonDetailModalTutorialSteps} />
    </>
  );
};

export default DigimonDetailModal; 