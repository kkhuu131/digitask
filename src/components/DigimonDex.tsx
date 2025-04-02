import { useState, useEffect } from "react";
import { useDigimonStore, Digimon } from "../store/petStore";
import { supabase } from "../lib/supabase";

const DigimonDex = () => {
  const [allDigimon, setAllDigimon] = useState<Digimon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [evolutionPaths, setEvolutionPaths] = useState<any[]>([]);
  const { discoveredDigimon } = useDigimonStore();

  useEffect(() => {
    const fetchAllDigimon = async () => {
      try {
        setLoading(true);
        
        // Fetch all Digimon ordered by digimon_id
        const { data, error } = await supabase
          .from("digimon")
          .select("*")
          .order("digimon_id", { ascending: true });
          
        if (error) throw error;
        
        setAllDigimon(data || []);
      } catch (err) {
        console.error("Error fetching Digimon:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDigimon();
  }, []);

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
      
      setEvolutionPaths((prev: any) => ({
        ...prev,
        evolvesFrom: evolvesFrom || [],
        evolvesTo: evolvesTo || []
      }));
    } catch (err) {
      console.error("Error fetching evolution paths:", err);
    }
  };

  const closeDetails = () => {
    setSelectedDigimon(null);
    setEvolutionPaths([]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading Digimon data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <p className="text-sm text-red-700">Error loading Digimon: {error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Digimon Dex</h2>
      <p className="text-sm text-gray-500 mb-6">
        Discovered: {discoveredDigimon.length} / {allDigimon.length}
      </p>
      
      {/* Grid of Digimon */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-6">
        {allDigimon.map((digimon) => {
          const discovered = isDiscovered(digimon.id);
          
          return (
            <div
              key={digimon.id}
              className={`border rounded-lg p-2 transition-all ${
                discovered 
                  ? "cursor-pointer hover:bg-primary-50 hover:border-primary-300" 
                  : "opacity-80 bg-gray-100"
              }`}
              onClick={() => discovered && handleDigimonSelect(digimon)}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <img 
                    src={digimon.sprite_url} 
                    alt={discovered ? digimon.name : "Unknown Digimon"} 
                    style={{ imageRendering: "pixelated" }} 
                    className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                    }}
                  />
                  {!discovered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={digimon.sprite_url} 
                        alt="Unknown Digimon"
                        style={{ imageRendering: "pixelated" }} 
                        className="w-full h-full object-contain silhouette"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center mt-1">
                  #{digimon.digimon_id}
                </span>
                <span className="text-xs text-center">
                  {discovered ? digimon.name : "???"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Digimon Details Modal */}
      {selectedDigimon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">#{selectedDigimon.digimon_id} {selectedDigimon.name}</h3>
              <button 
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <img 
                style={{ imageRendering: "pixelated" }} 
                src={selectedDigimon.sprite_url} 
                alt={selectedDigimon.name} 
                className="w-32 h-32 object-contain mb-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                }}
              />
              <div className="text-center">
                <p className="text-sm font-medium">{selectedDigimon.stage} Type</p>
                <p className="text-sm text-gray-500">
                  {(selectedDigimon as any)?.type || "Unknown"} / {(selectedDigimon as any)?.attribute || "Unknown"}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm">HP: {selectedDigimon.hp}</p>
                  <p className="text-sm">SP: {selectedDigimon.sp}</p>
                  <p className="text-sm">ATK: {selectedDigimon.atk}</p>
                </div>
                <div>
                  <p className="text-sm">DEF: {selectedDigimon.def}</p>
                  <p className="text-sm">INT: {selectedDigimon.int}</p>
                  <p className="text-sm">SPD: {selectedDigimon.spd}</p>
                </div>
              </div>
            </div>
            
            {/* Evolution Paths */}
            {(evolutionPaths as any).evolvesFrom && (evolutionPaths as any).evolvesFrom.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Evolves From</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(evolutionPaths as any).evolvesFrom.map((path: any) => {
                    const discovered = isDiscovered(path.from_digimon.id);
                    
                    return (
                      <div key={path.id} className="flex flex-col items-center">
                        <div className="relative w-16 h-16">
                          <img 
                            src={path.from_digimon.sprite_url} 
                            alt={discovered ? path.from_digimon.name : "Unknown Digimon"} 
                            className={`w-full h-full object-contain ${!discovered ? "opacity-0" : ""}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                            }}
                          />
                          {!discovered && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img 
                                src={path.from_digimon.sprite_url} 
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
            )}
            
            {(evolutionPaths as any).evolvesTo && (evolutionPaths as any).evolvesTo.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Evolves To</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(evolutionPaths as any).evolvesTo.map((path: any) => {
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
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeDetails}
                className="btn-outline"
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