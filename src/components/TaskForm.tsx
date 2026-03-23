import { useState, useEffect } from 'react';
import { Task, useTaskStore } from '../store/taskStore';
import Select from 'react-select';
import {
  StatCategory,
  detectCategory,
  categoryDescriptions,
  categoryIcons,
} from '../utils/categoryDetection';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TaskFormProps {
  onTaskCreated?: () => void;
}

const TaskForm = ({ onTaskCreated }: TaskFormProps) => {
  const { createTask } = useTaskStore();
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'one-time' | 'recurring'>('daily');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('12:00'); // Default to noon
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<StatCategory | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<StatCategory | null>(null);
  const [notes, setNotes] = useState('');
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

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
    label: `${categoryIcons[value as StatCategory]} ${value} - ${description}`,
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
        is_daily: taskType === 'daily',
        recurring_days: taskType === 'recurring' ? recurringDays : null,
        difficulty,
        priority,
      };

      // Add due date for one-time tasks
      if (taskType === 'one-time' && dueDate) {
        const combinedDateTime = new Date(`${dueDate}T${dueTime}`);
        taskData.due_date = combinedDateTime.toISOString();
      }

      await createTask(taskData);

      // Reset form
      setDescription('');
      setNotes('');
      setCategory(null);
      setDetectedCategory(null);
      setIsSubmitting(false);

      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setIsSubmitting(false);
    }
  };

  // Shared input class
  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-body text-sm';

  // Pill button helpers
  const pillBase =
    'flex-1 px-3 py-2 text-sm rounded-xl font-body font-semibold transition-all duration-150 border focus:outline-none';
  const pillActive = 'bg-secondary-600 text-white border-secondary-600 shadow-sm';
  const pillInactive =
    'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100';

  // Compute EXP preview values
  const baseExp = taskType === 'daily' ? 75 : taskType === 'recurring' ? 75 : 100;
  const difficultyMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'medium' ? 1.0 : 1.5;
  const priorityMultiplier = priority === 'low' ? 0.8 : priority === 'medium' ? 1.0 : 1.3;
  const activeExp = Math.round(baseExp * difficultyMultiplier * priorityMultiplier);
  const reserveExp = Math.round(activeExp * 0.5);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Task Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-1"
        >
          Task Description
        </label>
        <input
          type="text"
          id="description"
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you need to do?"
          required
        />

        {/* Detected category chip */}
        {detectedCategory && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 text-xs font-body font-semibold">
            <span className="opacity-80">Detected:</span>
            <span>{categoryIcons[detectedCategory]}</span>
            <span>{detectedCategory}</span>
          </div>
        )}

        {/* Prompt when category could not be detected */}
        {!detectedCategory && description.trim().length > 2 && (
          <p className="mt-2 text-xs font-body text-amber-600 dark:text-amber-400">
            Could not detect a category — select one below to boost a stat.
          </p>
        )}

        {/* Category select */}
        <div className="mt-2">
          <Select
            id="category"
            options={categoryOptions}
            value={categoryOptions.find((opt) => opt.value === category) ?? null}
            onChange={(selected) => setCategory(selected?.value || null)}
            placeholder="Select a stat category..."
            isClearable
            classNames={{
              control: (state) =>
                `!rounded-xl !border !bg-white dark:!bg-dark-300 dark:!border-dark-100 !shadow-none !text-sm ${
                  state.isFocused
                    ? '!border-purple-500 dark:!border-purple-500 !ring-2 !ring-purple-500/30'
                    : '!border-gray-200'
                }`,
              menu: () =>
                '!rounded-xl !bg-white dark:!bg-dark-200 !border dark:!border-dark-100 !shadow-lg',
              option: (state) =>
                `!text-sm ${
                  state.isSelected
                    ? '!bg-secondary-600 !text-white'
                    : state.isFocused
                      ? '!bg-purple-50 dark:!bg-dark-300 dark:!text-gray-200'
                      : 'dark:!text-gray-300'
                }`,
              singleValue: () => 'dark:!text-gray-100 !text-sm',
              placeholder: () => 'dark:!text-gray-500 !text-sm',
              input: () => 'dark:!text-gray-100',
              clearIndicator: () => 'dark:!text-gray-400 hover:dark:!text-gray-200',
              dropdownIndicator: () => 'dark:!text-gray-400',
              indicatorSeparator: () => 'dark:!bg-dark-100',
            }}
          />
        </div>
      </div>

      {/* Priority + Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`${pillBase} ${
                priority === 'low'
                  ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              Low
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`${pillBase} ${
                priority === 'medium'
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`${pillBase} ${
                priority === 'high'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              High
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Difficulty
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDifficulty('easy')}
              className={`${pillBase} ${
                difficulty === 'easy'
                  ? 'bg-green-500 text-white border-green-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              ★ Easy
            </button>
            <button
              type="button"
              onClick={() => setDifficulty('medium')}
              className={`${pillBase} ${
                difficulty === 'medium'
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              ★★ Med
            </button>
            <button
              type="button"
              onClick={() => setDifficulty('hard')}
              className={`${pillBase} ${
                difficulty === 'hard'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
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
          <button
            type="button"
            onClick={() => setTaskType('one-time')}
            className={`${pillBase} ${taskType === 'one-time' ? pillActive : pillInactive}`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setTaskType('daily')}
            className={`${pillBase} ${taskType === 'daily' ? pillActive : pillInactive}`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setTaskType('recurring')}
            className={`${pillBase} ${taskType === 'recurring' ? pillActive : pillInactive}`}
          >
            Recurring
          </button>
        </div>

        {/* One-time: date + time pickers */}
        {taskType === 'one-time' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="due-date"
                className="block text-xs font-heading font-semibold text-gray-600 dark:text-gray-400 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="due-date"
                className={inputClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="due-time"
                className="block text-xs font-heading font-semibold text-gray-600 dark:text-gray-400 mb-1"
              >
                Due Time
              </label>
              <input
                type="time"
                id="due-time"
                className={inputClass}
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Recurring: day-of-week picker */}
        {taskType === 'recurring' && (
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
                      setRecurringDays(recurringDays.filter((d) => d !== day));
                    } else {
                      setRecurringDays([...recurringDays, day]);
                    }
                  }}
                  className={`py-1.5 text-xs rounded-lg font-body font-semibold transition-all duration-150 ${
                    recurringDays.includes(day)
                      ? 'bg-secondary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100'
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
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-200 mb-1"
        >
          Notes{' '}
          <span className="text-gray-400 dark:text-gray-500 font-body font-normal text-xs">
            (optional)
          </span>
        </label>
        <textarea
          id="notes"
          className={`${inputClass} min-h-[64px] resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details or notes about this task..."
        />
      </div>

      {/* Preview card */}
      {description.trim() && (
        <div className="rounded-xl border border-purple-200 dark:border-dark-100 bg-purple-50 dark:bg-dark-300 p-3 space-y-2">
          <p className="text-xs font-heading font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide">
            Preview
          </p>
          <p className="font-body font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug">
            {description}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            {/* Priority badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                priority === 'low'
                  ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  : priority === 'medium'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}
            >
              {priority === 'low' ? 'Low' : priority === 'medium' ? 'Medium' : 'High'} Priority
            </span>

            {/* Difficulty badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                difficulty === 'easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {difficulty === 'easy'
                ? '★ Easy'
                : difficulty === 'medium'
                  ? '★★ Medium'
                  : '★★★ Hard'}
            </span>

            {/* Category badge */}
            {(category || detectedCategory) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {categoryIcons[(category ?? detectedCategory) as StatCategory]}
                {category ?? detectedCategory}
              </span>
            )}

            {/* Type badge */}
            {taskType === 'daily' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Daily
              </span>
            )}
            {taskType === 'recurring' && recurringDays.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                {recurringDays.map((d) => d.substring(0, 3)).join(', ')}
              </span>
            )}
            {taskType === 'one-time' && dueDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold bg-gray-100 text-gray-700 dark:bg-dark-200 dark:text-gray-300">
                {new Date(`${dueDate}T${dueTime}`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* EXP reward preview */}
          <div className="pt-1 border-t border-purple-200 dark:border-dark-100 text-xs font-body text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
            <span>
              <span className="font-semibold text-amber-500">{activeExp} EXP</span> active
            </span>
            <span>
              <span className="font-semibold text-gray-400 dark:text-gray-500">
                {reserveExp} EXP
              </span>{' '}
              reserve
            </span>
            {(category || detectedCategory) && (
              <span>
                <span className="font-semibold text-teal-500">
                  +{difficulty === 'hard' ? 2 : 1}
                </span>{' '}
                {category ?? detectedCategory} stat
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || (taskType === 'recurring' && recurringDays.length === 0)}
        className="w-full py-3 rounded-xl font-heading font-bold text-base text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-amber-400/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
      >
        {isSubmitting ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;
