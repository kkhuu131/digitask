import { useState } from "react";
import { useDigimonStore, Digimon } from "../store/petStore";
import { supabase } from "../lib/supabase";
import { useDigimonData } from "../hooks/useDigimonData";

const DigimonDex = () => {
  const { digimon: allDigimon, loading, } = useDigimonData();
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [evolutionPathsData, setEvolutionPaths] = useState<any>({});
  const { discoveredDigimon } = useDigimonStore();
  const [statLevel, setStatLevel] = useState<1 | 50 | 99>(1);

  const isDiscovered = (digimonId: number) => {
    return discoveredDigimon.includes(digimonId);
  };

  const handleDigimonSelect = async (digimon: Digimon) => {
    // Only allow selecting discovered Digimon
    if (!isDiscovered(digimon.id)) return;
    
    setSelectedDigimon(digimon);
    
    try {
      // Fetch evolution paths for this Digimon
      const { data: evolvesFrom, error: fromError } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          from_digimon:from_digimon_id (id, digimon_id, name, stage, sprite_url),
          level_required
        `)
        .eq("to_digimon_id", digimon.id);
        
      if (fromError) throw fromError;
      
      const { data: evolvesTo, error: toError } = await supabase
        .from("evolution_paths")
        .select(`
          id,
          to_digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url),
          level_required
        `)
        .eq("from_digimon_id", digimon.id);
        
      if (toError) throw toError;
      
      setEvolutionPaths({
        evolvesFrom: evolvesFrom || [],
        evolvesTo: evolvesTo || []
      });
    } catch (err) {
      console.error("Error fetching evolution paths:", err);
    }
  };

  const closeDetails = () => {
    setSelectedDigimon(null);
    setEvolutionPaths({});
    setStatLevel(1);
  };
  
  // Calculate stats for different levels
  const getStatsForLevel = (digimon: Digimon, level: 1 | 50 | 99) => {
    if (level === 1) {
      return {
        hp: digimon.hp_level1 || digimon.hp,
        sp: digimon.sp_level1 || digimon.sp,
        atk: digimon.atk_level1 || digimon.atk,
        def: digimon.def_level1 || digimon.def,
        int: digimon.int_level1 || digimon.int,
        spd: digimon.spd_level1 || digimon.spd
      };
    } else if (level === 99) {
      return {
        hp: digimon.hp_level99,
        sp: digimon.sp_level99,
        atk: digimon.atk_level99,
        def: digimon.def_level99,
        int: digimon.int_level99,
        spd: digimon.spd_level99
      };
    } else {
      // For level 50, interpolate between level 1 and 99
      const calculateMidpoint = (val1: number | null, val99: number | null) => {
        if (val1 === null || val99 === null) return null;
        return Math.floor(val1 + (val99 - val1) * 0.5);
      };
      
      return {
        hp: calculateMidpoint(digimon.hp_level1, digimon.hp_level99),
        sp: calculateMidpoint(digimon.sp_level1, digimon.sp_level99),
        atk: calculateMidpoint(digimon.atk_level1, digimon.atk_level99),
        def: calculateMidpoint(digimon.def_level1, digimon.def_level99),
        int: calculateMidpoint(digimon.int_level1, digimon.int_level99),
        spd: calculateMidpoint(digimon.spd_level1, digimon.spd_level99)
      };
    }
  };

  // Add a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-6">
        Discovered: {discoveredDigimon.length} / {allDigimon.length}
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {allDigimon.map((digimon) => {
          const discovered = isDiscovered(digimon.id);
          
          return (
            <div 
              key={digimon.id}
              onClick={() => discovered && handleDigimonSelect(digimon)}
              className={`
                border rounded-lg p-2 flex flex-col items-center justify-center
                ${discovered ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-60 grayscale'}
              `}
            >
              <div className="w-16 h-16 flex items-center justify-center">
                {digimon.sprite_url ? (
                  <img 
                    src={digimon.sprite_url} 
                    alt={discovered ? digimon.name : "???"} 
                    style={discovered ? { imageRendering: "pixelated"} : { imageRendering: "pixelated", filter: "brightness(0)" }} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">?</div>
                )}
              </div>
              <p className="text-xs font-medium mt-1 text-center">
                {discovered ? digimon.name : "???"}
              </p>
              <p className="text-xs text-gray-500">{digimon.stage}</p>
            </div>
          );
        })}
      </div>
      
      {/* Modal for Digimon details - updated to match Evolution Graph style */}
      {selectedDigimon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <h2 className="text-xl font-bold">{selectedDigimon.name}</h2>
              <p className="text-sm opacity-80">
                #{selectedDigimon.id} • {selectedDigimon.stage}
              </p>
            </div>
            
            {/* Image section with background */}
            <div className="p-4 bg-gray-100 flex justify-center">
              {selectedDigimon.sprite_url && (
                <img 
                  src={selectedDigimon.sprite_url} 
                  alt={selectedDigimon.name} 
                  style={{ imageRendering: "pixelated" }} 
                  className="w-32 h-32 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                  }}
                />
              )}
            </div>
            
            {/* Content area with scrolling */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Type and Attribute */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Type</p>
                  <p className="font-medium text-gray-800">{selectedDigimon.type || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Attribute</p>
                  <p className="font-medium text-gray-800">{selectedDigimon.attribute || 'Unknown'}</p>
                </div>
              </div>
              
              {/* Level tabs with updated styling */}
              <div className="flex mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                {[1, 50, 99].map((level) => (
                  <button 
                    key={level}
                    className={`py-2 px-4 font-medium text-sm flex-1 text-black m-1 ${
                      statLevel === level
                        ? 'bg-gray-200'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => setStatLevel(level as 1 | 50 | 99)}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
              
              {/* Stats display with consistent styling */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(getStatsForLevel(selectedDigimon, statLevel)).map(([stat, value]) => (
                  <div key={stat} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      {stat === 'hp' ? 'HP' : 
                       stat === 'sp' ? 'SP' : 
                       stat === 'atk' ? 'Attack' : 
                       stat === 'def' ? 'Defense' : 
                       stat === 'int' ? 'Intelligence' : 'Speed'}
                    </p>
                    <p className="font-medium text-gray-800 text-lg">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              
              {/* Evolution paths section */}
              <div className="mt-5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Evolution Paths</h3>
                
                <div className="space-y-4">
                  {/* Evolves From section */}
                  {evolutionPathsData.evolvesFrom && evolutionPathsData.evolvesFrom.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Evolves From
                      </h4>
                      
                      <div className="pl-2 border-l-2 border-blue-200">
                        <div className="grid grid-cols-3 gap-2">
                          {evolutionPathsData.evolvesFrom.map((path: any) => {
                            const discovered = isDiscovered(path.from_digimon.id);
                            
                            return (
                              <div key={path.id} className="flex flex-col items-center">
                                <div className="relative w-16 h-16">
                                  <img 
                                    src={path.from_digimon.sprite_url} 
                                    alt={discovered ? path.from_digimon.name : "Unknown Digimon"} 
                                    style={{ imageRendering: "pixelated" }} 
                                    className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                                    }}
                                  />
                                  {!discovered && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <img 
                                        src={path.from_digimon.sprite_url} 
                                        style={{ imageRendering: "pixelated" }} 
                                        alt="Unknown Digimon"
                                        className="w-full h-full object-contain silhouette"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-center mt-1">
                                  {discovered ? path.from_digimon.name : "???"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Lvl {path.level_required}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Evolves To section */}
                  {evolutionPathsData.evolvesTo && evolutionPathsData.evolvesTo.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Evolves To
                      </h4>
                      
                      <div className="pl-2 border-l-2 border-green-200">
                        <div className="grid grid-cols-3 gap-2">
                          {evolutionPathsData.evolvesTo.map((path: any) => {
                            const discovered = isDiscovered(path.to_digimon.id);
                            
                            return (
                              <div key={path.id} className="flex flex-col items-center">
                                <div className="relative w-16 h-16">
                                  <img 
                                    src={path.to_digimon.sprite_url} 
                                    alt={discovered ? path.to_digimon.name : "Unknown Digimon"} 
                                    style={{ imageRendering: "pixelated" }} 
                                    className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                                    }}
                                  />
                                  {!discovered && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <img 
                                        src={path.to_digimon.sprite_url} 
                                        style={{ imageRendering: "pixelated" }} 
                                        alt="Unknown Digimon"
                                        className="w-full h-full object-contain silhouette"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-center mt-1">
                                  {discovered ? path.to_digimon.name : "???"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Lvl {path.level_required}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer with close button */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigimonDex; 