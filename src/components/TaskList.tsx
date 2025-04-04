import { useEffect, useState, useMemo } from "react";
import { useTaskStore } from "../store/taskStore";
import TaskItem from "./TaskItem";

const TaskList = () => {
  const { tasks, completeTask, deleteTask } = useTaskStore();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [, forceUpdate] = useState({});
  
  // Add a timer to check for newly overdue tasks and update the UI
  useEffect(() => {
    // Force UI update every minute to refresh task status
    const intervalId = setInterval(() => {
      console.log("Forcing task list UI update");
      forceUpdate({});
    }, 30 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Use useMemo for expensive calculations
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "active") return !task.is_completed;
      if (filter === "completed") return task.is_completed;
      return true;
    });
  }, [tasks, filter]);
  
  // Group tasks by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dailyTasks = filteredTasks.filter((task) => task.is_daily);
  
  const overdueTasks = filteredTasks.filter((task) => {
    if (task.is_daily || task.is_completed || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  });
  
  const todayTasks = filteredTasks.filter((task) => {
    if (task.is_daily || task.is_completed || !task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate >= today && dueDate < tomorrow && !overdueTasks.includes(task);
  });
  
  const futureTasks = filteredTasks.filter((task) => {
    if (task.is_daily || task.is_completed || !task.due_date) return false;
    return new Date(task.due_date) >= tomorrow && !overdueTasks.includes(task);
  });
  
  const completedTasks = filteredTasks.filter((task) => task.is_completed);
  
  return (
    <div>
      <div className="flex space-x-2 mb-4">
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
            filter === "completed" ? "bg-primary-100 text-primary-800" : "bg-gray-100"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks found. Add some tasks to get started!
        </div>
      ) : (
        <div>
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 mb-2">Overdue</h3>
              <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                {overdueTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Daily Tasks */}
          {dailyTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Daily</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {dailyTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Today's Tasks */}
          {todayTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Today</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {todayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Future Tasks */}
          {futureTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {futureTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Completed Tasks */}
          {completedTasks.length > 0 && filter !== "active" && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
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