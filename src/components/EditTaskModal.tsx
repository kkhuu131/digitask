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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(task.difficulty || 'medium');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium');
  
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
        difficulty,
        priority,
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
                placeholder="What do you need to do?"
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
                placeholder="Any details or notes about this task"
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Type</label>
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
            </div>

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

            {/* Difficulty & Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty & Priority
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
                  >
                    <option value="easy">Easy ⭐</option>
                    <option value="medium">Medium ⭐⭐</option>
                    <option value="hard">Hard ⭐⭐⭐</option>
                  </select>
                </div>
                <div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-accent-500 dark:focus:border-accent-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (+reward multiplier)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
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