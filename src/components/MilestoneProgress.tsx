import { useEffect, useState } from "react";
import { useMilestoneStore, DAILY_QUOTA_MILESTONE, TASKS_COMPLETED_MILESTONE } from "../store/milestoneStore";
import { useDigimonStore } from "../store/petStore";
import { useLocation } from "react-router-dom";
import { useTaskStore } from "../store/taskStore";

const MilestoneProgress = () => {
  const { 
    dailyQuotaStreak, 
    tasksCompletedCount, 
    loading, 
    error, 
    fetchMilestones,
    claimDigimon,
    checkCanClaimDigimon
  } = useMilestoneStore();
  
  const { allUserDigimon } = useDigimonStore();
  const { tasks, dailyQuota } = useTaskStore();
  const hasMaxDigimon = allUserDigimon.length >= 9;
  const location = useLocation();
  
  // Calculate if user should be able to claim based on current values
  const shouldBeAbleToClaimDigimon = 
    (dailyQuotaStreak >= DAILY_QUOTA_MILESTONE || 
     tasksCompletedCount >= TASKS_COMPLETED_MILESTONE) && 
    !hasMaxDigimon;
  
  // Fetch milestones on initial load
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);
  
  // Refresh when the location changes (user navigates between tabs)
  useEffect(() => {
    fetchMilestones();
  }, [location.pathname, fetchMilestones]);
  
  // Force a refresh of the canClaimDigimon state whenever milestone values change
  useEffect(() => {
    checkCanClaimDigimon();
  }, [dailyQuotaStreak, tasksCompletedCount, checkCanClaimDigimon]);
  
  // Add a focus event listener to refresh data when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      fetchMilestones();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchMilestones]);
  
  // Refresh milestones when tasks or daily quota changes
  useEffect(() => {
    fetchMilestones();
  }, [
    // When completed tasks count changes
    tasks.filter(task => task.is_completed).length,
    // When daily quota changes
    dailyQuota?.completed_today,
    fetchMilestones
  ]);
  
  // Calculate percentages for progress bars
  const dailyQuotaPercentage = Math.min(100, (dailyQuotaStreak / DAILY_QUOTA_MILESTONE) * 100);
  const tasksCompletedPercentage = Math.min(100, (tasksCompletedCount / TASKS_COMPLETED_MILESTONE) * 100);
  
  // Improve the claim button functionality
  const [isClaimingDigimon, setIsClaimingDigimon] = useState(false);

  const handleClaimDigimon = async () => {
    // Prevent multiple clicks
    if (isClaimingDigimon) return;
    
    try {
      // Double-check that user can claim before proceeding
      if (shouldBeAbleToClaimDigimon) {
        setIsClaimingDigimon(true);
        const success = await claimDigimon();
        
        if (success) {
          // Force refresh milestones and Digimon data after claiming
          await fetchMilestones();
          await useDigimonStore.getState().fetchAllUserDigimon();
        }
      }
    } catch (error) {
      console.error("Error claiming Digimon:", error);
    } finally {
      setIsClaimingDigimon(false);
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
        
        {/* Claim Button - Use shouldBeAbleToClaimDigimon instead of canClaimDigimon */}
        <div className="mt-4">
          <button
            onClick={handleClaimDigimon}
            disabled={!shouldBeAbleToClaimDigimon || isClaimingDigimon}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              shouldBeAbleToClaimDigimon && !isClaimingDigimon
                ? "bg-primary-600 hover:bg-primary-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isClaimingDigimon ? "Claiming..." : 
             hasMaxDigimon ? "Maximum Digimon Reached (9)" :
             shouldBeAbleToClaimDigimon ? "Claim New Digimon" : "Reach a Milestone to Claim"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgress;