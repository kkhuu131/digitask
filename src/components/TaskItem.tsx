import React from "react";
import { Task } from "../store/taskStore";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format the time
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    } else {
      // Format the date
      const dateOptions: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      };
      return `${date.toLocaleDateString([], dateOptions)} at ${timeString}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
      <div className="flex-1">
        <p className={`${task.is_completed ? 'line-through text-gray-500' : ''}`}>
          {task.description}
        </p>
        <div className="text-xs text-gray-500">
          {task.is_daily ? "Daily task" : formatDueDate(task.due_date)}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {!task.is_completed && (
          <button
            onClick={() => onComplete(task.id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Complete task"
          >
            ✓
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TaskItem; 