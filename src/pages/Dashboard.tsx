import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDigimonStore } from "../store/petStore";
import { useTaskStore } from "../store/taskStore";
import Digimon from "../components/Digimon";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

const Dashboard: React.FC = () => {
  const { userDigimon, digimonData, evolutionOptions, fetchUserDigimon, error: digimonError, isDigimonDead, resetDeadState } = useDigimonStore();
  const { fetchTasks, dailyQuota, error: taskError} = useTaskStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserDigimon();
    fetchTasks();
  }, [fetchUserDigimon, fetchTasks]);
  
  useEffect(() => {
    if (isDigimonDead) {
      console.log("Digimon is dead, navigating to create pet page");
      resetDeadState();
      navigate("/create-pet");
    }
  }, [isDigimonDead, navigate, resetDeadState]);
  
  const DAILY_QUOTA_REQUIREMENT = 3.0; // Should match the quota in taskStore.ts

  const quotaPercentage = Math.min(100, ((dailyQuota?.completed_today || 0) / DAILY_QUOTA_REQUIREMENT) * 100);
  
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
      <div className="lg:col-span-1">
        <Digimon 
          userDigimon={userDigimon} 
          digimonData={digimonData} 
          evolutionOptions={evolutionOptions} 
        />
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
                <span className="font-medium">Daily tasks</span> reset each day and can be completed again.
                <br />
                <span className="font-medium">One-time tasks</span> include specific due dates and times.
              </p>
            </div>
          </div>
        </div>
        
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-2">Daily Quota</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>Tasks Completed Today</span>
            <span>{dailyQuota?.completed_today || 0}/{DAILY_QUOTA_REQUIREMENT}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${quotaPercentage}%`,
                backgroundColor: quotaPercentage >= 100 ? '#10b981' : quotaPercentage >= 66 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Complete at least {DAILY_QUOTA_REQUIREMENT} tasks daily to keep your Digimon happy and healthy.
          </p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
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