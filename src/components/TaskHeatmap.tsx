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
  const [lifetimeTasks, setLifetimeTasks] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { dailyQuota, getExpMultiplier } = useTaskStore();
  const lastFetchedRef = useRef<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Refresh when completed tasks or the visible date range changes.
    const currentCompleted = dailyQuota?.completed_today || 0;
    const fetchKey = `${currentCompleted}:${isMobile ? 120 : 365}`;
    if (lastFetchedRef.current !== fetchKey) {
      lastFetchedRef.current = fetchKey;
      fetchTaskHistory();
    }
  }, [dailyQuota?.completed_today, isMobile]);

  useEffect(() => {
    const refresh = () => void fetchTaskHistory();
    window.addEventListener('focus', refresh);
    window.addEventListener('task-completed', refresh);
    return () => {
      requestRef.current += 1;
      window.removeEventListener('focus', refresh);
      window.removeEventListener('task-completed', refresh);
    };
  }, [dailyQuota?.completed_today, isMobile]);

  const fetchTaskHistory = async () => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // Get last 365 days on desktop, 120 days on mobile.
      const daysToFetch = isMobile ? 120 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [activity, milestone] = await Promise.all([
        supabase
          .from('task_history')
          .select('date, tasks_completed')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .order('date', { ascending: true }),
        supabase
          .from('user_milestones')
          .select('tasks_completed_count')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      if (requestId !== requestRef.current) return;
      const { data, error } = activity;
      if (!milestone.error) setLifetimeTasks(milestone.data?.tasks_completed_count ?? 0);

      if (error) {
        console.error('Error fetching task history:', error);
        return;
      }

      // Add today's data from dailyQuota since it won't be in task_history yet
      const today = new Date().toLocaleDateString('en-CA'); // Use local timezone consistently
      const todayTasksCompleted = dailyQuota?.completed_today || 0;

      const combinedData = (data || []).filter((entry) => entry.date !== today);

      combinedData.push({
        date: today,
        tasks_completed: todayTasksCompleted,
      });

      setHistory(combinedData);
    } catch (error) {
      console.error('Error fetching task history:', error);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (isMobile ? 120 : 365));
  const rangeStartKey = rangeStart.toLocaleDateString('en-CA');
  const visibleHistory = history.filter((entry) => entry.date >= rangeStartKey);

  if (loading && history.length === 0) {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading task activity</span>
        <div className="ui-skeleton-pulse space-y-4" aria-hidden="true">
          <div className="h-28 bg-gray-100 dark:bg-dark-200 rounded-lg" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-dark-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-heatmap space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Completed tasks over the last {isMobile ? '120 days' : 'year'}.
      </p>
      <div className="w-full min-w-0 overflow-x-auto">
        <CalendarHeatmap
          startDate={rangeStart}
          endDate={new Date()}
          values={visibleHistory.map((entry) => {
            const [year, month, day] = entry.date.split('-').map(Number);
            return { date: new Date(year, month - 1, day), count: entry.tasks_completed };
          })}
          classForValue={(value) => {
            const count = value?.count ?? 0;
            const color =
              count === 0
                ? 'color-empty'
                : count <= 2
                  ? 'color-scale-1'
                  : count <= 3
                    ? 'color-scale-2'
                    : 'color-scale-3';
            const today =
              value?.date &&
              new Date(value.date).toLocaleDateString('en-CA') ===
                new Date().toLocaleDateString('en-CA');
            return `${color}${today ? ' color-today' : ''}`;
          }}
          gutterSize={2}
          transformDayElement={(rect: any, value: any) => {
            const date = value?.date ?? rect.props['data-date'];
            const label = `${date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Day'}: ${value?.count ?? 0} tasks completed`;
            return React.cloneElement(
              rect,
              { rx: 2, ry: 2, 'aria-label': label },
              <title>{label}</title>
            );
          }}
          showWeekdayLabels
        />
      </div>
      <div
        className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400"
        aria-label="Activity legend"
      >
        <span>Tasks per day</span>
        {[
          { label: '0', color: 'bg-gray-200 dark:bg-dark-100' },
          { label: '1-2', color: 'bg-amber-100 dark:bg-amber-900' },
          { label: '3', color: 'bg-amber-300 dark:bg-amber-700' },
          { label: '4+', color: 'bg-amber-500' },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className={`h-3 w-3 rounded-sm ${color}`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-200 dark:border-dark-100 pt-4">
        {[
          { label: 'Current streak', value: `${dailyQuota?.current_streak ?? 0} days` },
          { label: 'Best streak', value: `${dailyQuota?.longest_streak ?? 0} days` },
          { label: 'Lifetime tasks', value: lifetimeTasks?.toLocaleString() ?? 'Unavailable' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-gray-50 dark:bg-dark-200 p-3 min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
            <p className="mt-1 font-heading text-lg font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {label === 'Current streak' && (dailyQuota?.current_streak ?? 0) > 1 && (
              <p className="mt-1 text-xs text-accent-800 dark:text-accent-400">
                {getExpMultiplier().toFixed(1)}x EXP bonus
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHeatmap;
