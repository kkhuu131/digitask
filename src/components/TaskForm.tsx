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

const TaskForm = () => {
  const { createTask } = useTaskStore();
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<"daily" | "one-time" | "recurring">("daily");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("12:00"); // Default to noon
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDate, setMinDate] = useState<string>("");
  const [minTime, setMinTime] = useState<string>("");
  const [category, setCategory] = useState<StatCategory | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<StatCategory | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [notes, setNotes] = useState("");
  const [recurringDays, setRecurringDays] = useState<string[]>([]);

  // Set minimum date to today when component mounts
  useEffect(() => {
    // Get today's date in local timezone
    const today = new Date();
    
    // Format as YYYY-MM-DD for the date input
    const formattedDate = today.toLocaleDateString('en-CA'); // en-CA uses YYYY-MM-DD format
    
    setMinDate(formattedDate);
    
    // If no date is selected yet, default to today
    if (!dueDate) {
      setDueDate(formattedDate);
    }
    
    // Update minimum time if date is today
    updateMinTime(formattedDate);
  }, []);
  
  // Update minimum time whenever date changes
  useEffect(() => {
    updateMinTime(dueDate);
  }, [dueDate]);

  // Function to update minimum time based on selected date
  const updateMinTime = (selectedDate: string) => {
    // Get today's date in YYYY-MM-DD format in local timezone
    const today = new Date().toLocaleDateString('en-CA');
    
    if (selectedDate === today) {
      // If date is today, minimum time should be current time rounded up to next 5 minutes
      const now = new Date();
      const minutes = Math.ceil(now.getMinutes() / 5) * 5;
      const hours = minutes === 60 ? now.getHours() + 1 : now.getHours();
      const adjustedMinutes = minutes === 60 ? 0 : minutes;
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = adjustedMinutes.toString().padStart(2, '0');
      const currentTime = `${formattedHours}:${formattedMinutes}`;
      
      setMinTime(currentTime);
      
      // If current time is after selected time, update selected time
      if (dueTime < currentTime) {
        setDueTime(currentTime);
      }
    } else {
      // If date is in the future, any time is valid
      setMinTime("00:00");
    }
  };

  const generateTimeOptions = (minTime: string): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = [];

    const [minHour, minMinute] = minTime.split(':').map(Number);
    const start = minHour * 60 + minMinute;
    const end = 23 * 60 + 55;

    for (let time = start; time <= end; time += 5) {
      const hours24 = Math.floor(time / 60);
      const minutes = time % 60;
      const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';

      const value = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const label = `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;

      options.push({ value, label });
    }

    return options;
  };
  
  const timeOptions = generateTimeOptions(minTime);
  
  // Add a new effect to detect category when description changes
  useEffect(() => {
    if (description.trim().length > 2) {
      const detected = detectCategory(description);
      setDetectedCategory(detected);
      
      // If we detect a category, set it as the selected category
      if (detected) {
        setCategory(detected);
        setShowCategorySelector(false);
      } else {
        // If we can't detect a category and the description is substantial,
        // show the category selector
        if (description.trim().length > 2) {
          setShowCategorySelector(true);
        }
      }
    } else {
      setDetectedCategory(null);
      setShowCategorySelector(false);
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
    } catch (error) {
      console.error("Error creating task:", error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Task Description
        </label>
        <input
          type="text"
          id="description"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you need to do?"
          required
        />
        
        {/* Show detected category */}
        {detectedCategory && (
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-medium">Detected category:</span> {categoryIcons[detectedCategory]} {detectedCategory}
          </div>
        )}
        
        {/* Show category selector if we couldn't detect one */}
        {showCategorySelector && !detectedCategory && (
          <div className="mt-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Couldn't detect a category - what should this task improve?
            </label>
            <Select
              id="category"
              options={categoryOptions}
              value={categoryOptions.find(opt => opt.value === category)}
              onChange={(selected) => setCategory(selected?.value || null)}
              placeholder="Select a category"
              className="mt-1"
            />
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input mt-1"
          placeholder="Add any additional details or notes"
        />
      </div>
      
      <div className="mb-4 text-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Type
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="taskType"
              value="daily"
              checked={taskType === "daily"}
              onChange={() => setTaskType("daily")}
            />
            <span className="ml-2">Daily</span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="taskType"
              value="recurring"
              checked={taskType === "recurring"}
              onChange={() => setTaskType("recurring")}
            />
            <span className="ml-2">Recurring</span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="taskType"
              value="one-time"
              checked={taskType === "one-time"}
              onChange={() => setTaskType("one-time")}
            />
            <span className="ml-2">One-time</span>
          </label>
        </div>
      </div>
      
      {/* Recurring days selection */}
      {taskType === "recurring" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repeat on these days:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <label key={day} className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={recurringDays.includes(day)}
                  onChange={() => {
                    if (recurringDays.includes(day)) {
                      setRecurringDays(recurringDays.filter(d => d !== day));
                    } else {
                      setRecurringDays([...recurringDays, day]);
                    }
                  }}
                />
                <span className="ml-2">{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Due date for one-time tasks */}
      {taskType === "one-time" && (
        <div className="mt-4">
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <div className="mt-1 mb-4 flex space-x-2 text-sm">
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={dueDate}
              min={minDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-1/2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
            />
            <div className="w-1/2">
              <Select
                options={timeOptions}
                value={timeOptions.find((opt) => opt.value === dueTime)}
                onChange={(selected) => setDueTime(selected?.value || '')}
                placeholder="Select time"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !description.trim() || (taskType === "recurring" && recurringDays.length === 0)}
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 