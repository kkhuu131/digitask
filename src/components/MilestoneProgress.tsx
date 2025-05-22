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
  
  const hasMaxDigimon = allUserDigimon.length >= 12;
  const shouldBeAbleToClaimDigimon = getABITotal() >= getABIThreshold() && !hasMaxDigimon;
  
  useEffect(() => {
    fetchMilestones();
  }, [location.pathname, fetchMilestones]);
  
  const handleOpenSelectionModal = () => {
    if (!shouldBeAbleToClaimDigimon || isProcessingClaim) return;
    
    const hasNXChance = Math.random() < 0.05;
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
        <h2 className="text-xl font-bold mb-4">Milestone Progress 🥚</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">ABI</span>
              <span className="text-sm text-gray-500">{getABITotal()} / {getABIThreshold()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (getABITotal() / getABIThreshold() * 100))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reach a total of {getABIThreshold()} ABI to claim a Digimon. ABI can be earned by evolving or devolving Digimon.
            </p>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleOpenSelectionModal}
              disabled={!shouldBeAbleToClaimDigimon || isProcessingClaim}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                shouldBeAbleToClaimDigimon && !isProcessingClaim
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {hasMaxDigimon ? "Maximum Digimon Reached (12)" :
               isProcessingClaim ? "Processing..." :
               shouldBeAbleToClaimDigimon ? "Hatch a Digimon 🥚" : "Reach ABI Threshold to Claim"}
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