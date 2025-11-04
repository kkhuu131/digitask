import { useEffect, useState } from "react";
import { useMilestoneStore, getABITotal, getABIThreshold } from "../store/milestoneStore";
import { useDigimonStore } from "../store/petStore";
import { useLocation } from "react-router-dom";
import DigimonSelectionModal from "./DigimonSelectionModal";

const MilestoneProgress = () => {
  const { 
    loading, 
    error, 
    fetchMilestones,
    claimSelectedDigimon,
  } = useMilestoneStore();
  
  const { allUserDigimon } = useDigimonStore();
  const location = useLocation();
  
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isNXChance, setIsNXChance] = useState(false);
  const [isProcessingClaim, setIsProcessingClaim] = useState(false);
  
  const hasMaxDigimon = allUserDigimon.length >= 9;
  // Allow claiming even if party is full; excess claims go to storage
  const shouldBeAbleToClaimDigimon = getABITotal() >= getABIThreshold();
  
  useEffect(() => {
    fetchMilestones();
  }, [location.pathname, fetchMilestones]);
  
  const handleOpenSelectionModal = () => {
    if (!shouldBeAbleToClaimDigimon || isProcessingClaim) return;
    
    const hasNXChance = Math.random() < 0.025;
    setIsNXChance(hasNXChance);
    setIsSelectionModalOpen(true);
  };
  
  const handleDigimonSelection = async (digimonId: number) => {
    try {
      setIsProcessingClaim(true);
      setIsSelectionModalOpen(false);
      
      const success = await claimSelectedDigimon(digimonId);
      
      if (success) {
        await fetchMilestones();
        await useDigimonStore.getState().fetchAllUserDigimon();
      } else {
        setIsSelectionModalOpen(true);
      }
    } catch (error) {
      console.error("Error claiming Digimon:", error);
      setIsSelectionModalOpen(true);
    } finally {
      setIsProcessingClaim(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-4">Loading milestone progress...</div>;
  }
  
  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🥚 Hatchery
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">ABI Progress</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{getABITotal()} / {getABIThreshold()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
                style={{ width: `${Math.min(100, (getABITotal() / getABIThreshold() * 100))}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Earn ABI by evolving or devolving.</span>
              <span className="flex items-center gap-1">Unlock a new Digimon</span>
            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={handleOpenSelectionModal}
              disabled={!shouldBeAbleToClaimDigimon || isProcessingClaim}
              className={`w-full py-1.5 px-3 rounded-md text-sm font-medium ${
                shouldBeAbleToClaimDigimon && !isProcessingClaim
                  ? "text-white bg-primary-600 hover:bg-primary-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                  : "text-gray-200 bg-gray-400/70 dark:bg-gray-700/60 cursor-not-allowed"
              }`}
            >
              {isProcessingClaim ? "Processing..." :
               shouldBeAbleToClaimDigimon ? (hasMaxDigimon ? "Claim (to Storage)" : "Claim") : "🔒 Claim"}
            </button>
          </div>
        </div>
      </div>
      
      {isSelectionModalOpen && (
        <DigimonSelectionModal
          isOpen={isSelectionModalOpen}
          onClose={() => setIsSelectionModalOpen(false)}
          onSelect={handleDigimonSelection}
          isNXChance={isNXChance}
        />
      )}
    </>
  );
};

export default MilestoneProgress;