import { useEffect } from "react";
import { useMilestoneStore, DAILY_QUOTA_MILESTONE, TASKS_COMPLETED_MILESTONE } from "../store/milestoneStore";
import { useDigimonStore } from "../store/petStore";

const MilestoneProgress = () => {
  const { 
    dailyQuotaStreak, 
    tasksCompletedCount, 
    canClaimDigimon, 
    loading, 
    error, 
    fetchMilestones,
    claimDigimon
  } = useMilestoneStore();
  
  const { allUserDigimon } = useDigimonStore();
  const hasMaxDigimon = allUserDigimon.length >= 9;
  
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);
  
  // Calculate percentages for progress bars
  const dailyQuotaPercentage = Math.min(100, (dailyQuotaStreak / DAILY_QUOTA_MILESTONE) * 100);
  const tasksCompletedPercentage = Math.min(100, (tasksCompletedCount / TASKS_COMPLETED_MILESTONE) * 100);
  
  const handleClaimDigimon = async () => {
    if (canClaimDigimon && !hasMaxDigimon) {
      await claimDigimon();
      fetchMilestones();
    }
  };
  
  if (loading && !dailyQuotaStreak && !tasksCompletedCount) {
    return <div className="text-center py-4">Loading milestone progress...</div>;
  }
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Milestone Progress</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Daily Quota Streak */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Daily Quota Streak</span>
            <span className="text-sm text-gray-500">{dailyQuotaStreak} / {DAILY_QUOTA_MILESTONE}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${dailyQuotaPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete your daily quota {DAILY_QUOTA_MILESTONE} times to claim a Digimon.
          </p>
        </div>
        
        {/* Tasks Completed */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Tasks Completed</span>
            <span className="text-sm text-gray-500">{tasksCompletedCount} / {TASKS_COMPLETED_MILESTONE}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${tasksCompletedPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete {TASKS_COMPLETED_MILESTONE} tasks to claim a Digimon.
          </p>
        </div>
        
        {/* Claim Button */}
        <div className="mt-4">
          <button
            onClick={handleClaimDigimon}
            disabled={!canClaimDigimon || loading || hasMaxDigimon}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              canClaimDigimon && !hasMaxDigimon
                ? "bg-primary-600 hover:bg-primary-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : 
             hasMaxDigimon ? "Maximum Digimon Reached (3)" :
             canClaimDigimon ? "Claim New Digimon" : "Reach a Milestone to Claim"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgress;