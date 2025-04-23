import { useEffect, useState} from "react";
import { Task, useTaskStore } from "../store/taskStore";
import TaskItem from "./TaskItem";
import { useDigimonStore } from "../store/petStore";
import { supabase } from "../lib/supabase";

// Update the state initialization to read from localStorage synchronously
const getSavedAutoAllocateSetting = () => {
  const savedPreference = localStorage.getItem('autoAllocateStats');
  // If there's a saved preference, use it; otherwise use the default (false)
  return savedPreference !== null ? savedPreference === 'true' : false;
};

const TaskList = () => {
  const { tasks, completeTask, deleteTask } = useTaskStore();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "today" | "upcoming">("all");
  const [, forceUpdate] = useState({});
  // Initialize with the value from localStorage
  const [autoAllocateStats, setAutoAllocateStats] = useState(getSavedAutoAllocateSetting());
  const { userDigimon } = useDigimonStore();
  
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
  
  // Handle task completion with allocation preference
  const handleCompleteTask = async (taskId: string) => {
    // Pass the allocation preference to the completeTask function
    await completeTask(taskId, autoAllocateStats);
  };
  
  // Add a timer to check for newly overdue tasks and update the UI
  useEffect(() => {
    // Force UI update every minute to refresh task status
    const intervalId = setInterval(() => {
      console.log("Forcing task list UI update");
      forceUpdate({});
    }, 30 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Ensure consistent date handling across browsers
  const isTaskDueToday = (task: Task) => {
    if (!task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate.getTime() === today.getTime();
  };

  // Debug date handling
  useEffect(() => {
    if (tasks.length > 0) {
      console.log("Current date:", new Date().toISOString());
      console.log("Today's tasks:", tasks.filter(isTaskDueToday));
    }
  }, [tasks]);
  
  // Get filtered tasks based on the current filter
  const getFilteredTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (filter) {
      case "all":
        return tasks;
      case "active":
        return tasks.filter(task => !task.is_completed);
      case "completed":
        return tasks.filter(task => task.is_completed);
      case "today":
        return tasks.filter(task => {
          if (task.is_completed) return false;
          if (!task.due_date) return false;
          
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === now.getTime();
        });
      case "upcoming":
        return tasks.filter(task => {
          if (task.is_completed) return false;
          if (!task.due_date) return false;
          
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() > now.getTime();
        });
      default:
        return tasks;
    }
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Group tasks by category for display
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Sort function for tasks by due date (most recent first)
  const sortByDueDate = (a: Task, b: Task) => {
    // If no due date, put at the bottom
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    
    // Sort by due date (most recent first)
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  };
  
  // Only show active daily tasks in the Daily section
  const dailyTasks = filteredTasks
    .filter((task) => task.is_daily && !task.is_completed)
    .sort((a, b) => a.description.localeCompare(b.description)); // Sort alphabetically
  
  const overdueTasks = filteredTasks
    .filter((task) => {
      if (task.is_daily || task.is_completed || !task.due_date) return false;
      return new Date(task.due_date) < today;
    })
    .sort(sortByDueDate);
  
  const todayTasks = filteredTasks
    .filter((task) => {
      if (task.is_daily || task.is_completed || !task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    })
    .sort(sortByDueDate);
  
  const futureTasks = filteredTasks
    .filter((task) => {
      if (task.is_daily || task.is_completed || !task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() > today.getTime();
    })
    .sort(sortByDueDate);
  
  const completedTasks = filteredTasks
    .filter((task) => task.is_completed)
    .sort((a, b) => {
      // Sort completed tasks by completion date (most recent first)
      if (a.completed_at && b.completed_at) {
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      }
      return sortByDueDate(a, b);
    });
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              filter === "all" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              filter === "active" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              filter === "today" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
            }`}
            onClick={() => setFilter("today")}
          >
            Today
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              filter === "upcoming" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
            }`}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              filter === "completed" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
        
        {/* Stat Allocation Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Stat Allocation:</span>
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoAllocateStats ? 'bg-primary-500' : 'bg-gray-300'
            } cursor-pointer`}
            onClick={() => setAutoAllocateStats(!autoAllocateStats)}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoAllocateStats ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-xs font-medium">
            {autoAllocateStats ? 
              <span className="text-primary-600">Auto</span> : 
              <span className="text-purple-600">Save</span>
            }
          </span>
          <div className="relative group">
            <span className="cursor-help text-gray-400 text-xs">ⓘ</span>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10">
              {autoAllocateStats ? 
                "Stats from completed tasks will be automatically applied to your active Digimon." :
                "Stats from completed tasks will be saved for later allocation to any Digimon."
              }
            </div>
          </div>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks found. Add some tasks to get started!
        </div>
      ) : (
        <div>
          {/* Active Digimon Info - only show when auto-allocate is on */}
          {autoAllocateStats && userDigimon && (
            <div className="mb-4 p-2 bg-primary-50 border border-primary-100 rounded-lg text-xs text-gray-600">
              Stats will be applied to: <span className="font-medium">{userDigimon.name || userDigimon.digimon?.name}</span>
            </div>
          )}
          
          {/* Overdue Tasks - only show in relevant filters */}
          {overdueTasks.length > 0 && (filter === "all" || filter === "active" || filter === "today") && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 mb-2">Overdue</h3>
              <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                {overdueTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Today's Tasks - only show in relevant filters */}
          {todayTasks.length > 0 && (filter === "all" || filter === "active" || filter === "today") && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Today</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {todayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Daily Tasks - only show in relevant filters */}
          {dailyTasks.length > 0 && (filter === "all" || filter === "active") && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Daily</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {dailyTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Future Tasks - only show in relevant filters */}
          {futureTasks.length > 0 && (filter === "all" || filter === "active" || filter === "upcoming") && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {futureTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Completed Tasks - only show in relevant filters */}
          {completedTasks.length > 0 && (filter === "all" || filter === "completed") && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList; 