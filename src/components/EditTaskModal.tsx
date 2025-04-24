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
              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="daily"
                    checked={taskType === "daily"}
                    onChange={(e) => setTaskType(e.target.value as "daily")}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Daily</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="recurring"
                    checked={taskType === "recurring"}
                    onChange={(e) => setTaskType(e.target.value as "recurring")}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Recurring</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="one-time"
                    checked={taskType === "one-time"}
                    onChange={(e) => setTaskType(e.target.value as "one-time")}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">One-time</span>
                </label>
              </div>
            </div>

            {/* Recurring Days Selection */}
            {taskType === "recurring" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat on these days:
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={recurringDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecurringDays([...recurringDays, day]);
                          } else {
                            setRecurringDays(recurringDays.filter((d) => d !== day));
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-primary-600"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Select
                    options={timeOptions}
                    value={timeOptions.find((opt) => opt.value === dueTime)}
                    onChange={(selected) => setDueTime(selected?.value || '')}
                    placeholder="Select time"
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
                disabled={isSubmitting || !description.trim() || (taskType === "recurring" && recurringDays.length === 0)}
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