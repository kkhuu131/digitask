import { useState } from "react";
import { UserDigimon, useDigimonStore } from "../store/petStore";
import { motion, AnimatePresence } from "framer-motion";
import statModifier from "../store/battleStore";
import { supabase } from "../lib/supabase";

interface DigimonDetailModalProps {
  selectedDigimon: UserDigimon | null;
  onClose: () => void;
  onSetActive?: (digimonId: string) => Promise<void>;
  onShowEvolution?: (digimonId: string) => void;
  onRelease?: (digimonId: string) => void;
  onNameChange?: (updatedDigimon: UserDigimon) => void;
  evolutionData?: {[key: number]: any[]};
}

const DigimonDetailModal: React.FC<DigimonDetailModalProps> = ({
  selectedDigimon,
  onClose,
  onSetActive,
  onShowEvolution,
  onRelease,
  evolutionData = {},
  onNameChange
}) => {
  const { discoveredDigimon } = useDigimonStore();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [lookDirection, setLookDirection] = useState(1);

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
      console.log("Saving new name:", newName, "for digimon:", digimonId);
      
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
      
      console.log("Name updated successfully");
      
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Image and basic info */}
          <div className="flex flex-col items-center">
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
            
            <div className="text-center mb-4">
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
              <p className="text-gray-600 w-3/4 mx-auto text-center">
                {selectedDigimon.digimon?.name} is a {selectedDigimon.digimon?.attribute} {selectedDigimon.digimon?.type}, {selectedDigimon.digimon?.stage} level Digimon.
              </p>
              <div className="flex justify-center space-x-2 mt-2">
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
            
            {/* Status bars */}
            <div className="w-full space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Health</span>
                  <span>{selectedDigimon.health}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      selectedDigimon.health >= 60 ? 'bg-green-500' : 
                      selectedDigimon.health >= 30 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${selectedDigimon.health}%` }}
                  ></div>
                </div>
              </div>
              
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
          
          {/* Right column - Stats and evolution */}
          <div>
            <h4 className="text-lg font-semibold">Stats</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-2 rounded">
                <span className="relative group cursor-help text-sm font-medium">
                  {"HP"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">HP represents the Digimon's health and determines how much damage it can take before fainting.</div>
                  </div>
                </span>
                <p className="text-lg">
                  {statModifier(
                    selectedDigimon.current_level,
                    selectedDigimon.digimon?.hp_level1 ?? 0,
                    selectedDigimon.digimon?.hp ?? 0,
                    selectedDigimon.digimon?.hp_level99 ?? 0
                  )}+{selectedDigimon.hp_bonus ?? 0}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
              <span className="relative group cursor-help text-sm font-medium">
                  {"SP"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">SP represents the Digimon's critical damage multiplier.</div>
                  </div>
                </span>
                <p className="text-lg">{statModifier(selectedDigimon.current_level, selectedDigimon.digimon?.sp_level1 ?? 0, selectedDigimon.digimon?.sp ?? 0, selectedDigimon.digimon?.sp_level99 ?? 0)}+{selectedDigimon.sp_bonus ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="relative group cursor-help text-sm font-medium">
                  {"ATK"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">ATK represents the Digimon's physical attack power.</div>
                  </div>
                </span>
                <p className="text-lg">{statModifier(selectedDigimon.current_level, selectedDigimon.digimon?.atk_level1 ?? 0, selectedDigimon.digimon?.atk ?? 0, selectedDigimon.digimon?.atk_level99 ?? 0)}+{selectedDigimon.atk_bonus ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="relative group cursor-help text-sm font-medium">
                  {"DEF"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">DEF represents the Digimon's physical defense.</div>
                  </div>
                </span>
                <p className="text-lg">{statModifier(selectedDigimon.current_level, selectedDigimon.digimon?.def_level1 ?? 0, selectedDigimon.digimon?.def ?? 0, selectedDigimon.digimon?.def_level99 ?? 0)}+{selectedDigimon.def_bonus ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="relative group cursor-help text-sm font-medium">
                  {"INT"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">INT represents the Digimon's magical attack power and magical defense.</div>
                  </div>
                </span>
                <p className="text-lg">{statModifier(selectedDigimon.current_level, selectedDigimon.digimon?.int_level1 ?? 0, selectedDigimon.digimon?.int ?? 0, selectedDigimon.digimon?.int_level99 ?? 0)}+{selectedDigimon.int_bonus ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="relative group cursor-help text-sm font-medium">
                  {"SPD"}
                  {/* Stat tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-56">
                  <div className="">SPD represents the Digimon's speed and determines turn order.</div>
                  </div>
                </span>
                <p className="text-lg">{statModifier(selectedDigimon.current_level, selectedDigimon.digimon?.spd_level1 ?? 0, selectedDigimon.digimon?.spd ?? 0, selectedDigimon.digimon?.spd_level99 ?? 0)}+{selectedDigimon.spd_bonus ?? 0}</p>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mb-3">Evolution Options</h4>
            {evolutions?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {evolutions.map((option) => {
                  const meetsLevelRequirement = selectedDigimon.current_level >= option.level_required;
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
              {!selectedDigimon.is_active && onSetActive && (
                <button
                  onClick={() => {
                    onSetActive(selectedDigimon.id);
                    onClose();
                  }}
                  className="btn-primary"
                >
                  Set Active
                </button>
              )}
              
              {onShowEvolution && evolutions?.some(
                option => selectedDigimon.current_level >= option.level_required
              ) && (
                <button
                  onClick={() => {
                    onShowEvolution(selectedDigimon.id);
                    onClose();
                  }}
                  className="btn-secondary"
                >
                  Digivolve
                </button>
              )}
              
              {!selectedDigimon.is_active && onRelease && (
                <button
                  onClick={() => {
                    onRelease(selectedDigimon.id);
                    onClose();
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
  );
};

export default DigimonDetailModal; 