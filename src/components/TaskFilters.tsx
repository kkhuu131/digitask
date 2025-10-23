import React, { useState } from "react";
import { StatCategory, categoryIcons } from "../utils/categoryDetection";
// Simple SVG icons to avoid dependency issues
const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface FilterState {
  search: string;
  categories: StatCategory[];
  difficulties: string[];
  priorities: string[];
  types: string[];
  sortBy: "due" | "priority" | "difficulty" | "recent";
  sortOrder: "asc" | "desc";
}

interface TaskFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  selectedCount,
  onSelectAll,
  onClearSelection
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const categories = Object.keys(categoryIcons) as StatCategory[];
  const difficulties = ["easy", "medium", "hard"];
  const priorities = ["low", "medium", "high"];
  const types = ["daily", "recurring", "one-time"];

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof Pick<FilterState, "categories" | "difficulties" | "priorities" | "types">>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterState[K]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      categories: [],
      difficulties: [],
      priorities: [],
      types: [],
      sortBy: "due",
      sortOrder: "asc"
    });
  };

  const hasActiveFilters = filters.search || 
    filters.categories.length > 0 || 
    filters.difficulties.length > 0 || 
    filters.priorities.length > 0 || 
    filters.types.length > 0;

  return (
    <div className="space-y-3">
      {/* Search and main controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filter toggle and batch actions */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{selectedCount} selected</span>
              <button
                onClick={onSelectAll}
                className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-200 dark:hover:bg-primary-900/50"
              >
                Select All
              </button>
              <button
                onClick={onClearSelection}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full">
                {[filters.categories, filters.difficulties, filters.priorities, filters.types].flat().length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-dark-400 border border-gray-200 dark:border-dark-300 rounded-lg p-4 space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleArrayFilter("categories", category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.categories.includes(category)
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-200"
                  }`}
                >
                  {categoryIcons[category]} {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => toggleArrayFilter("difficulties", difficulty)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.difficulties.includes(difficulty)
                      ? difficulty === 'easy'
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                        : difficulty === 'medium'
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-200"
                  }`}
                >
                  {difficulty === 'easy' ? '⭐' : 
                   difficulty === 'medium' ? '⭐⭐' : 
                   '⭐⭐⭐'}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleArrayFilter("priorities", priority)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.priorities.includes(priority)
                      ? priority === 'low'
                        ? "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
                        : priority === 'medium'
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                      : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-200"
                  }`}
                >
                  {priority === 'low' ? 'Low' : 
                   priority === 'medium' ? 'Medium' : 
                   'High'}
                </button>
              ))}
            </div>
          </div>

          {/* Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Types
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter("types", type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.types.includes(type)
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      : "bg-white dark:bg-dark-300 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-200"
                  }`}
                >
                  {type === 'daily' ? '📅 Daily' : 
                   type === 'recurring' ? '🔄 Recurring' : 
                   '📝 One-time'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value as FilterState["sortBy"])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
                <option value="difficulty">Difficulty</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter("sortOrder", e.target.value as FilterState["sortOrder"])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
