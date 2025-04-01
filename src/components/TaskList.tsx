import { useEffect } from "react";
import { useTaskStore, Task } from "../store/taskStore";
import { format, isPast, isToday } from "date-fns";
import { FaCheck, FaTrash, FaClock } from "react-icons/fa";

const TaskList = () => {
  const { tasks, fetchTasks, completeTask, deleteTask, loading } = useTaskStore();
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Group tasks by status and date
  const todayTasks = tasks.filter(task => 
    (task.is_daily || (task.due_date && isToday(new Date(task.due_date)))) && !task.is_completed
  );
  
  const upcomingTasks = tasks.filter(task => 
    !task.is_daily && task.due_date && !isToday(new Date(task.due_date)) && !isPast(new Date(task.due_date)) && !task.is_completed
  );
  
  const overdueTasks = tasks.filter(task => 
    !task.is_daily && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && !task.is_completed
  );
  
  const completedTasks = tasks.filter(task => task.is_completed);
  
  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks yet. Add some tasks to take care of your pet!</p>
      </div>
    );
  }
  
  const TaskItem = ({ task }: { task: Task }) => {
    const handleComplete = () => {
      if (!task.is_completed) {
        completeTask(task.id);
      }
    };
    
    const handleDelete = () => {
      deleteTask(task.id);
    };
    
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
        task.is_completed 
          ? "bg-gray-100" 
          : task.is_daily 
            ? "bg-blue-50" 
            : task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
              ? "bg-red-50"
              : "bg-white border border-gray-200"
      }`}>
        <div className="flex items-center">
          <button
            onClick={handleComplete}
            disabled={task.is_completed}
            className={`mr-3 p-1 rounded-full ${
              task.is_completed 
                ? "bg-green-100 text-green-500 cursor-default" 
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <FaCheck className={task.is_completed ? "opacity-100" : "opacity-0"} size={12} />
          </button>
          
          <div>
            <p className={`text-sm font-medium ${task.is_completed ? "line-through text-gray-500" : ""}`}>
              {task.description}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {task.is_daily ? (
                <span className="flex items-center">
                  <FaClock className="mr-1" size={10} />
                  Daily
                </span>
              ) : task.due_date ? (
                <span className="flex items-center">
                  <FaClock className="mr-1" size={10} />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                </span>
              ) : null}
              
              {task.completed_at && (
                <span className="ml-2">
                  Completed: {format(new Date(task.completed_at), "MMM d, h:mm a")}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500"
          title="Delete task"
        >
          <FaTrash size={14} />
        </button>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {overdueTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">Overdue</h3>
          <div>
            {overdueTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
      
      {todayTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Today</h3>
          <div>
            {todayTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
      
      {upcomingTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Upcoming</h3>
          <div>
            {upcomingTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-500">Completed</h3>
          <div>
            {completedTasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
            {completedTasks.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                + {completedTasks.length - 5} more completed tasks
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 