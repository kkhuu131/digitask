import { useState, useEffect } from "react";
import { Task, useTaskStore } from "../store/taskStore";
import Select from 'react-select';
import { 
  StatCategory, 
  detectCategory, 
  categoryDescriptions, 
  categoryIcons,
} from "../utils/categoryDetection";

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

interface TaskFormProps {
  onTaskCreated?: () => void;
}

const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
  const { createTask } = useTaskStore();
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<"daily" | "one-time" | "recurring">("daily");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("12:00"); // Default to noon
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<StatCategory | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<StatCategory | null>(null);
  const [notes, setNotes] = useState("");
  const [recurringDays, setRecurringDays] = useState<string[]>([]);

  // Set default date to today when component mounts
  useEffect(() => {
    // Get today's date in local timezone
    const today = new Date();
    
    // Format as YYYY-MM-DD for the date input
    const formattedDate = today.toLocaleDateString('en-CA'); // en-CA uses YYYY-MM-DD format
    
    // If no date is selected yet, default to today
    if (!dueDate) {
      setDueDate(formattedDate);
    }
    
    // Initialize time value
    updateMinTime();
  }, []);
  
  // Update minimum time whenever date changes
  useEffect(() => {
    updateMinTime();
  }, [dueDate]);

  // Function to update minimum time based on selected date
  const updateMinTime = () => {
    // This function now simply ensures time values are properly formatted
    // We've removed the restriction that tasks must be in the future
    
    // If no due time is set, default to current time rounded up to next 5 minutes
    if (!dueTime) {
      const now = new Date();
      const minutes = Math.ceil(now.getMinutes() / 5) * 5;
      const hours = minutes === 60 ? now.getHours() + 1 : now.getHours();
      const adjustedMinutes = minutes === 60 ? 0 : minutes;
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = adjustedMinutes.toString().padStart(2, '0');
      const currentTime = `${formattedHours}:${formattedMinutes}`;
      
      setDueTime(currentTime);
    }
  };
  
  // Add a new effect to detect category when description changes
  useEffect(() => {
    if (description.trim().length > 2) {
      const detected = detectCategory(description);
      setDetectedCategory(detected);
      
      // If we detect a category, set it as the selected category
      if (detected) {
        setCategory(detected);
      }
    } else {
      setDetectedCategory(null);
    }
  }, [description]);

  // Create category options for the dropdown
  const categoryOptions = Object.entries(categoryDescriptions).map(([value, description]) => ({
    value: value as StatCategory,
    label: `${categoryIcons[value as StatCategory]} ${value} - ${description}`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the task data
      const taskData: Partial<Task> = {
        description: description.trim(),
        notes: notes.trim() || null,
        category: category || detectedCategory,
        is_daily: taskType === "daily",
        recurring_days: taskType === "recurring" ? recurringDays : null,
      };
      
      // Add due date for one-time tasks
      if (taskType === "one-time" && dueDate) {
        const combinedDateTime = new Date(`${dueDate}T${dueTime}`);
        taskData.due_date = combinedDateTime.toISOString();
      }
      
      await createTask(taskData);
      
      // Reset form
      setDescription("");
      setNotes("");
      setCategory(null);
      setDetectedCategory(null);
      setIsSubmitting(false);

      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Task Description
        </label>
        <input
          type="text"
          id="description"
          className="input dark:bg-dark-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you need to do?"
          required
        />
        
        {/* Show detected category */}
        {detectedCategory && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Suggested category:</span> {categoryIcons[detectedCategory]} {detectedCategory}
          </div>
        )}

        {!detectedCategory && description.trim().length > 2 && (
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
            Couldn't detect a category - what should this task improve?
          </label>
        )}
        
        {/* Show category selector if we couldn't detect one */}
        <div className="mt-2">
          <Select
            id="category"
            options={categoryOptions}
            value={categoryOptions.find(opt => opt.value === category)}
            onChange={(selected) => setCategory(selected?.value || null)}
            placeholder="Select a category"
            className="mt-1"
            classNames={{
              control: (state) => 
                `!bg-white dark:!bg-dark-300 !border-gray-300 dark:!border-dark-100 !shadow-none ${
                  state.isFocused ? '!border-primary-500 dark:!border-accent-500' : ''
                }`,
              menu: () => "!bg-white dark:!bg-dark-200 !border dark:!border-dark-100",
              option: (state) => 
                `${state.isSelected 
                  ? '!bg-primary-100 !text-primary-800 dark:!bg-primary-900/30 dark:!text-primary-300' 
                  : state.isFocused 
                    ? '!bg-gray-100 dark:!bg-dark-300' 
                    : 'dark:!text-gray-300'
                }`,
              singleValue: () => "dark:!text-gray-200",
              placeholder: () => "dark:!text-gray-400",
            }}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Task Type
        </label>
        <div className="flex space-x-2 mb-2">
          <button
            type="button"
            onClick={() => setTaskType("one-time")}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              taskType === "one-time"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setTaskType("daily")}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              taskType === "daily"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setTaskType("recurring")}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              taskType === "recurring"
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
            }`}
          >
            Recurring
          </button>
        </div>
        
        {/* Conditional fields based on task type */}
        {taskType === "one-time" && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex-1 mb-2 sm:mb-0">
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="due-date"
                    className="input dark:bg-dark-300"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="due-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="due-time"
                    className="input dark:bg-dark-300 oor"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {taskType === "recurring" && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recurs On
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (recurringDays.includes(day)) {
                      setRecurringDays(recurringDays.filter(d => d !== day));
                    } else {
                      setRecurringDays([...recurringDays, day]);
                    }
                  }}
                  className={`py-1 text-xs rounded-md ${
                    recurringDays.includes(day)
                      ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-100"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
            {recurringDays.length === 0 && (
              <p className="mt-1 text-xs text-red-500">
                Please select at least one day
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          className="input min-h-[60px] dark:bg-dark-300"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details or notes about this task"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || (taskType === "recurring" && recurringDays.length === 0)}
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
        
        {/* Task preview */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {description && (
            <div className="bg-gray-50 dark:bg-dark-400 p-2 rounded-md border border-gray-200 dark:border-dark-300 max-w-xs">
              <p className="font-medium">{description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {category || detectedCategory ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {categoryIcons[category as StatCategory || detectedCategory as StatCategory]} {category || detectedCategory}
                  </span>
                ) : null}
                
                {taskType === "daily" ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Daily
                  </span>
                ) : null}
                
                {taskType === "recurring" && recurringDays.length > 0 ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {recurringDays.map(d => d.substring(0, 3)).join(", ")}
                  </span>
                ) : null}
                
                {taskType === "one-time" && dueDate ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-dark-300 dark:text-gray-300">
                    {new Date(`${dueDate}T${dueTime}`).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default TaskForm; 