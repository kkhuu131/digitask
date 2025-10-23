import React, { useState, useMemo } from "react";
import { Task, useTaskStore } from "../store/taskStore";
import { StatCategory } from "../utils/categoryDetection";
import TaskItem from "./TaskItem";
import TaskFilters from "./TaskFilters";
import TaskKanban from "./TaskKanban";
// Simple SVG icons to avoid dependency issues
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
  </svg>
);

const ViewColumnsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

type ViewMode = "list" | "kanban";
type TabFilter = "today" | "upcoming" | "all" | "completed";

interface FilterState {
  search: string;
  categories: StatCategory[];
  difficulties: string[];
  priorities: string[];
  types: string[];
  sortBy: "due" | "priority" | "difficulty" | "recent";
  sortOrder: "asc" | "desc";
}

const TaskLayout: React.FC = () => {
  const { tasks, loading, completeTask, deleteTask } = useTaskStore();
  const [activeTab, setActiveTab] = useState<TabFilter>("today");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    difficulties: [],
    priorities: [],
    types: [],
    sortBy: "due",
    sortOrder: "asc"
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["overdue", "today"]));
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Get current date for filtering
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Helper functions
  const isTaskOverdue = (task: Task) => {
    if (!task.due_date || task.is_completed || task.is_daily) return false;
    return new Date(task.due_date) < now;
  };

  const isTaskDueToday = (task: Task) => {
    if (!task.due_date || task.is_completed) return false;
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  };

  const isRecurringTaskForToday = (task: Task) => {
    if (!task.recurring_days || task.recurring_days.length === 0) return false;
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    return task.recurring_days.includes(dayOfWeek);
  };

  const isTaskUpcoming = (task: Task) => {
    if (!task.due_date || task.is_completed) return false;
    const taskDate = new Date(task.due_date);
    return taskDate > now && taskDate <= nextWeek;
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Tab filtering
      if (activeTab === "today") {
        return !task.is_completed && (isTaskDueToday(task) || isRecurringTaskForToday(task) || task.is_daily);
      } else if (activeTab === "upcoming") {
        return !task.is_completed && isTaskUpcoming(task);
      } else if (activeTab === "all") {
        return !task.is_completed;
      } else if (activeTab === "completed") {
        return task.is_completed;
      }
      return true;
    });

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.description.toLowerCase().includes(searchLower) ||
        (task.notes && task.notes.toLowerCase().includes(searchLower))
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(task => task.category && filters.categories.includes(task.category as StatCategory));
    }

    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(task => task.difficulty && filters.difficulties.includes(task.difficulty));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(task => task.priority && filters.priorities.includes(task.priority));
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(task => {
        if (filters.types.includes("daily") && task.is_daily) return true;
        if (filters.types.includes("recurring") && task.recurring_days && task.recurring_days.length > 0) return true;
        if (filters.types.includes("one-time") && !task.is_daily && (!task.recurring_days || task.recurring_days.length === 0)) return true;
        return false;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "due":
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
          break;
        case "difficulty":
          const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
          comparison = (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0) - (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0);
          break;
        case "recent":
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
      }
      
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [tasks, activeTab, filters, now, today, nextWeek]);

  // Group tasks for Today view
  const todayGroups = useMemo(() => {
    if (activeTab !== "today") return {};
    
    const overdue = filteredTasks.filter(isTaskOverdue);
    const dueToday = filteredTasks.filter(task => !isTaskOverdue(task) && (isTaskDueToday(task) || isRecurringTaskForToday(task) || task.is_daily));
    
    return { overdue, dueToday };
  }, [filteredTasks, activeTab]);

  // Group tasks for Upcoming view
  const upcomingGroups = useMemo(() => {
    if (activeTab !== "upcoming") return {};
    
    const groups: { [key: string]: Task[] } = {};
    filteredTasks.forEach(task => {
      if (task.due_date) {
        const date = new Date(task.due_date);
        const dateKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(task);
      }
    });
    
    return groups;
  }, [filteredTasks, activeTab]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Batch selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  // Tab configuration
  const tabs = [
    { id: "today", label: "Today", count: (todayGroups.overdue?.length || 0) + (todayGroups.dueToday?.length || 0) },
    { id: "upcoming", label: "Upcoming", count: filteredTasks.length },
    { id: "all", label: "All", count: filteredTasks.length },
    { id: "completed", label: "Completed", count: filteredTasks.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with tabs and view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-dark-200 rounded-lg p-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabFilter)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-dark-300 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "bg-gray-200 dark:bg-dark-100 text-gray-600 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 rounded-md ${
              viewMode === "kanban"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <ViewColumnsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        selectedCount={selectedTasks.size}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
      />

      {/* Content */}
      {viewMode === "kanban" ? (
        <TaskKanban tasks={filteredTasks} />
      ) : (
        <div className="space-y-4">
          {/* Today view with groups */}
          {activeTab === "today" && (
            <>
              {/* Overdue section */}
              {todayGroups.overdue && todayGroups.overdue.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg">
                  <button
                    onClick={() => toggleGroup("overdue")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                        Overdue ({todayGroups.overdue.length})
                      </h3>
                    </div>
                    {expandedGroups.has("overdue") ? (
                      <ChevronUpIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </button>
                  
                  {expandedGroups.has("overdue") && (
                    <div className="border-t border-red-200 dark:border-red-900/20">
                      {todayGroups.overdue.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onComplete={completeTask}
                          onDelete={deleteTask}
                          isSelected={selectedTasks.has(task.id)}
                          onSelect={() => toggleTaskSelection(task.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Due Today section */}
              {todayGroups.dueToday && todayGroups.dueToday.length > 0 && (
                <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg">
                  <button
                    onClick={() => toggleGroup("today")}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Due Today ({todayGroups.dueToday.length})
                      </h3>
                    </div>
                    {expandedGroups.has("today") ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  
                  {expandedGroups.has("today") && (
                    <div className="border-t border-gray-200 dark:border-dark-200">
                      {todayGroups.dueToday.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onComplete={completeTask}
                          onDelete={deleteTask}
                          isSelected={selectedTasks.has(task.id)}
                          onSelect={() => toggleTaskSelection(task.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Upcoming view with date groups */}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {Object.entries(upcomingGroups).map(([dateKey, tasks]) => (
                <div key={dateKey} className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 dark:border-dark-200">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {dateKey} ({tasks.length})
                    </h3>
                  </div>
                  <div>
                    {tasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onDelete={deleteTask}
                        isSelected={selectedTasks.has(task.id)}
                        onSelect={() => toggleTaskSelection(task.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All and Completed views */}
          {(activeTab === "all" || activeTab === "completed") && (
            <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-200 rounded-lg overflow-hidden">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {activeTab === "completed" 
                    ? "No completed tasks yet. Complete some tasks to see them here!"
                    : "No tasks found. Try adjusting your filters or add some tasks!"
                  }
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={() => {}}
                    onDelete={() => {}}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={() => toggleTaskSelection(task.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskLayout;
