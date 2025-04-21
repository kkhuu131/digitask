import { useState, useEffect } from "react";
import { Task, useTaskStore } from "../store/taskStore";
import Select from 'react-select';
import { 
  StatCategory, 
  categoryOptions 
} from "../utils/categoryDetection";

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

  // Update the customSelectStyles object to better handle the category dropdown
  const customSelectStyles = {
    menu: (provided: any) => ({
      ...provided,
      maxHeight: '200px',
      zIndex: 9999, // Ensure dropdown appears above other elements
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#e0e7ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '8px 12px',
    }),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare updates object
      const updates: Partial<Task> = {
        description: description.trim(),
        notes: notes.trim() || null,
        category: category
      };
      
      // Add due date if this is not a daily task
      if (!task.is_daily && dueDate) {
        // Combine date and time
        const combinedDateTime = new Date(`${dueDate}T${dueTime}`);
        updates.due_date = combinedDateTime.toISOString();
      }
      
      // Update the task
      await editTask(task.id, updates);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Task</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Task Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="What do you need to do?"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any additional details or notes (optional)"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                id="category"
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category)}
                onChange={(selected) => setCategory(selected?.value || null)}
                placeholder="Select a category"
                className="mt-1"
                styles={customSelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            
            {!task.is_daily && (
              <div className="mb-4">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="mt-1 mb-4 flex space-x-2 text-sm">
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-1/2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
                  />
                  <div className="w-1/2">
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
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
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