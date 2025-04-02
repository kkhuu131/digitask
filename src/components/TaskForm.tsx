import { useState } from "react";
import { useTaskStore } from "../store/taskStore";

const TaskForm = () => {
  const { createTask } = useTaskStore();
  const [description, setDescription] = useState("");
  const [isDaily, setIsDaily] = useState(true);
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("23:59"); // Default to end of day
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time for non-daily tasks
      let dueDateTimeISO = null;
      if (dueDate && !isDaily) {
        const dateTimeString = `${dueDate}T${dueTime}`;
        dueDateTimeISO = new Date(dateTimeString).toISOString();
      }
      
      const newTask = {
        description,
        is_daily: isDaily,
        due_date: dueDateTimeISO,
      };
      
      await createTask(newTask);
      
      // Reset form
      setDescription("");
      setIsDaily(true);
      setDueDate("");
      setDueTime("23:59");
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
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
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <input
            id="is_daily"
            name="is_daily"
            type="checkbox"
            checked={isDaily}
            onChange={(e) => setIsDaily(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_daily" className="ml-2 block text-sm text-gray-700">
            Daily recurring task
          </label>
          <div className="relative ml-1 group">
            <span className="cursor-help text-gray-400">ⓘ</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64">
              Daily tasks reset each day and can be completed again. They provide less XP (10 vs 15) but can be done repeatedly for consistent pet care.
            </div>
          </div>
        </div>
      </div>
      
      {!isDaily && (
        <div className="mt-4">
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
            <input
              type="time"
              id="due_time"
              name="due_time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !description.trim()}
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 