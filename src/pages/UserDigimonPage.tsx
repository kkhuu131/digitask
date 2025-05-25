import { useState, useEffect } from "react";
import { useDigimonStore, EvolutionOption, UserDigimon } from "../store/petStore";
import MilestoneProgress from "../components/MilestoneProgress"
import DigimonDetailModal from "../components/DigimonDetailModal";
import { DigimonType, DigimonAttribute } from "../store/battleStore";
import TypeAttributeIcon from '../components/TypeAttributeIcon';
import EvolutionAnimation from "../components/EvolutionAnimation";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { getEvolutions, getEvolutionsByDigimonIds } from "@/utils/evolutionsHelper";
import DigimonSprite from "../components/DigimonSprite";
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';

const UserDigimonPage = () => {
  const { 
    allUserDigimon, 
    userDigimon, 
    fetchAllUserDigimon,
    fetchStorageDigimon,
    setActiveDigimon,
    releaseDigimon,
    loading, 
    error,
    evolveDigimon,
    devolveDigimon,
  } = useDigimonStore();
  const [switchingDigimon, setSwitchingDigimon] = useState(false);
  const [digimonToRelease, setDigimonToRelease] = useState<string | null>(null);
  const [releasingDigimon, setReleasingDigimon] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{[key: number]: EvolutionOption[]}>({});
  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionSprites, setEvolutionSprites] = useState<{old: string, new: string} | null>(null);
  const [pendingEvolution, setPendingEvolution] = useState<{digimonId: string, toDigimonId: number} | null>(null);
  const [pendingDevolution, setPendingDevolution] = useState<{digimonId: string, fromDigimonId: number} | null>(null);

  useEffect(() => {
    fetchAllUserDigimon();
    fetchStorageDigimon();
    fetchAllEvolutionPaths();
  }, [fetchAllUserDigimon, fetchStorageDigimon]);

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

      const evolutionPaths = getEvolutionsByDigimonIds(digimonIds);

      // Enrich with digimon data from lookup table
      const enrichedEvolutionPaths = evolutionPaths.map(path => ({
        ...path,
        digimon: {
          id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].id,
          digimon_id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].digimon_id,
          name: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].name,
          stage: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].stage,
          sprite_url: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].sprite_url
        }
      }));

      // Organize evolution paths by from_digimon_id
      const evolutionsByDigimon: {[key: number]: EvolutionOption[]} = {};
      
      enrichedEvolutionPaths.forEach(path => {
        if (!evolutionsByDigimon[path.from_digimon_id]) {
          evolutionsByDigimon[path.from_digimon_id] = [];
        }
        
        evolutionsByDigimon[path.from_digimon_id].push({
          id: path.id,
          digimon_id: path.digimon.digimon_id,
          name: path.digimon.name,
          stage: path.digimon.stage,
          sprite_url: path.digimon.sprite_url,
          level_required: path.level_required,
          stat_requirements: path.stat_requirements || {}
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

  // Add a new function to fetch evolution paths for a specific Digimon ID
  const fetchEvolutionPathsForDigimon = async (digimonId: number) => {
    try {
      const evolutionPaths = getEvolutions(digimonId);

      // Enrich with digimon data from lookup table
      const enrichedEvolutionPaths = evolutionPaths.map(path => ({
        ...path,
        digimon: {
          id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].id,
          digimon_id: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].digimon_id,
          name: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].name,
          stage: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].stage,
          sprite_url: DIGIMON_LOOKUP_TABLE[path.to_digimon_id].sprite_url
        }
      }));

      // Update the evolution data for this specific Digimon ID
      if (enrichedEvolutionPaths.length > 0) {
        const newEvolutions: EvolutionOption[] = enrichedEvolutionPaths.map(path => ({
          id: path.id,
          digimon_id: path.digimon.id,
          name: path.digimon.name,
          stage: path.digimon.stage,
          sprite_url: path.digimon.sprite_url,
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
  
  // Function to complete evolution after animation
  const completeEvolution = async () => {
    if (!pendingEvolution) return;
    
    try {
      const {digimonId, toDigimonId} = pendingEvolution;
      
      // Evolve the Digimon
      await evolveDigimon(toDigimonId, digimonId);
      
      // Fetch new evolution paths
      await fetchEvolutionPathsForDigimon(toDigimonId);
      
      // Refresh all user Digimon data
      await fetchAllUserDigimon();
      
    } catch (error) {
      console.error("Error evolving Digimon:", error);
    } finally {
      setShowEvolutionAnimation(false);
      setEvolutionSprites(null);
      setPendingEvolution(null);
    }
  };
  
  // Function to complete devolution after animation
  const completeDevolution = async () => {
    if (!pendingDevolution) return;
    
    try {
      const {digimonId, fromDigimonId} = pendingDevolution;
      
      // Devolve the Digimon
      await devolveDigimon(fromDigimonId, digimonId);
      
      // Fetch new evolution paths
      await fetchEvolutionPathsForDigimon(fromDigimonId);
      
      // Refresh all user Digimon data
      await fetchAllUserDigimon();
      
    } catch (error) {
      console.error("Error devolving Digimon:", error);
    } finally {
      setShowEvolutionAnimation(false);
      setEvolutionSprites(null);
      setPendingDevolution(null);
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

  // Add this useEffect to listen for digimon-evolved events
  useEffect(() => {
    const handleDigimonEvolved = (event: CustomEvent) => {
      if (event.detail && event.detail.newDigimonId) {
        // Refresh all user Digimon data
        fetchAllUserDigimon();
      }
    };

    window.addEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    
    return () => {
      window.removeEventListener('digimon-evolved', handleDigimonEvolved as EventListener);
    };
  }, [fetchAllUserDigimon]);

  const handleDigimonUpdate = (updatedDigimon: UserDigimon) => {
    setSelectedDetailDigimon(updatedDigimon);

  };

  const digimonPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to your Digimon party! Here you can see all the Digimon partners you've acquired on your journey."
    },
    {
      speaker: 'neemon',
      text: "Ooh, look at all these Digimon! You can have up to 12 different ones in your party!"
    },
    {
      speaker: 'bokomon',
      text: "Only one Digimon can be active at a time. The active Digimon is the one that gains full experience when you complete tasks and loses happiness when you miss them."
    },
    {
      speaker: 'neemon',
      text: "Your other Digimon will still gain half experience. To change your active Digimon, just click the 'Set Active' button on the one you want to use!"
    },
    {
      speaker: 'bokomon',
      text: "Click on any Digimon card to see more details about them, including their stats, level, and evolution options."
    },
    {
      speaker: 'neemon',
      text: "And look down there! That's the Milestone Progress bar. You can get more Digimon to raise when you reach certain ABI values!"
    },
    {
      speaker: 'bokomon',
      text: "ABI, or Ability, is gained whenever you evolve or devolve your Digimon. The more you evolve and devolve, the higher your ABI will grow!"
    },
    {
      speaker: 'both',
      text: "Collect different Digimon, raise them well, and build your perfect team. Good luck, Tamer!"
    }
  ];

  if (loading && allUserDigimon.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your Digimon...</p>
      </div>
    );
  }

  return (
    <>
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

        {/* Digimon Detail Modal - Replace with new component */}
        {selectedDetailDigimon && (
          <DigimonDetailModal
            selectedDigimon={selectedDetailDigimon}
            onClose={handleCloseDetailModal}
            onSetActive={handleSwitchDigimon}
            onRelease={handleReleaseClick}
            onNameChange={handleDigimonUpdate}
            className="z-40"
          />
        )}

        {/* Evolution/Devolution Animation */}
        {showEvolutionAnimation && evolutionSprites && (
          <EvolutionAnimation
            oldSpriteUrl={evolutionSprites.old}
            newSpriteUrl={evolutionSprites.new}
            onComplete={pendingEvolution ? completeEvolution : completeDevolution}
            isDevolution={!!pendingDevolution}
          />
        )}

        <div className="mb-6">
          <MilestoneProgress />
        </div>

        <div className="card mb-6">
          <h1 className="text-2xl font-bold mb-4">Party</h1>
          <p className="text-gray-600 mb-6">
            You can have up to 12 Digimon total. 
            Only one Digimon can be active at a time.
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Digimon Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...allUserDigimon]
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
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
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ""}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || "/assets/pet/egg.svg"}
                        happiness={digimon.happiness}
                        size="sm"
                        onClick={() => handleShowDetailModal(digimon.id)}
                        enableHopping={evolutionData[digimon.digimon_id]?.some(
                          option => digimon.current_level >= option.level_required
                        )}
                      />
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
            
            {allUserDigimon.length < 12 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-center">
                  Digimon slot available
                  <br />
                  <span className="text-xs">{12 - allUserDigimon.length} slots remaining</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <PageTutorial tutorialId="digimon_collection_intro" steps={digimonPageTutorialSteps} />
    </>
  );
};

export default UserDigimonPage; 