import { useState, useEffect } from "react";
import { Task, useTaskStore } from "../store/taskStore";
import Select from 'react-select';
import { 
  StatCategory, 
  categoryOptions 
} from "../utils/categoryDetection";

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose }) => {
  const { editTask } = useTaskStore();
  const [description, setDescription] = useState(task.description);
  const [notes, setNotes] = useState(task.notes || "");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("12:00");
  const [category, setCategory] = useState<StatCategory | null>(task.category as StatCategory || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskType, setTaskType] = useState<"daily" | "one-time" | "recurring">(
    task.is_daily ? "daily" : 
    (task.recurring_days && task.recurring_days.length > 0) ? "recurring" : 
    "one-time"
  );
  const [recurringDays, setRecurringDays] = useState<string[]>(task.recurring_days || []);
  const [minDate, setMinDate] = useState<string>("");
  const [minTime, setMinTime] = useState<string>("");
  
  // Initialize date and time from task's due date
  useEffect(() => {
    if (task.due_date) {
      const dueDateTime = new Date(task.due_date);
      
      // Format date as YYYY-MM-DD
      const taskDueDate = dueDateTime.toLocaleDateString('en-CA');
      setDueDate(taskDueDate);
      
      // Format time as HH:MM, rounding to nearest 5 minutes
      const hours = dueDateTime.getHours();
      const minutes = dueDateTime.getMinutes();
      const roundedMinutes = Math.round(minutes / 5) * 5;
      const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours;
      const adjustedMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
      
      const formattedHours = adjustedHours.toString().padStart(2, '0');
      const formattedMinutes = adjustedMinutes.toString().padStart(2, '0');
      setDueTime(`${formattedHours}:${formattedMinutes}`);
    }
  }, [task]);
  
  // Generate time options for the select dropdown with 5-minute intervals
  const timeOptions = Array.from({ length: 24 * 12 }, (_, i) => {
    const hour = Math.floor(i / 12);
    const minute = (i % 12) * 5;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    const value = `${formattedHour}:${formattedMinute}`;
    
    // Format for display (12-hour clock)
    const displayHour = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    const label = `${displayHour}:${formattedMinute.padStart(2, '0')} ${period}`;
    
    return { value, label };
  });

  // Update the customSelectStyles object to properly handle z-indexing
  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '38px',
      borderColor: '#D1D5DB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9CA3AF',
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999, // Ensure menu appears above modal
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999, // Ensure menu portal appears above modal
    })
  };
  
  // Set minimum date and default date/time when component mounts or task type changes
  useEffect(() => {
    // Get today's date in local timezone
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-CA'); // en-CA uses YYYY-MM-DD format
    setMinDate(formattedDate);

    // If switching to one-time task or initializing
    if (taskType === "one-time") {
      // If no date is set yet, default to today
      if (!dueDate) {
        setDueDate(formattedDate);
      }
      
      // Update minimum time and default time if needed
      updateMinTime(dueDate || formattedDate);
    }
  }, [taskType]);

  // Update minimum time whenever date changes
  useEffect(() => {
    if (taskType === "one-time") {
      updateMinTime(dueDate);
    }
  }, [dueDate]);

  // Function to update minimum time based on selected date
  const updateMinTime = (selectedDate: string) => {
    const today = new Date().toLocaleDateString('en-CA');
    
    if (selectedDate === today) {
      // If date is today, minimum time should be current time rounded up to next 5 minutes
      const now = new Date();
      const minutes = Math.ceil(now.getMinutes() / 5) * 5;
      const hours = minutes === 60 ? now.getHours() + 1 : now.getHours();
      const adjustedMinutes = minutes === 60 ? 0 : minutes;
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = adjustedMinutes.toString().padStart(2, '0');
      const minTimeValue = `${formattedHours}:${formattedMinutes}`;
      
      setMinTime(minTimeValue);
      
      // If current time is before min time or no time is set, set to min time
      if (!dueTime || dueTime < minTimeValue) {
        setDueTime(minTimeValue);
      }
    } else {
      setMinTime("00:00");
    }
  };

  // Validate the form
  const isFormValid = () => {
    if (!description.trim()) return false;
    if (taskType === "recurring" && recurringDays.length === 0) return false;
    if (taskType === "one-time") {
      if (!dueDate) return false;
      
      const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
      const now = new Date();
      
      // Check if selected date/time is in the past
      if (selectedDateTime < now) return false;
      
      // If it's today, check against minimum time
      const today = new Date().toLocaleDateString('en-CA');
      if (dueDate === today && dueTime < minTime) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the updates
      const updates: Partial<Task> = {
        description,
        notes: notes || null,
        category: category as string,
      };
      
      // Update task type and related fields
      if (taskType === "daily") {
        updates.is_daily = true;
        updates.recurring_days = null;
        updates.due_date = null;
      } else if (taskType === "recurring") {
        updates.is_daily = false;
        updates.recurring_days = recurringDays;
        updates.due_date = null; // Clear due date for recurring tasks
      } else {
        // One-time task
        updates.is_daily = false;
        updates.recurring_days = null;
        
        // Set due date for one-time tasks
        if (dueDate) {
          const combinedDateTime = new Date(`${dueDate}T${dueTime}`);
          updates.due_date = combinedDateTime.toISOString();
        }
      }
      
      await editTask(task.id, updates);
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
                <label className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="daily"
                    checked={taskType === "daily"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm">Daily</span>
                </label>
                
                <label className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="recurring"
                    checked={taskType === "recurring"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm">Recurring</span>
                </label>
                
                <label className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="one-time"
                    checked={taskType === "one-time"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm">One-time</span>
                </label>
              </div>
            </div>

            {/* Recurring Days Selection */}
            {taskType === "recurring" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat on these days:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 rounded"
                        checked={recurringDays.includes(day)}
                        onChange={() => {
                          if (recurringDays.includes(day)) {
                            setRecurringDays(recurringDays.filter(d => d !== day));
                          } else {
                            setRecurringDays([...recurringDays, day]);
                          }
                        }}
                      />
                      <span className="ml-2 text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date - only show for one-time tasks */}
            {taskType === "one-time" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dueDate}
                    min={minDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Select
                    options={timeOptions}
                    value={timeOptions.find((opt) => opt.value === dueTime)}
                    onChange={(selected) => setDueTime(selected?.value || '')}
                    className="w-full"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category)}
                onChange={(selected) => setCategory(selected?.value as StatCategory)}
                className="w-full"
                styles={customSelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal; 