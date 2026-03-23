import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useDigimonStore } from './petStore';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from '../store/authStore';
import { useTitleStore } from './titleStore';
import { useTournamentStore } from './tournamentStore';

// Helper: fetch lifetime task count from user_milestones and check task achievements
async function checkTaskAchievementsAfterCompletion(userId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('user_milestones')
      .select('tasks_completed_count')
      .eq('user_id', userId)
      .single();
    if (data?.tasks_completed_count != null) {
      await useTitleStore.getState().checkTaskAchievements(data.tasks_completed_count);
    }
  } catch (e) {
    // Non-fatal
    console.warn('checkTaskAchievementsAfterCompletion failed:', e);
  }
}

// EXP and stat points are driven by difficulty, not task type.
// These values MUST stay in sync with the DB function `complete_task_all_triggers`,
// which uses the same tables server-side. If you change values here, update the DB function too.
const EXP_BY_DIFFICULTY: Record<string, number> = {
  easy: 75,
  medium: 150,
  hard: 300,
};
const STAT_POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 0, // Easy tasks give XP but no stat point — intentional, low-effort tasks shouldn't train stats
  medium: 1,
  hard: 2,
};
// Priority multiplies EXP on top of the difficulty base (applied in getExpPoints below).
const PRIORITY_EXP_MULTIPLIER: Record<string, number> = {
  low: 0.75,
  medium: 1.0,
  high: 1.5,
};

// Phase 3: exported so Dashboard.tsx can reference the canonical quota number
export const DAILY_QUOTA_AMOUNT = 3;

export const getExpPoints = (task: Task) => {
  const base = EXP_BY_DIFFICULTY[task.difficulty ?? 'medium'] ?? 150;
  const mult = PRIORITY_EXP_MULTIPLIER[task.priority ?? 'medium'] ?? 1.0;
  return Math.round(base * mult);
};

export const getStatPoints = (task: Task) => {
  return STAT_POINTS_BY_DIFFICULTY[task.difficulty ?? 'medium'] ?? 1;
};

export interface Task {
  id: string;
  user_id: string;
  description: string;
  is_daily: boolean;
  recurring_days?: string[] | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  category: string | null;
  notes: string | null;
  // New fields for task differentiation
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
}

interface DailyQuota {
  id: string;
  user_id: string;
  completed_today: number;
  consecutive_days_missed: number;
  penalized_tasks: string[];
  created_at: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, autoAllocate?: boolean) => Promise<void>;
  checkOverdueTasks: () => Promise<void>;
  resetDailyTasks: () => Promise<void>;
  penalizedTasks: string[];
  initializeStore: () => Promise<void>;
  forceCheckOverdueTasks: () => Promise<void>;
  dailyQuota: DailyQuota | null;
  fetchDailyQuota: () => Promise<void>;
  checkDailyQuota: () => Promise<void>;
  subscribeToQuotaUpdates: () => Promise<() => void>;
  lastOverdueCheck: number;
  setPenalizedTasks: (taskIds: string[]) => void;
  completeDailyQuota: () => Promise<void>;
  getExpMultiplier: () => number;
  editTask: (id: string, updates: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  penalizedTasks: [],
  dailyQuota: null,
  lastOverdueCheck: Date.now(),

  initializeStore: async () => {
    await get().fetchTasks();
    await get().fetchDailyQuota();
    await get().checkOverdueTasks();

    // Set up real-time subscription to quota updates
    await get().subscribeToQuotaUpdates();
  },

  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ tasks: [], loading: false });
        return;
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      set({ tasks: tasks || [], loading: false });

      await get().checkOverdueTasks();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTask: async (task: Partial<Task>) => {
    try {
      set({ loading: true, error: null });

      // Make sure we're sending the notes field properly
      const taskToCreate = {
        ...task,
        // Ensure notes is properly formatted (empty string becomes null)
        notes: task.notes && task.notes.trim() ? task.notes.trim() : null,
        // Provide sensible defaults for new fields
        difficulty: task.difficulty || 'medium',
        priority: task.priority || 'medium',
      };

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskToCreate, user_id: userData.user.id }])
        .select('*')
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false,
      }));
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing task:', error);
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  deleteTask: async (id) => {
    try {
      // Get the current task for potential rollback
      const taskToDelete = get().tasks.find((t) => t.id === id);
      if (!taskToDelete) return;

      // Optimistically update the UI immediately
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));

      // Then perform the actual deletion in the background
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      // No need to update tasks again since we already did it optimistically
    } catch (error) {
      console.error('Error deleting task:', error);

      // If there's an error, revert the optimistic update by adding the task back
      const taskToRestore = get().tasks.find((t) => t.id === id);
      if (taskToRestore) {
        set((state) => ({
          tasks: [...state.tasks, taskToRestore],
          error: (error as Error).message,
        }));

        // Show error notification
        useNotificationStore.getState().addNotification({
          message: 'Failed to delete task. Please try again.',
          type: 'error',
        });
      }
    }
  },

  completeTask: async (id: string, autoAllocate: boolean = false) => {
    try {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      // Optimistically mark the task done before waiting for the DB round-trip.
      // Reverted below if the RPC call fails.
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, is_completed: true } : t)),
      }));

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // complete_task_all_triggers is a single RPC that atomically:
      //   1. Marks the task done
      //   2. Increments daily_quotas.completed_today
      //   3. Awards EXP to all party Digimon (active: full, reserve: 50%, storage: 0%)
      //   4. Awards a stat point to the active Digimon or saves it to profiles.saved_stats
      // Returns: { exp_points, reserve_exp, stat_points, stat_category, auto_allocated,
      //            saved_stats, daily_quota: { quota_completed } }
      const { data, error } = await supabase.rpc('complete_task_all_triggers', {
        p_task_id: id,
        p_user_id: userData.user.id,
        p_auto_allocate: autoAllocate,
      });

      if (error) throw error;

      // Mirror the server's saved_stats back to localStorage so the SavedStats UI
      // can read it synchronously without another round-trip.
      if (data.saved_stats) {
        localStorage.setItem('savedStats', JSON.stringify(data.saved_stats));
      }

      useDigimonStore.getState().fetchUserDailyStatGains();
      window.dispatchEvent(new Event('task-completed'));

      // Build the notification message. Three cases based on what the RPC did with stat points:
      // 1. Task had no stat category (no stat point earned)
      // 2. Stat was auto-allocated directly to the active Digimon
      // 3. Stat was saved to profiles.saved_stats (auto-allocate was off, or Digimon hit its cap)
      let notificationMessage = '';
      const digimonName = useDigimonStore.getState().userDigimon?.name || 'Active Digimon';

      if (!data.stat_category) {
        notificationMessage = `${digimonName} gained ${data.exp_points} exp!\nReserve Digimon gained ${data.reserve_exp} exp!`;
      } else if (data.auto_allocated) {
        notificationMessage = `${digimonName} gained ${data.exp_points} exp and ${data.stat_points} ${data.stat_category}!\nReserve Digimon gained ${data.reserve_exp} exp!`;
      } else if (autoAllocate) {
        // autoAllocate was requested but the Digimon was at its ABI-based stat cap
        notificationMessage = `Digimon has reached its stat cap, ${data.stat_points} ${data.stat_category} points were saved!\n${digimonName} gained ${data.exp_points} exp!\nReserve Digimon gained ${data.reserve_exp} exp!`;
      } else {
        notificationMessage = `${data.stat_points} ${data.stat_category} saved for later!\n${digimonName} gained ${data.exp_points} exp!\nReserve Digimon gained ${data.reserve_exp} exp!`;
      }

      useNotificationStore.getState().addNotification({
        message: notificationMessage,
        type: 'success',
      });

      await useDigimonStore.getState().checkLevelUp();

      // completeDailyQuota rewards the whole team with a streak-multiplied XP bonus.
      // The RPC signals readiness via daily_quota.quota_completed, not by re-checking
      // completed_today, so this fires exactly once per day.
      if (data.daily_quota.quota_completed) {
        await get().completeDailyQuota();
      }

      await get().fetchDailyQuota();

      // Each completed task restores 1 battle energy (max is enforced server-side).
      // Energy is the currency for entering arena and campaign battles.
      try {
        await supabase.rpc('grant_energy_self', { p_amount: 1 });
      } catch (e) {
        console.error('grant_energy_self(+1) failed:', e);
      }
      window.dispatchEvent(new Event('energy-updated'));

      // Optimistically bump the tournament weekly task counter so the UI
      // shows the progress bar advancing without waiting for a fetch.
      // At exactly 10 tasks the weekly tournament bracket becomes available.
      const tournamentStore = useTournamentStore.getState();
      const prevWeeklyCount = tournamentStore.weeklyTaskCount;
      const newWeeklyCount = prevWeeklyCount + 1;
      tournamentStore.setWeeklyTaskCount(newWeeklyCount);
      if (prevWeeklyCount < 10 && newWeeklyCount >= 10) {
        useNotificationStore.getState().addNotification({
          type: 'success',
          message:
            "🏆 Weekly Tournament unlocked! Head to Battle Hub to enter this week's tournament.",
          duration: 8000,
        });
      }

      // Fire-and-forget: read lifetime task count from user_milestones and check title unlocks.
      // Non-blocking — a failure here shouldn't fail the task completion.
      checkTaskAchievementsAfterCompletion(userData.user.id);
    } catch (error) {
      console.error('Error completing task:', error);

      // If there's an error, revert the optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, is_completed: false } : t)),
        error: (error as Error).message,
      }));

      // Show error notification
      useNotificationStore.getState().addNotification({
        message: 'Failed to complete task. Please try again.',
        type: 'error',
      });
    }
  },

  checkOverdueTasks: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // First, ensure we have the latest penalized tasks list
      await get().fetchDailyQuota();
      const { penalizedTasks } = get();

      const { tasks } = get();
      const now = new Date();
      let penaltyApplied = false;

      // Only penalize tasks that are newly overdue (not already in penalizedTasks).
      // penalizedTasks is persisted in daily_quotas.penalized_tasks so that refreshing
      // the page or re-calling checkOverdueTasks never double-penalizes the same task.
      // Daily tasks are excluded — they reset every day via the server-side cron.
      const newlyOverdueTasks = tasks.filter((task) => {
        if (task.is_daily || task.is_completed || !task.due_date) return false;

        const dueDate = new Date(task.due_date);
        return dueDate < now && !penalizedTasks.includes(task.id);
      });

      if (newlyOverdueTasks.length > 0) {
        const { data: quotaData } = await supabase
          .from('daily_quotas')
          .select('*')
          .eq('user_id', userData.user.id)
          .single();

        if (quotaData) {
          // Use a Set to merge DB-persisted IDs with newly found ones,
          // ensuring we never write duplicates into penalized_tasks.
          const allPenalizedSet = new Set([
            ...(quotaData.penalized_tasks || []),
            ...newlyOverdueTasks.map((t) => t.id),
          ]);
          const allPenalized = Array.from(allPenalizedSet);

          // Write to DB first so that if the page reloads mid-penalty loop,
          // the IDs are already recorded and won't be penalized again.
          await supabase
            .from('daily_quotas')
            .update({ penalized_tasks: allPenalized })
            .eq('user_id', userData.user.id);

          set({ penalizedTasks: allPenalized });
        }

        // -5 happiness per overdue task
        for (const _ of newlyOverdueTasks) {
          await useDigimonStore.getState().applyPenalty(5);
          penaltyApplied = true;
        }

        // After applying penalties, check if the Digimon has died
        if (penaltyApplied) {
          // Fetch the updated Digimon data to check health
          await useDigimonStore.getState().fetchUserDigimon();
        }
      }

      // Update the last check timestamp
      set({ lastOverdueCheck: Date.now() });
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  },

  resetDailyTasks: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Reset all daily tasks to uncompleted
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: false })
        .eq('user_id', userData.user.id)
        .eq('is_daily', true);

      if (error) throw error;

      // Refresh tasks
      await get().fetchTasks();

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDailyQuota: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get the user's daily quota
      const { data: quota, error } = await supabase
        .from('daily_quotas')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily quota:', error);
        return;
      }

      if (quota) {
        set({
          dailyQuota: quota,
          penalizedTasks: quota.penalized_tasks || [],
        });
      } else {
        // Create a new quota record if none exists
        const { data: newQuota, error: createError } = await supabase
          .from('daily_quotas')
          .insert({
            user_id: userData.user.id,
            completed_today: 0,
            consecutive_days_missed: 0,
            penalized_tasks: [],
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily quota:', createError);
          return;
        }

        set({
          dailyQuota: newQuota,
          penalizedTasks: [],
        });
      }
    } catch (error) {
      console.error('Error in fetchDailyQuota:', error);
    }
  },

  checkDailyQuota: async () => {
    try {
      await get().fetchDailyQuota();

      // If daily quota is met
      const dailyQuota = get().dailyQuota;
      if (dailyQuota && dailyQuota.completed_today >= DAILY_QUOTA_AMOUNT) {
        // Complete the daily quota (which will reward the team with EXP)
        await get().completeDailyQuota();
      }
    } catch (error) {
      console.error('Error in checkDailyQuota:', error);
    }
  },

  forceCheckOverdueTasks: async () => {
    await get().checkOverdueTasks();
  },

  subscribeToQuotaUpdates: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return () => {};
    }

    // Inject the Realtime payload directly into state rather than re-fetching.
    // daily_quotas rows are small and completely replaced on each server update,
    // so the full payload.new is always fresh and safe to use as the new state.
    const subscription = await supabase
      .channel('daily_quota_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_quotas',
          filter: `user_id=eq.${userData.user.id}`,
        },
        async (payload) => {
          set({
            dailyQuota: payload.new as DailyQuota,
            penalizedTasks: (payload.new as DailyQuota).penalized_tasks || [],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  setPenalizedTasks: (taskIds: string[]) => {
    set({ penalizedTasks: taskIds });
  },

  completeDailyQuota: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Strict equality (=== not >=) so this fires exactly once — at the moment
      // completed_today hits 3. Extra tasks beyond the quota don't re-trigger the reward.
      if (get().dailyQuota?.completed_today === DAILY_QUOTA_AMOUNT) {
        const expMultiplier = get().getExpMultiplier();

        // Apply multiplier to the base reward
        const BASE_XP_REWARD = 300;
        const actualXpReward = Math.round(BASE_XP_REWARD * expMultiplier);

        // Reward the whole team with the calculated XP
        await useDigimonStore.getState().feedAllDigimon(actualXpReward);

        // Show notification about the team reward with multiplier info
        const multiplierText =
          expMultiplier > 1
            ? ` (${BASE_XP_REWARD} × ${expMultiplier.toFixed(1)} streak bonus)`
            : '';

        useNotificationStore.getState().addNotification({
          message: `🎉 Daily Quota Complete! All team members received ${actualXpReward} EXP${multiplierText}!`,
          type: 'success',
        });

        // Check for streak titles
        const { longest_streak } = get().dailyQuota || {
          longest_streak: 0,
        };
        await useTitleStore.getState().checkStreakTitles(longest_streak);
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error in completeDailyQuota:', error);
      set({ loading: false });
    }
  },

  getExpMultiplier: () => {
    const { dailyQuota } = get();
    if (!dailyQuota) return 1.0;

    const streak = dailyQuota.current_streak;
    if (streak <= 1) return 1.0;

    // +10% per streak day beyond the first, capped at 2.0× (hit at 11-day streak).
    // Applied to the daily quota XP bonus and to per-task feedDigimon calls.
    return Math.min(1.0 + (streak - 1) * 0.1, 2.0);
  },

  editTask: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));
    } catch (error) {
      console.error('Error editing task:', error);
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },
}));
