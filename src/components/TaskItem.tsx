import React, { useState, useEffect } from "react";
import { Task } from "../store/taskStore";
import { categoryIcons, StatCategory } from "../utils/categoryDetection";
import EditTaskModal from "./EditTaskModal";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

const DAY_ABBREVIATIONS: Record<string, string> = {
  "Sunday": "Su",
  "Monday": "M",
  "Tuesday": "Tu",
  "Wednesday": "W",
  "Thursday": "Th",
  "Friday": "F",
  "Saturday": "Sa"
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKEND_DAYS = ["Saturday", "Sunday"];

const formatRecurringDays = (days: string[]): string => {
  // Sort days to ensure consistent order
  const sortedDays = [...days].sort((a, b) => 
    WEEKDAYS.concat(WEEKEND_DAYS).indexOf(a) - 
    WEEKDAYS.concat(WEEKEND_DAYS).indexOf(b)
  );

  // Check for weekdays
  if (WEEKDAYS.every(day => sortedDays.includes(day)) && 
      sortedDays.length === WEEKDAYS.length) {
    return "Weekdays";
  }

  // Check for weekends
  if (WEEKEND_DAYS.every(day => sortedDays.includes(day)) && 
      sortedDays.length === WEEKEND_DAYS.length) {
    return "Weekends";
  }

  // Otherwise use abbreviations
  return sortedDays.map(day => DAY_ABBREVIATIONS[day]).join(', ');
};

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onComplete, 
  onDelete, 
  isSelected = false, 
  onSelect,
  compact = false 
}) => {
  const [isTaskOverdue, setIsTaskOverdue] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className={`border-b border-gray-200 dark:border-dark-100 p-0 py-2 sm:p-4 ${task.is_completed ? 'bg-gray-50 dark:bg-dark-500/50' : 'dark:bg-dark-300'} relative ${
      isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : ''
    }`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Selection checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task.id)}
            className="w-4 h-4 text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
          />
        )}

        {/* Action Buttons - Absolutely positioned */}
        <div className="absolute right-1 top-1 flex flex-col-reverse sm:flex-row items-center gap-1 flex-shrink-0">
          {(!task.is_completed || !task.due_date) && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-1 pt-1 sm:p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-accent-400"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="pt-1 sm:p-1 sm:py-2 sm:pr-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Checkbox */}
        <button
          onClick={() => !task.is_completed && onComplete(task.id)}
          className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors ml-2 sm:ml-0 ${
            task.is_completed 
              ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" 
              : "border-gray-300 hover:border-green-500 dark:border-gray-600 dark:hover:border-accent-500"
          }`}
          disabled={task.is_completed}
        >
          {task.is_completed && (
            <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left pr-2 sm:pr-0">
          {/* Description */}
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs sm:text-base pr-8 sm:pr-14 text-left ${
                task.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'
              } ${compact ? 'hover:text-primary-600 dark:hover:text-primary-400' : ''}`}
            >
              {task.description}
            </button>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-1 mt-1 items-center text-[10px] sm:text-xs text-left">
            {task.category && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {categoryIcons[task.category as StatCategory]} {task.category}
              </span>
            )}
            
            {/* Difficulty Badge */}
            {task.difficulty && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                task.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : task.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {task.difficulty === 'easy' ? '⭐' : 
                 task.difficulty === 'medium' ? '⭐⭐' : 
                 '⭐⭐⭐'}
              </span>
            )}
            
            {/* Priority Badge */}
            {task.priority && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                task.priority === 'low' 
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  : task.priority === 'medium'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
                {task.priority === 'low' ? 'Low' : 
                 task.priority === 'medium' ? 'Medium' : 
                 'High'}
              </span>
            )}
            
            {task.is_daily && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Daily
              </span>
            )}
            
            {isTaskOverdue && !task.is_completed && !task.is_daily && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                Overdue
              </span>
            )}
            
            {task.recurring_days && task.recurring_days.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {formatRecurringDays(task.recurring_days)}
              </span>
            )}
            
            {!task.is_daily && !task.recurring_days && (
              <span className="text-gray-500 dark:text-gray-400">
                {formatDueDate(task.due_date)}
              </span>
            )}
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-2 space-y-2">
          {/* Notes section */}
          {task.notes && (
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}

              {/* Task details */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div>Created: {new Date(task.created_at).toLocaleDateString()}</div>
                {task.completed_at && (
                  <div>Completed: {new Date(task.completed_at).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default TaskItem; 