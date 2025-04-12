import React, { useState, useEffect } from "react";
import { Task } from "../store/taskStore";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const [isTaskOverdue, setIsTaskOverdue] = useState(false);

  useEffect(() => {
    const checkOverdue = () => {
      if (task.is_completed || task.is_daily || !task.due_date) {
        setIsTaskOverdue(false);
        return;
      }
      
      const dueDate = new Date(task.due_date);
      const now = new Date();
      setIsTaskOverdue(dueDate < now);
    };
    
    checkOverdue();
    
    const intervalId = setInterval(checkOverdue, 10000);
    
    return () => clearInterval(intervalId);
  }, [task]);

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    
    // // Log the raw date for debugging
    // console.log(`Raw date string: ${dateString}`);
    // console.log(`Parsed date: ${date.toString()}`);
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format the time - ensure it's visible
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    // Check if it's today, tomorrow, or yesterday
    if (date.getTime() >= today.getTime() && date.getTime() < tomorrow.getTime()) {
      return `Today at ${timeString}`;
    } else if (date.getTime() >= tomorrow.getTime() && date.getTime() < tomorrow.getTime() + 86400000) {
      return `Tomorrow at ${timeString}`;
    } else if (date.getTime() >= yesterday.getTime() && date.getTime() < today.getTime()) {
      return `Yesterday at ${timeString}`;
    } else {
      // Format the date with the time
      const dateOptions: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      };
      return `${date.toLocaleDateString([], dateOptions)} at ${timeString}`;
    }
  };

  // Check if task is overdue
  // const isOverdue = () => {
  //   if (task.is_completed || task.is_daily || !task.due_date) return false;
  //   return new Date(task.due_date) < new Date();
  // };

  const debugInfo = () => {
    if (!task.due_date) return null;
    
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const isOverdue = dueDate < now;
    
    return (
      <div className="text-xs text-gray-400 mt-1">
        Due: {dueDate.toLocaleString()} 
        {isOverdue && ` (${Math.floor((now.getTime() - dueDate.getTime()) / 60000)} minutes overdue)`}
      </div>
    );
  };

  // Get the appropriate color for the task category label
  const getCategoryColor = () => {
    if (task.is_daily) return "bg-blue-100 text-blue-800";
    if (isTaskOverdue && !task.is_completed) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div 
      className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
      role="listitem"
    >
      {/* Circle Checkbox - now centered with items-center */}
      <div className="flex-shrink-0 mr-3">
        <button
          onClick={() => !task.is_completed && onComplete(task.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.is_completed 
              ? "bg-green-500 border-green-500" 
              : "border-gray-300 hover:border-green-500"
          }`}
          title={task.is_completed ? "Task completed" : "Mark as complete"}
          aria-label={`${task.is_completed ? "Task completed" : "Mark as complete"}: ${task.description}`}
          disabled={task.is_completed}
        >
          {task.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Task Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <p className={`${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.description}
          </p>
          
          <button
            onClick={() => onDelete(task.id)}
            className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded"
            title="Delete task"
            aria-label={`Delete task: ${task.description}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex items-center mt-1">
          {/* only show the category if task is daily or overdue */}
          {(task.is_daily || isTaskOverdue) && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor()}`}>
              {task.is_daily ? "Daily" : isTaskOverdue && !task.is_completed ? "Overdue" : "Task"}
            </span>
          )}
          
          <span className="text-xs text-gray-500 ml-2">
            {!task.is_daily && formatDueDate(task.due_date)}
          </span>
        </div>
        
        {process.env.NODE_ENV === 'development' && debugInfo()}
      </div>
    </div>
  );
};

export default TaskItem; 