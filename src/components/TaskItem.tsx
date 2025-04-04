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
  const isOverdue = () => {
    if (task.is_completed || task.is_daily || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

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

  return (
    <div 
      className="flex items-center justify-between p-3 border-b last:border-b-0"
      role="listitem"
    >
      <div className="flex-1">
        <p className={`${task.is_completed ? 'line-through text-gray-500' : ''}`}>
          {task.description}
        </p>
        <div className={`text-xs ${isTaskOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}
             aria-live="polite">
          {task.is_daily ? "Daily task" : formatDueDate(task.due_date)}
          {isTaskOverdue && !task.is_completed && " (Overdue)"}
        </div>
        {process.env.NODE_ENV === 'development' && debugInfo()}
      </div>
      
      <div className="flex space-x-2">
        {!task.is_completed && (
          <button
            onClick={() => onComplete(task.id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Complete task"
            aria-label={`Complete task: ${task.description}`}
          >
            ✓
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Delete task"
          aria-label={`Delete task: ${task.description}`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TaskItem; 