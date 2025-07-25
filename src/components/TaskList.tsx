import { useEffect, useState} from "react";
import { Task, useTaskStore } from "../store/taskStore";
import TaskItem from "./TaskItem";
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
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
              filter === "all"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
              filter === "today"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
              filter === "upcoming"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
              filter === "completed"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            Completed
          </button>
        </div>
        
        <div className="flex items-center">
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
      </div>
      
      <div className="text-center pb-8 pt-4 text-gray-500 dark:text-gray-400">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks found. Add some tasks to get started!
          </div>
        ) : (
          <div>
            {/* Overdue Tasks - only show in relevant filters */}
            {filteredTaskGroups.overdue.length > 0 && (filter === "all" || filter === "active") && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Overdue</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg overflow-hidden">
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
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Today</h3>
                <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg overflow-hidden">
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
                <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Recurring Tasks</h3>
                <div className="bg-white dark:bg-dark-300 border border-indigo-100 dark:border-indigo-900/20 rounded-lg overflow-hidden">
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
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Upcoming</h3>
                <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg overflow-hidden">
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
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Completed</h3>
                <div className="bg-gray-50 dark:bg-dark-400 border border-gray-200 dark:border-dark-300 rounded-lg overflow-hidden">
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