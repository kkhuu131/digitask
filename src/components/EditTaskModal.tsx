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

  useEffect(() => {
    if (task.due_date) {
      const dueDateTime = new Date(task.due_date);
      const taskDueDate = dueDateTime.toLocaleDateString('en-CA');
      setDueDate(taskDueDate);
      const hours = dueDateTime.getHours();
      const minutes = dueDateTime.getMinutes();
      setDueTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }, [task]);

  const isFormValid = () => {
    if (!description.trim()) return false;
    if (taskType === "recurring" && recurringDays.length === 0) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updates: Partial<Task> = {
        description,
        notes: notes || null,
        category: category as string,
        difficulty,
        priority,
      };
      if (taskType === "daily") {
        updates.is_daily = true;
        updates.recurring_days = null;
        updates.due_date = null;
      } else if (taskType === "recurring") {
        updates.is_daily = false;
        updates.recurring_days = recurringDays;
        updates.due_date = null;
      } else {
        updates.is_daily = false;
        updates.recurring_days = null;
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

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-body text-sm";

  const pillBase = "flex-1 px-3 py-2 text-sm rounded-xl font-body font-semibold transition-all duration-150 border focus:outline-none cursor-pointer";
  const pillActive = "bg-secondary-600 text-white border-secondary-600 shadow-sm";
  const pillInactive = "bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white dark:bg-dark-300 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-100">
            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
              Edit Task
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Task Description
              </label>
              <input
                type="text"
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                placeholder="What do you need to do?"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category) ?? null}
                onChange={(selected) => setCategory(selected?.value as StatCategory)}
                isClearable
                placeholder="Select a stat category..."
                classNames={{
                  control: (state) =>
                    `!rounded-xl !border !bg-white dark:!bg-dark-300 dark:!border-dark-100 !shadow-none !text-sm ${
                      state.isFocused
                        ? '!border-purple-500 dark:!border-purple-500 !ring-2 !ring-purple-500/30'
                        : '!border-gray-200'
                    }`,
                  menu: () => "!rounded-xl !bg-white dark:!bg-dark-200 !border dark:!border-dark-100 !shadow-lg",
                  option: (state) =>
                    `!text-sm ${
                      state.isSelected
                        ? '!bg-secondary-600 !text-white'
                        : state.isFocused
                        ? '!bg-purple-50 dark:!bg-dark-300 dark:!text-gray-200'
                        : 'dark:!text-gray-300'
                    }`,
                  singleValue: () => "dark:!text-gray-100 !text-sm",
                  placeholder: () => "dark:!text-gray-500 !text-sm",
                  input: () => "dark:!text-gray-100",
                  clearIndicator: () => "dark:!text-gray-400 hover:dark:!text-gray-200",
                  dropdownIndicator: () => "dark:!text-gray-400",
                  indicatorSeparator: () => "dark:!bg-dark-100",
                }}
              />
            </div>

            {/* Priority + Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`${pillBase} ${priority === p
                        ? p === 'low' ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                          : p === 'medium' ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                          : 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : pillInactive
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`${pillBase} ${difficulty === 'easy' ? 'bg-green-500 text-white border-green-500 shadow-sm' : pillInactive}`}
                  >
                    ★ Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('medium')}
                    className={`${pillBase} ${difficulty === 'medium' ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm' : pillInactive}`}
                  >
                    ★★ Med
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`${pillBase} ${difficulty === 'hard' ? 'bg-red-500 text-white border-red-500 shadow-sm' : pillInactive}`}
                  >
                    ★★★ Hard
                  </button>
                </div>
              </div>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Task Type
              </label>
              <div className="flex gap-2 mb-3">
                {(['one-time', 'daily', 'recurring'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaskType(type)}
                    className={`${pillBase} ${taskType === type ? pillActive : pillInactive}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {taskType === "recurring" && (
                <div>
                  <label className="block text-xs font-heading font-semibold text-gray-600 dark:text-gray-400 mb-2">
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
                        className={`py-1.5 text-xs rounded-lg font-body font-semibold transition-all duration-150 ${
                          recurringDays.includes(day)
                            ? "bg-secondary-600 text-white shadow-sm"
                            : "bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {recurringDays.length === 0 && (
                    <p className="mt-1.5 text-xs text-red-500 font-body">Select at least one day.</p>
                  )}
                </div>
              )}

              {taskType === "one-time" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="edit-due-date" className="block text-xs font-heading font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="edit-due-date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="edit-due-time" className="block text-xs font-heading font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Due Time
                    </label>
                    <input
                      type="time"
                      id="edit-due-time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="edit-notes" className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Notes <span className="text-gray-400 dark:text-gray-500 font-body font-normal text-xs">(optional)</span>
              </label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-y`}
                placeholder="Any details or notes about this task..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 font-body font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="flex-1 py-2.5 rounded-xl font-heading font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-amber-400/30 transition-all duration-150"
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
