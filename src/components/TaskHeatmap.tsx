import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useTaskStore } from '../store/taskStore';

interface TaskHistoryEntry {
  date: string;
  tasks_completed: number;
}

const TaskHeatmap: React.FC = () => {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { dailyQuota } = useTaskStore();
  const lastFetchedRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only fetch if the completed_today value has actually changed
    const currentCompleted = dailyQuota?.completed_today || 0;
    if (lastFetchedRef.current !== currentCompleted) {
      lastFetchedRef.current = currentCompleted;
      fetchTaskHistory();
    }
  }, [dailyQuota?.completed_today, isMobile]);

  const fetchTaskHistory = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }
      
      // Get last 365 days on desktop, 30 days on mobile
      const daysToFetch = isMobile ? 120 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('task_history')
        .select('date, tasks_completed')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching task history:', error);
        return;
      }


      // Add today's data from dailyQuota since it won't be in task_history yet
      const today = new Date().toLocaleDateString('en-CA'); // Use local timezone consistently
      const todayTasksCompleted = dailyQuota?.completed_today || 0;
      
      
      const combinedData = [...(data || [])];

      
      
      combinedData.push({
        date: today,
        tasks_completed: todayTasksCompleted
      });

      setHistory(combinedData);
    } catch (error) {
      console.error('Error fetching task history:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg p-6">
      {/* Inline styles for SVG fills (can't use Tailwind for SVG fill colors) */}
      <style>{`
        .react-calendar-heatmap {
          width: 100%;
        }
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #c6e48b;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #7bc96f;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #239a3b;
        }
        .dark .react-calendar-heatmap .color-empty {
          fill: #374151;
        }
        .dark .react-calendar-heatmap .color-scale-1 {
          fill: #065f46;
        }
        .dark .react-calendar-heatmap .color-scale-2 {
          fill: #047857;
        }
        .dark .react-calendar-heatmap .color-scale-3 {
          fill: #10b981;
        }
      `}</style>
      
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Task Activity
      </h3>
      
      {/* Calendar Heatmap */}
      <div className="w-full overflow-x-auto">
        <div>
          <CalendarHeatmap
            startDate={new Date(Date.now() - (isMobile ? 120 : 365) * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
            values={history.map(entry => {
              const [year, month, day] = entry.date.split('-').map(Number);
              const dateObj = new Date(year, month - 1, day);
              
              return {
                date: dateObj,
                count: entry.tasks_completed
              };
            })}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty';
              }
              if (value.count === 0) {
                return 'color-empty';
              }
              if (value.count <= 2) {
                return 'color-scale-1';
              }
              if (value.count <= 3) {
                return 'color-scale-2';
              }
              return 'color-scale-3';
            }}
            showWeekdayLabels={true}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-6 text-sm mt-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {dailyQuota?.current_streak || 0} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Best:</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {dailyQuota?.longest_streak || 0} days
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskHeatmap;