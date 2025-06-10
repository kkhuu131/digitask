import { useEffect, useState } from "react";
import { useDigimonStore } from "../store/petStore";
import { useTaskStore } from "../store/taskStore";
import Digimon from "../components/Digimon";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import StatProgressMeter from "@/components/StatProgressMeter";
import { useNavigate } from "react-router-dom";
import { useTitleStore } from '../store/titleStore';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';

const Dashboard: React.FC = () => {
  const { userDigimon, digimonData, evolutionOptions, fetchUserDigimon, error: digimonError, } = useDigimonStore();
  const { fetchTasks, dailyQuota, error: taskError, getExpMultiplier } = useTaskStore();
  const navigate = useNavigate();
  const { checkForNewTitles } = useTitleStore();
  
  // Add state to force re-render when tasks are completed
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    fetchUserDigimon();
    fetchTasks();
  }, [fetchUserDigimon, fetchTasks]);
  
  // Add listener for task completion to refresh Digimon data
  useEffect(() => {
    const handleTaskComplete = () => {
      fetchUserDigimon();
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('task-completed', handleTaskComplete);
    
    return () => {
      window.removeEventListener('task-completed', handleTaskComplete);
    };
  }, [fetchUserDigimon]);
  
  useEffect(() => {
    const checkUserDigimon = async () => {
      try {
        // If no Digimon, redirect to create-pet
        if (!userDigimon) {
          console.log("No Digimon found");
          // navigate("/create-pet");
        }
      } catch (error) {
        console.error("Error checking user Digimon:", error);
      }
    };
    
    checkUserDigimon();
  }, [userDigimon, navigate]);
  
  useEffect(() => {
    // Check for any new titles based on current stats
    checkForNewTitles();
  }, [checkForNewTitles]);
  
  const DAILY_QUOTA_REQUIREMENT = 3.0; // Should match the quota in taskStore.ts

  const quotaPercentage = Math.min(100, ((dailyQuota?.completed_today || 0) / DAILY_QUOTA_REQUIREMENT) * 100);
  const streak = dailyQuota?.current_streak || 0;
  const expMultiplier = getExpMultiplier();
  
  const dashboardTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to your Digitask dashboard! This is where you'll manage your tasks and watch your Digimon grow."
    },
    {
      speaker: 'neemon',
      text: "Ooh, look at your Digimon! That's your digital partner. It gets stronger when you complete tasks!"
    },
    {
      speaker: 'bokomon',
      text: "Indeed! Your Digimon's happiness will decrease if you miss tasks, so be diligent in completing them."
    },
    {
      speaker: 'neemon',
      text: "And you can create new tasks over there! Just click the button and fill in what you need to do."
    },
    {
      speaker: 'bokomon',
      text: "Completing tasks earns you experience points and stat points. Daily tasks and recurring tasks will reset at 8:00 UTC each day or specific days, respectively. One-time tasks have a specific due date and time."
    },
    {
      speaker: 'neemon',
      text: "What are these meters? 'Daily Quota' and 'Stats Gained Today'?"
    },
    {
      speaker: 'bokomon',
      text: "The 'Daily Quota' meter shows how many tasks you've completed today. You'll want to complete at least 3 tasks daily to maintain a streak and earn extra XP."
    },
    {
      speaker: 'bokomon',
      text: "The 'Stats Gained Today' meter shows how many stat points you've gained today from tasks. These will increase with your Digimon collection."
    },
    {
      speaker: 'neemon',
      text: "Oh, and in your tasks, you can see an option to auto allocate the stat points from completed tasks to your active Digimon or to save to add later."
    },
    {
      speaker: 'both',
      text: "We're excited to see how you and your Digimon grow together. Good luck on your journey!"
    }
  ];
  
  if (!userDigimon || !digimonData) {
    return (
      <div className="text-center py-12">
        <p>Loading your Digimon...</p>
        {digimonError && <p className="text-red-500 mt-2">{digimonError}</p>}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Beta Notice Banner */}
        <div className="lg:col-span-3 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 dark:border-indigo-600 p-4 rounded-r-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex justify-between items-center w-full">
              <div>
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  <span className="font-medium">Check out the latest updates in the Help &gt; Patch Notes page.</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <a 
                  href="https://forms.gle/4geGdXkywwAQcZDt6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full transition-colors"
                >
                  Feedback
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Digimon 
            userDigimon={userDigimon} 
            digimonData={digimonData} 
            evolutionOptions={evolutionOptions}
            key={`digimon-${refreshTrigger}`} // Add key to force re-render
          />
          <div className="card my-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold dark:text-gray-100">Daily Quota</h3>
              {streak > 0 && (
                <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-sm">
                  <span className="mr-1">🔥</span>
                  <span>x{streak} day streak</span>
                  {streak > 1 && (
                    <span className="ml-1 text-xs font-semibold">(×{expMultiplier.toFixed(1)} XP)</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
              <span>Tasks Completed Today</span>
              <span>{dailyQuota?.completed_today || 0}/{DAILY_QUOTA_REQUIREMENT}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-2">
              <div 
                className={`h-2.5 rounded-full ${
                  quotaPercentage >= 100 ? 'bg-green-500 dark:bg-green-400' : 
                  quotaPercentage >= 66 ? 'bg-yellow-500 dark:bg-yellow-400' : 
                  'bg-red-500 dark:bg-red-400'
                }`}
                style={{ 
                  width: `${quotaPercentage}%`
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Complete at least {DAILY_QUOTA_REQUIREMENT} tasks daily to maintain a streak and earn extra XP.
            </p>
          </div>

          <div className="card my-6">
            <StatProgressMeter />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <TaskForm />
          
          {taskError && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-200">{taskError}</p>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  <span className="font-medium">Daily tasks and quotas</span> get reset each day at {(() => {
                    const resetTime = new Date();
                    resetTime.setUTCHours(8, 0, 0, 0);
                    
                    return resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  })()} (8:00 UTC).
                  <br />
                  <span className="font-medium">One-time tasks</span> include specific due dates and times.
                </p>
              </div>
            </div>
          </div>
          
          <div className="card px-0 sm:px-4">
            <h2 className="text-xl font-bold text-center sm:text-left dark:text-gray-100">Your Tasks</h2>
            <TaskList />
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <button 
                onClick={() => useTaskStore.getState().debugOverdueTasks()}
                className="underline mr-2"
              >
                Debug Overdue Tasks
              </button>
              
              <button 
                onClick={() => useDigimonStore.getState().fetchUserDigimon()}
                className="underline mr-2"
              >
                Refresh Digimon Data
              </button>
              
              <button 
                onClick={() => useDigimonStore.getState().testPenalty()}
                className="underline mr-2"
              >
                Test Penalty
              </button>
              
              <button 
                onClick={() => useDigimonStore.getState().debugHealth()}
                className="underline"
              >
                Debug Health
              </button>
            </div>
          )}
        </div>
      </div>
      <PageTutorial tutorialId="dashboard_intro" steps={dashboardTutorialSteps} />
    </>
  );
};

export default Dashboard; 