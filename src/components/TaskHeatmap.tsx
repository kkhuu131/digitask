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
  const { dailyQuota, getExpMultiplier } = useTaskStore();
  const DAILY_QUOTA_REQUIREMENT = 3; // keep in sync with taskStore
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
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
          display: block;
          line-height: 0; /* remove baseline gap */
        }
        .react-calendar-heatmap svg { display: block; }
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
        /* Subtle borders and hover */
        .react-calendar-heatmap .react-calendar-heatmap-day {
          stroke: rgba(0,0,0,0.06);
          transition: transform 120ms ease;
        }
        .react-calendar-heatmap .react-calendar-heatmap-day:hover {
          transform: scale(1.06);
          transform-origin: center;
        }
        .dark .react-calendar-heatmap .react-calendar-heatmap-day {
          stroke: rgba(255,255,255,0.08);
        }
        /* Weekday labels – slightly smaller */
        .react-calendar-heatmap .react-calendar-heatmap-weekday-labels text { font-size: 10px; }
      `}</style>
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Task Activity
        </h3>
      </div>
      
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
            gutterSize={2}
            transformDayElement={(rect: any) => React.cloneElement(rect, { rx: 2, ry: 2 })}
            showWeekdayLabels={true}
          />
        </div>
      </div>
      
      {/* Stats + Quota Donut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-4">
        {/* Left: Streak stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
            <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
              {dailyQuota?.current_streak || 0} days
              {(dailyQuota?.current_streak || 0) > 0 && <span className="ml-1">🔥</span>}
              {(dailyQuota?.current_streak || 0) > 1 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-300">×{getExpMultiplier().toFixed(1)} XP</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Best:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {dailyQuota?.longest_streak || 0} days
            </span>
          </div>
        </div>

        {/* Right: Donut quota */}
        <div className="flex justify-start sm:justify-end">
          {(() => {
            const completed = dailyQuota?.completed_today || 0;
            const required = DAILY_QUOTA_REQUIREMENT;
            const pct = Math.min(100, (completed / required) * 100);
            const size = 56; // px
            const stroke = 6; // px
            const radius = (size - stroke) / 2; // center radius
            const circumference = 2 * Math.PI * radius;
            const dash = (pct / 100) * circumference;

            const colorClass = pct >= 100
              ? 'text-green-500'
              : pct >= 66
                ? 'text-yellow-500'
                : 'text-red-500';

            return (
              <div className="flex items-center gap-3">
                <div className="relative" style={{ width: size, height: size }}>
                  <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      strokeWidth={stroke}
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      className={`${colorClass}`}
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                    {completed}/{required}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <div className="font-semibold">Daily Quota</div>
                  <div className="text-[11px]">Complete {required} tasks</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TaskHeatmap;