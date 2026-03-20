import { useEffect, useState} from "react";
import { useTaskStore } from "../store/taskStore";
import CleanTaskList from "./CleanTaskList";
import { supabase } from "../lib/supabase";

// Update the state initialization to read from localStorage synchronously
const getSavedAutoAllocateSetting = () => {
  const savedPreference = localStorage.getItem('autoAllocateStats');
  // If there's a saved preference, use it; otherwise use the default (false)
  return savedPreference !== null ? savedPreference === 'true' : false;
};

const TaskList = () => {
  const { loading } = useTaskStore();
  const [, forceUpdate] = useState({});
  // Initialize with the value from localStorage
  const [autoAllocateStats, setAutoAllocateStats] = useState(getSavedAutoAllocateSetting());
  
  // Keep this effect to save the preference when it changes
  useEffect(() => {
    localStorage.setItem('autoAllocateStats', autoAllocateStats.toString());
  }, [autoAllocateStats]);
  
  // Add this effect to load saved stats from the database
  useEffect(() => {
    const loadSavedStats = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("saved_stats")
        .eq("id", userData.user.id)
        .single();
        
      if (profileData && profileData.saved_stats) {
        // Update localStorage with the database values
        localStorage.setItem("savedStats", JSON.stringify(profileData.saved_stats));
      }
    };
    
    loadSavedStats();
  }, []);
  
  // Add a timer to check for newly overdue tasks and update the UI
  useEffect(() => {
    // Force UI update every minute to refresh task status
    const intervalId = setInterval(() => {
      forceUpdate({});
    }, 30 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Loading: skeleton rows that match the real task card layout so nothing jumps
  if (loading) {
    return (
      <div className="py-2">
        {/* Auto-allocate row skeleton */}
        <div className="flex justify-end items-center gap-2 mb-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-dark-200 rounded-full animate-pulse" />
          <div className="h-5 w-9 bg-gray-200 dark:bg-dark-200 rounded-full animate-pulse" />
        </div>
        {/* Search + controls skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-11 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse" />
          <div className="flex gap-4">
            <div className="h-7 w-36 bg-gray-200 dark:bg-dark-200 rounded animate-pulse" />
            <div className="h-7 w-36 bg-gray-200 dark:bg-dark-200 rounded animate-pulse" />
          </div>
        </div>
        {/* Task card skeletons */}
        <div className="space-y-2">
          {([0.82, 0.60, 0.74, 0.50, 0.68] as number[]).map((titleWidth, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-300 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-dark-200 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded-full" style={{ width: `${Math.round(titleWidth * 100)}%` }} />
                  <div className="h-3 bg-gray-200 dark:bg-dark-200 rounded-full w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Phase 4.5 — pill-style toggle switch replacing the raw checkbox.
          State logic (autoAllocateStats, localStorage) is unchanged. */}
      <div className="flex justify-end items-center gap-2 mb-4">
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 select-none">
          Auto-allocate stats
        </span>
        <button
          role="switch"
          aria-checked={autoAllocateStats}
          onClick={() => setAutoAllocateStats(!autoAllocateStats)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 dark:focus:ring-accent-500 ${
            autoAllocateStats ? 'bg-accent-500' : 'bg-gray-300 dark:bg-dark-100'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            autoAllocateStats ? 'translate-x-4' : 'translate-x-1'
          }`} />
        </button>
      </div>
      
      {/* Use the clean task list */}
      <CleanTaskList autoAllocateStats={autoAllocateStats} />
    </div>
  );
};

export default TaskList; 