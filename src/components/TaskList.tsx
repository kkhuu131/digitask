import { useEffect, useState} from "react";
import { Task, useTaskStore } from "../store/taskStore";
import TaskItem from "./TaskItem";
import { useDigimonStore } from "../store/petStore";
import { supabase } from "../lib/supabase";

// Define an interface for the filtered tasks
interface FilteredTasksGroups {
  daily: Task[];
  recurring: Task[];
  today: Task[];
  overdue: Task[];
  future: Task[];
  completed: Task[];
}

// Update the state initialization to read from localStorage synchronously
const getSavedAutoAllocateSetting = () => {
  const savedPreference = localStorage.getItem('autoAllocateStats');
  // If there's a saved preference, use it; otherwise use the default (false)
  return savedPreference !== null ? savedPreference === 'true' : false;
};

const TaskList = () => {
  const { tasks, deleteTask, completeTask, loading } = useTaskStore();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "today" | "upcoming">("all");
  const [, forceUpdate] = useState({});
  // Initialize with the value from localStorage
  const [autoAllocateStats, setAutoAllocateStats] = useState(getSavedAutoAllocateSetting());
  const { userDigimon } = useDigimonStore();
  
  // Initialize filteredTasks as an object with empty arrays
  const [filteredTaskGroups, setFilteredTaskGroups] = useState<FilteredTasksGroups>({
    daily: [],
    recurring: [],
    today: [],
    overdue: [],
    future: [],
    completed: []
  });
  
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
      forceUpdate({});
    }, 30 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Add a function to determine if a task is a recurring task
  const isRecurringTask = (task: Task) => {
    return !task.is_daily && task.recurring_days && task.recurring_days.length > 0;
  };
  
  // Add a function to determine if a task is due today
  const isTaskDueToday = (task: Task) => {
    if (!task.due_date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate.getTime() === today.getTime();
  };
  
  // Add a function to determine if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (!task.due_date) return false;
    
    const now = new Date();
    const dueDate = new Date(task.due_date);
    
    return dueDate < now;
  };
  
  // Sort function for tasks by due date (most recent first)
  const sortByDueDate = (a: Task, b: Task) => {
    // If no due date, put at the bottom
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    
    // Sort by due date (most recent first)
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  };
  
  // Add this function to check if a recurring task is scheduled for today
  const isRecurringTaskForToday = (task: Task) => {
    if (!task.recurring_days || task.recurring_days.length === 0) return false;
    
    // Get current day of the week
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if today is one of the recurring days
    return task.recurring_days.includes(dayOfWeek);
  };
  
  // Update the filtering logic in the useEffect
  useEffect(() => {
    // Get the current date for comparisons
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter tasks based on completion status
    const activeTasks = tasks.filter(task => !task.is_completed);
    const completedTasks = tasks.filter(task => task.is_completed);
    
    // Daily tasks
    const dailyTasks = activeTasks.filter(task => task.is_daily);
    
    // Recurring tasks
    const recurringTasks = activeTasks.filter(isRecurringTask);
    
    // Recurring tasks for today
    const todayRecurringTasks = recurringTasks.filter(isRecurringTaskForToday);
    
    // One-time tasks
    const nonDailyTasks = activeTasks.filter(task => !task.is_daily && !isRecurringTask(task));
    
    // Today's one-time tasks
    const todayOneTimeTasks = nonDailyTasks.filter(isTaskDueToday);
    
    // Overdue tasks
    const overdueTasks = nonDailyTasks.filter(isTaskOverdue);
    
    // Future tasks (one-time tasks due in the future)
    const futureTasks = nonDailyTasks.filter(task => 
      !isTaskDueToday(task) && !isTaskOverdue(task)
    );
    
    // Sort today's tasks: one-time tasks by due date, then recurring tasks, then daily tasks
    const sortedTodayTasks = [
      ...todayOneTimeTasks.sort(sortByDueDate),
      ...todayRecurringTasks.sort((a, b) => a.description.localeCompare(b.description)),
      ...dailyTasks.sort((a, b) => a.description.localeCompare(b.description))
    ];
    
    // Set filtered task groups
    setFilteredTaskGroups({
      daily: [], // Empty array since we're not showing the Daily section anymore
      recurring: recurringTasks.filter(task => !isRecurringTaskForToday(task)), // Exclude today's recurring tasks
      today: sortedTodayTasks, // Sorted today tasks
      overdue: overdueTasks,
      future: futureTasks,
      completed: completedTasks
    });
  }, [tasks]);
  
  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Filter tabs */}
      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-2 rounded-t-lg ${
                filter === "all"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-2 rounded-t-lg ${
                filter === "active"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-2 rounded-t-lg ${
                filter === "today"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFilter("today")}
            >
              Today
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-2 rounded-t-lg ${
                filter === "upcoming"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-2 rounded-t-lg ${
                filter === "completed"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </li>
        </ul>
      </div>
      
      {/* Auto-allocate toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="auto-allocate"
            type="checkbox"
            checked={autoAllocateStats}
            onChange={(e) => setAutoAllocateStats(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="auto-allocate" className="ml-2 block text-sm text-gray-700">
            Auto-allocate stats to {userDigimon?.name || userDigimon?.digimon?.name || "your Digimon"} when completing tasks
          </label>
        </div>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Add some tasks to get started!
          </div>
        ) : (
          <div>
            {/* Overdue Tasks - only show in relevant filters */}
            {filteredTaskGroups.overdue.length > 0 && (filter === "all" || filter === "active") && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-red-600 mb-2">Overdue</h3>
                <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                  {filteredTaskGroups.overdue.map((task) => (
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
            
            {/* Today Tasks - only show in relevant filters */}
            {filteredTaskGroups.today.length > 0 && (filter === "all" || filter === "active" || filter === "today") && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Today</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {filteredTaskGroups.today.map((task) => (
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
            
            {/* Recurring Tasks - only show in relevant filters */}
            {filteredTaskGroups.recurring.length > 0 && (filter === "all" || filter === "active" || filter === "upcoming") && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-indigo-600 mb-2">Recurring Tasks</h3>
                <div className="bg-white border border-indigo-100 rounded-lg overflow-hidden">
                  {filteredTaskGroups.recurring.map((task) => (
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
            {filteredTaskGroups.future.length > 0 && (filter === "all" || filter === "active" || filter === "upcoming") && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {filteredTaskGroups.future.map((task) => (
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
            {filteredTaskGroups.completed.length > 0 && (filter === "all" || filter === "completed") && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {filteredTaskGroups.completed.map((task) => (
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
    </div>
  );
};

export default TaskList; 