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
  
  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
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