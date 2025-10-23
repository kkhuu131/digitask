import React, { useState } from "react";
import { Task, useTaskStore } from "../store/taskStore";

interface TaskKanbanProps {
  tasks: Task[];
}

const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks }) => {
  const { updateTask } = useTaskStore();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Group tasks by status
  const columns = [
    {
      id: "today",
      title: "Today",
      tasks: tasks.filter(task => {
        if (task.is_completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (task.due_date) {
          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        }
        return task.is_daily || (task.recurring_days && task.recurring_days.length > 0);
      })
    },
    {
      id: "this-week",
      title: "This Week",
      tasks: tasks.filter(task => {
        if (task.is_completed) return false;
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return task.due_date && new Date(task.due_date) <= nextWeek;
      })
    },
    {
      id: "later",
      title: "Later",
      tasks: tasks.filter(task => {
        if (task.is_completed) return false;
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return !task.due_date || new Date(task.due_date) > nextWeek;
      })
    },
    {
      id: "completed",
      title: "Completed",
      tasks: tasks.filter(task => task.is_completed)
    }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const task = tasks.find(t => t.id === draggedTask);
    if (!task) return;

    // Update task based on target column
    let updates: Partial<Task> = {};
    
    switch (targetColumnId) {
      case "today":
        // Move to today (set due date to today)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        updates.due_date = today.toISOString();
        break;
      case "this-week":
        // Move to this week (set due date to end of week)
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay())); // End of week
        endOfWeek.setHours(23, 59, 59, 999);
        updates.due_date = endOfWeek.toISOString();
        break;
      case "later":
        // Move to later (set due date to next month)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updates.due_date = nextMonth.toISOString();
        break;
      case "completed":
        // Mark as completed
        updates.is_completed = true;
        updates.completed_at = new Date().toISOString();
        break;
    }

    // Apply the update
    if (Object.keys(updates).length > 0) {
      await updateTask(draggedTask, updates);
    }
    
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => (
        <div
          key={column.id}
          className={`bg-gray-50 dark:bg-dark-400 rounded-lg border border-gray-200 dark:border-dark-300 transition-colors ${
            draggedTask ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {column.title}
              </h3>
              <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {column.tasks.length}
              </span>
            </div>
          </div>

          {/* Column content */}
          <div className="p-2 space-y-2 min-h-[200px]">
            {column.tasks.length === 0 ? (
              <div className={`text-center py-8 text-gray-500 dark:text-gray-400 text-sm ${
                draggedTask ? 'border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg bg-primary-50 dark:bg-primary-900/20' : ''
              }`}>
                {draggedTask ? 'Drop here to move task' : 'No tasks'}
              </div>
            ) : (
              column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white dark:bg-dark-300 rounded-lg border border-gray-200 dark:border-dark-200 p-3 cursor-move hover:shadow-md transition-all ${
                      draggedTask === task.id ? "opacity-50 scale-95" : "hover:scale-105"
                    }`}
                  >
                  <div className="space-y-2">
                    {/* Task description */}
                    <p className={`text-sm ${
                      task.is_completed 
                        ? "line-through text-gray-500 dark:text-gray-400" 
                        : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {task.description}
                    </p>

                    {/* Task badges */}
                    <div className="flex flex-wrap gap-1">
                      {task.category && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                          {task.category}
                        </span>
                      )}
                      
                      {task.difficulty && (
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          task.difficulty === 'easy' 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : task.difficulty === 'medium'
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}>
                          {task.difficulty === 'easy' ? '🟢' : 
                           task.difficulty === 'medium' ? '🟡' : 
                           '🔴'}
                        </span>
                      )}
                      
                      {task.priority && (
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          task.priority === 'low' 
                            ? "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                            : task.priority === 'medium'
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        }`}>
                          {task.priority === 'low' ? '⚪' : 
                           task.priority === 'medium' ? '🔵' : 
                           '🟠'}
                        </span>
                      )}

                      {task.is_daily && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          Daily
                        </span>
                      )}
                    </div>

                    {/* Due date */}
                    {task.due_date && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskKanban;
