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
      
      // Format time as HH:MM
      const hours = dueDateTime.getHours();
      const minutes = dueDateTime.getMinutes();
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      setDueTime(`${formattedHours}:${formattedMinutes}`);
    }
  }, [task]);

  // Validate the form
  const isFormValid = () => {
    if (!description.trim()) return false;
    if (taskType === "recurring" && recurringDays.length === 0) return false;
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
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block w-full align-middle bg-white dark:bg-dark-300 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Edit Task</h3>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Type</label>
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
                <label className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-400 cursor-pointer bg-white dark:bg-dark-200">
                  <input
                    type="radio"
                    value="daily"
                    checked={taskType === "daily"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600 dark:text-accent-500"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Daily</span>
                </label>
                
                <label className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-400 cursor-pointer bg-white dark:bg-dark-200">
                  <input
                    type="radio"
                    value="recurring"
                    checked={taskType === "recurring"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600 dark:text-accent-500"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Recurring</span>
                </label>
                
                <label className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-400 cursor-pointer bg-white dark:bg-dark-200">
                  <input
                    type="radio"
                    value="one-time"
                    checked={taskType === "one-time"}
                    onChange={(e) => setTaskType(e.target.value as "daily" | "one-time" | "recurring")}
                    className="h-4 w-4 text-primary-600 dark:text-accent-500"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">One-time</span>
                </label>
              </div>
            </div>

            {/* Recurring Days Selection */}
            {taskType === "recurring" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat on these days:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-400 cursor-pointer bg-white dark:bg-dark-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 dark:text-accent-500 rounded"
                        checked={recurringDays.includes(day)}
                        onChange={() => {
                          if (recurringDays.includes(day)) {
                            setRecurringDays(recurringDays.filter(d => d !== day));
                          } else {
                            setRecurringDays([...recurringDays, day]);
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date & Time - only show for one-time tasks */}
            {taskType === "one-time" && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="due-date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="due-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Time
                    </label>
                    <input
                      type="time"
                      id="due-time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category)}
                onChange={(selected) => setCategory(selected?.value as StatCategory)}
                className="w-full"
                classNames={{
                  control: (state) => 
                    `!bg-white dark:!bg-dark-200 !border-gray-300 dark:!border-gray-600 !shadow-none ${
                      state.isFocused ? '!border-primary-500 dark:!border-accent-500' : ''
                    }`,
                  menu: () => "!bg-white dark:!bg-dark-200 !border !border-gray-300 dark:!border-gray-600",
                  option: (state) => 
                    `${state.isSelected 
                      ? '!bg-primary-100 !text-primary-800 dark:!bg-primary-900/30 dark:!text-primary-300' 
                      : state.isFocused 
                        ? '!bg-gray-100 dark:!bg-dark-300' 
                        : '!text-gray-900 dark:!text-gray-300'
                    }`,
                  singleValue: () => "!text-gray-900 dark:!text-gray-100",
                  placeholder: () => "!text-gray-500 dark:!text-gray-400",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-accent-600 hover:bg-primary-700 dark:hover:bg-accent-700 disabled:bg-primary-300 dark:disabled:bg-accent-300"
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