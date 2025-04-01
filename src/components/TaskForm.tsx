import { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { format } from "date-fns";

const TaskForm = () => {
  const { createTask } = useTaskStore();
  const [description, setDescription] = useState("");
  const [isDaily, setIsDaily] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await createTask({
        description,
        is_daily: isDaily,
        due_date: isDaily ? null : dueDate || null,
      });
      
      // Reset form
      setDescription("");
      setIsDaily(true);
      setDueDate("");
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
            type="checkbox"
            id="isDaily"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={isDaily}
            onChange={(e) => setIsDaily(e.target.checked)}
          />
          <label htmlFor="isDaily" className="ml-2 block text-sm text-gray-700">
            Daily recurring task
          </label>
        </div>
      </div>
      
      {!isDaily && (
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
          />
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