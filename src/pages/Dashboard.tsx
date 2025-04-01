import { useEffect } from "react";
import { useDigimonStore } from "../store/petStore";
import { useTaskStore } from "../store/taskStore";
import Digimon from "../components/Digimon";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

const Dashboard = () => {
  const { userDigimon, digimonData, evolutionOptions, fetchUserDigimon, error: digimonError } = useDigimonStore();
  const { fetchTasks, error: taskError } = useTaskStore();
  
  useEffect(() => {
    fetchUserDigimon();
    fetchTasks();
  }, [fetchUserDigimon, fetchTasks]);
  
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
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 