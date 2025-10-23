import React, { useState, useMemo } from "react";
import { Task, useTaskStore } from "../store/taskStore";
import { StatCategory, categoryIcons } from "../utils/categoryDetection";
import EditTaskModal from "./EditTaskModal";

type SortOption = "due" | "priority" | "type" | "category" | "created" | "difficulty";
type GroupOption = "none" | "priority" | "type" | "date" | "difficulty";

interface CleanTaskListProps {
  showCompleted?: boolean;
  autoAllocateStats?: boolean;
}

const CleanTaskList: React.FC<CleanTaskListProps> = ({ showCompleted = false, autoAllocateStats = false }) => {
  const { tasks, loading, completeTask, deleteTask } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("due");
  const [groupBy, setGroupBy] = useState<GroupOption>("none");

  // Smart task grouping
  const groupedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const filtered = tasks.filter(task => {
      // Always show completed tasks, but don't show them in the main grouping logic
      if (task.is_completed) return true;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return task.description.toLowerCase().includes(query) ||
               (task.notes && task.notes.toLowerCase().includes(query));
      }
      
      return true;
    });

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
      noDate: [] as Task[],
      completed: [] as Task[]
    };

    filtered.forEach(task => {
      // Handle completed tasks separately
      if (task.is_completed) {
        groups.completed.push(task);
        return;
      }
      if (task.is_daily) {
        groups.today.push(task);
        return;
      }

      if (task.recurring_days && task.recurring_days.length > 0) {
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        if (task.recurring_days.includes(dayOfWeek)) {
          groups.today.push(task);
        } else {
          groups.thisWeek.push(task);
        }
        return;
      }

      if (!task.due_date) {
        groups.noDate.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);
      
      if (dueDate < today) {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (dueDate <= nextWeek) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    });

    return groups;
  }, [tasks, searchQuery, showCompleted]);

  const getTaskPriority = (task: Task): number => {
    // Smart priority calculation: overdue > high priority > due today > medium > low
    if (groupedTasks.overdue.includes(task)) return 1;
    if (task.priority === 'high') return 2;
    if (groupedTasks.today.includes(task)) return 3;
    if (task.priority === 'medium') return 4;
    if (task.priority === 'low') return 5;
    return 6;
  };

  const sortedTasks = useMemo(() => {
    const allTasks = [
      ...groupedTasks.overdue,
      ...groupedTasks.today,
      ...groupedTasks.tomorrow,
      ...groupedTasks.thisWeek,
      ...groupedTasks.later,
      ...groupedTasks.noDate,
      ...groupedTasks.completed
    ];

    // Sort tasks based on selected sort option
    return allTasks.sort((a, b) => {
      // Always put completed tasks at the bottom
      if (a.is_completed && !b.is_completed) return 1;
      if (!a.is_completed && b.is_completed) return -1;
      if (a.is_completed && b.is_completed) {
        // For completed tasks, sort by completion date (most recent first)
        return new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime();
      }
      
      // For non-completed tasks, apply the selected sort
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
          return aPriority - bPriority;
        
        case "type":
          const typeOrder = { daily: 1, recurring: 2, oneTime: 3 };
          const aType = a.is_daily ? 'daily' : (a.recurring_days?.length ? 'recurring' : 'oneTime');
          const bType = b.is_daily ? 'daily' : (b.recurring_days?.length ? 'recurring' : 'oneTime');
          return typeOrder[aType as keyof typeof typeOrder] - typeOrder[bType as keyof typeof typeOrder];
        
        case "category":
          return (a.category || '').localeCompare(b.category || '');
        
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          const aDifficulty = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 4;
          const bDifficulty = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 4;
          return aDifficulty - bDifficulty;
        
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case "due":
        default:
          return getTaskPriority(a) - getTaskPriority(b);
      }
    });
  }, [groupedTasks, sortBy]);

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (date < today) {
      return "Overdue";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTaskStatusColor = (task: Task) => {
    if (groupedTasks.overdue.includes(task)) return "text-red-600 dark:text-red-400";
    if (groupedTasks.today.includes(task)) return "text-blue-600 dark:text-blue-400";
    if (task.priority === 'high') return "text-orange-600 dark:text-orange-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Sort and Group Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="due">Due Date</option>
              <option value="priority">Priority</option>
              <option value="type">Task Type</option>
              <option value="category">Category</option>
              <option value="difficulty">Difficulty</option>
              <option value="created">Created Date</option>
            </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupOption)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="none">None</option>
            <option value="priority">Priority</option>
            <option value="type">Task Type</option>
            <option value="date">Due Date</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No tasks found" : "No tasks yet"}
            </h3>
            <p className="text-sm">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Add your first task to get started!"
              }
            </p>
          </div>
        ) : groupBy === "none" ? (
          // No grouping - show flat list
          sortedTasks.map(task => (
            <div
              key={task.id}
              className={`group bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg p-4 hover:shadow-md transition-all ${
                task.is_completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => !task.is_completed && completeTask(task.id, autoAllocateStats)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                    task.is_completed 
                      ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" 
                      : "border-gray-300 hover:border-green-500 dark:border-gray-600 dark:hover:border-accent-500"
                  }`}
                  disabled={task.is_completed}
                >
                  {task.is_completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Description */}
                  <p className={`text-base ${
                    task.is_completed 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {task.description}
                  </p>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          {/* Priority */}
                          {task.priority && (
                            <span className={`font-medium ${
                              task.priority === 'high' 
                                ? 'text-orange-600 dark:text-orange-400'
                                : task.priority === 'medium'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {task.priority === 'high' ? 'High' : 
                               task.priority === 'medium' ? 'Medium' : 
                               'Low'}
                            </span>
                          )}

                          {/* Category */}
                          {task.category && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              {categoryIcons[task.category as StatCategory]}
                              <span className="font-medium">{task.category}</span>
                            </span>
                          )}

                          {/* Due date */}
                          {formatDueDate(task.due_date) && (
                            <span className={`font-medium ${getTaskStatusColor(task)}`}>
                              {formatDueDate(task.due_date)}
                            </span>
                          )}

                          {/* Task type */}
                          {task.is_daily && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Daily
                            </span>
                          )}

                          {task.recurring_days && task.recurring_days.length > 0 && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              Recurring
                            </span>
                          )}

                          {/* Difficulty */}
                          {task.difficulty && (
                            <span className={`font-medium ${
                              task.difficulty === 'easy' 
                                ? 'text-green-600 dark:text-green-400'
                                : task.difficulty === 'medium'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {task.difficulty === 'easy' ? '⭐' : 
                               task.difficulty === 'medium' ? '⭐⭐' : 
                               '⭐⭐⭐'}
                            </span>
                          )}
                        </div>

                  {/* Notes */}
                  {task.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {task.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditModal(task.id)}
                    className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Grouped view
          (() => {
            const groups: { [key: string]: Task[] } = {};
            
            sortedTasks.forEach(task => {
              let groupKey = "";
              
              switch (groupBy) {
                case "priority":
                  if (task.is_completed) groupKey = "Completed";
                  else groupKey = task.priority || "No Priority";
                  break;
                case "type":
                  if (task.is_completed) groupKey = "Completed";
                  else if (task.is_daily) groupKey = "Daily";
                  else if (task.recurring_days?.length) groupKey = "Recurring";
                  else groupKey = "One-time";
                  break;
                case "date":
                  if (task.is_completed) groupKey = "Completed";
                  else if (groupedTasks.overdue.includes(task)) groupKey = "Overdue";
                  else if (groupedTasks.today.includes(task)) groupKey = "Today";
                  else if (groupedTasks.tomorrow.includes(task)) groupKey = "Tomorrow";
                  else if (groupedTasks.thisWeek.includes(task)) groupKey = "This Week";
                  else if (groupedTasks.later.includes(task)) groupKey = "Later";
                  else groupKey = "No Date";
                  break;
                case "difficulty":
                  if (task.is_completed) groupKey = "Completed";
                  else if (task.difficulty === 'easy') groupKey = "Easy ⭐";
                  else if (task.difficulty === 'medium') groupKey = "Medium ⭐⭐";
                  else if (task.difficulty === 'hard') groupKey = "Hard ⭐⭐⭐";
                  else groupKey = "No Difficulty";
                  break;
                default:
                  groupKey = "All Tasks";
              }
              
              if (!groups[groupKey]) groups[groupKey] = [];
              groups[groupKey].push(task);
            });
            
            return Object.entries(groups).map(([groupName, groupTasks]) => (
              <div key={groupName} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {groupName} ({groupTasks.length})
                </h3>
                {groupTasks.map(task => (
                  <div
                    key={task.id}
                    className={`group bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg p-4 hover:shadow-md transition-all ${
                      task.is_completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => !task.is_completed && completeTask(task.id, autoAllocateStats)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                          task.is_completed 
                            ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" 
                            : "border-gray-300 hover:border-green-500 dark:border-gray-600 dark:hover:border-accent-500"
                        }`}
                        disabled={task.is_completed}
                      >
                        {task.is_completed && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Description */}
                        <p className={`text-base ${
                          task.is_completed 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {task.description}
                        </p>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          {/* Priority */}
                          {task.priority && (
                            <span className={`font-medium ${
                              task.priority === 'high' 
                                ? 'text-orange-600 dark:text-orange-400'
                                : task.priority === 'medium'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {task.priority === 'high' ? 'High' : 
                               task.priority === 'medium' ? 'Medium' : 
                               'Low'}
                            </span>
                          )}

                          {/* Category */}
                          {task.category && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              {categoryIcons[task.category as StatCategory]}
                              <span className="font-medium">{task.category}</span>
                            </span>
                          )}

                          {/* Due date */}
                          {formatDueDate(task.due_date) && (
                            <span className={`font-medium ${getTaskStatusColor(task)}`}>
                              {formatDueDate(task.due_date)}
                            </span>
                          )}

                          {/* Task type */}
                          {task.is_daily && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Daily
                            </span>
                          )}

                          {task.recurring_days && task.recurring_days.length > 0 && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              Recurring
                            </span>
                          )}

                          {/* Difficulty */}
                          {task.difficulty && (
                            <span className={`font-medium ${
                              task.difficulty === 'easy' 
                                ? 'text-green-600 dark:text-green-400'
                                : task.difficulty === 'medium'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {task.difficulty === 'easy' ? '⭐' : 
                               task.difficulty === 'medium' ? '⭐⭐' : 
                               '⭐⭐⭐'}
                            </span>
                          )}
                        </div>

                        {/* Notes */}
                        {task.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowEditModal(task.id)}
                          className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          task={tasks.find(t => t.id === showEditModal)!}
          isOpen={!!showEditModal}
          onClose={() => setShowEditModal(null)}
        />
      )}
    </div>
  );
};

export default CleanTaskList;
