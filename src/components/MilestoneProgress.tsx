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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-heading font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Hatchery
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-body uppercase tracking-wide text-gray-500 dark:text-gray-400">ABI Progress</span>
              <span className="text-xs font-body text-gray-600 dark:text-gray-300 font-semibold">{getABITotal()} / {getABIThreshold()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (getABITotal() / getABIThreshold() * 100))}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-body text-gray-400 dark:text-gray-500">
              Earn ABI by evolving or devolving · Unlock a new Digimon
            </p>
          </div>

          <button
            onClick={handleOpenSelectionModal}
            disabled={!shouldBeAbleToClaimDigimon || isProcessingClaim}
            className={`w-full py-2 px-3 rounded-xl text-sm font-heading font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
              shouldBeAbleToClaimDigimon && !isProcessingClaim
                ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 cursor-pointer shadow-sm"
                : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-200 cursor-not-allowed"
            }`}
          >
            {!shouldBeAbleToClaimDigimon && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            )}
            {isProcessingClaim ? "Processing..." :
             shouldBeAbleToClaimDigimon ? (hasMaxDigimon ? "Claim (to Storage)" : "Claim New Digimon") : "Claim"}
          </button>
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