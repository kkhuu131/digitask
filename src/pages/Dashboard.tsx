import { useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useTaskStore } from "../store/taskStore";
import Digimon from "../components/Digimon";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import StatProgressMeter from "@/components/StatProgressMeter";

const Dashboard: React.FC = () => {
  const { userDigimon, digimonData, evolutionOptions, fetchUserDigimon, error: digimonError } = useDigimonStore();
  const { fetchTasks, dailyQuota, error: taskError, getExpMultiplier } = useTaskStore();
  
  useEffect(() => {
    fetchUserDigimon();
    fetchTasks();
  }, [fetchUserDigimon, fetchTasks]);
  
  const DAILY_QUOTA_REQUIREMENT = 3.0; // Should match the quota in taskStore.ts

  const quotaPercentage = Math.min(100, ((dailyQuota?.completed_today || 0) / DAILY_QUOTA_REQUIREMENT) * 100);
  const streak = dailyQuota?.current_streak || 0;
  const expMultiplier = getExpMultiplier();
  
  if (!userDigimon || !digimonData) {
    return (
      <div className="text-center py-12">
        <p>Loading your Digimon...</p>
        {digimonError && <p className="text-red-500 mt-2">{digimonError}</p>}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Beta Notice Banner */}
      <div className="lg:col-span-3 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-md shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex justify-between items-center w-full">
            <div>
              <p className="text-sm text-indigo-800">
                <span className="font-medium">Digitask is in beta! Check our the latest updates in the Patch Notes page.</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <a 
                href="https://forms.gle/4geGdXkywwAQcZDt6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full transition-colors"
              >
                Bug Report
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
        />
        <div className="card my-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Daily Quota</h3>
            {streak > 0 && (
              <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                <span className="mr-1">🔥</span>
                <span>x{streak} day streak</span>
                {streak > 1 && (
                  <span className="ml-1 text-xs font-semibold">(×{expMultiplier.toFixed(1)} XP)</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm mb-1">
            <span>Tasks Completed Today</span>
            <span>{dailyQuota?.completed_today || 0}/{DAILY_QUOTA_REQUIREMENT}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
            <div 
              className={`h-2.5 rounded-full ${
                quotaPercentage >= 100 ? 'bg-green-500' : 
                quotaPercentage >= 66 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ 
                width: `${quotaPercentage}%`
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Complete at least {DAILY_QUOTA_REQUIREMENT} tasks daily to keep your Digimon happy and healthy.
          </p>
        </div>

        <div className="card my-6">
          <StatProgressMeter />
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <TaskForm />
        
        {taskError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{taskError}</p>
          </div>
        )}
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
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
        
        <div className="card">
          <h2 className="text-xl font-bold">Your Tasks</h2>
          <TaskList />
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-500">
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
  );
};

export default Dashboard; 