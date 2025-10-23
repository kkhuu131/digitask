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
      {/* Auto-allocate stats toggle */}
      <div className="flex justify-end mb-4">
        <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoAllocateStats}
            onChange={() => setAutoAllocateStats(!autoAllocateStats)}
            className="form-checkbox h-4 w-4 text-primary-600 dark:text-accent-500 transition duration-150 ease-in-out"
          />
          <span>Auto-allocate stats</span>
        </label>
      </div>
      
      {/* Use the clean task list */}
      <CleanTaskList autoAllocateStats={autoAllocateStats} />
    </div>
  );
};

export default TaskList; 