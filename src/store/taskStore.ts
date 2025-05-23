import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { isUnderStatCap, useDigimonStore } from "./petStore";
import { useNotificationStore } from "./notificationStore";
import { StatCategory } from "../utils/categoryDetection";
import { useAuthStore } from "../store/authStore";
import { useTitleStore } from "./titleStore";

const BASE_EXP_FOR_ONE_TIME_TASK = 100;
const BASE_STAT_FOR_ONE_TIME_TASK = 1;
const BASE_EXP_FOR_RECURRING_TASK = 75;
const BASE_STAT_FOR_RECURRING_TASK = 1;
const BASE_EXP_FOR_DAILY_TASK = 75;
const BASE_STAT_FOR_DAILY_TASK = 1;

const DAILY_QUOTA_AMOUNT = 3;

export const getExpPoints = (task: Task) => {
  if (task.is_daily) return BASE_EXP_FOR_DAILY_TASK;
  if (task.recurring_days) return BASE_EXP_FOR_RECURRING_TASK;
  return BASE_EXP_FOR_ONE_TIME_TASK;
};

export const getStatPoints = (task: Task) => {
  if (task.is_daily) return BASE_STAT_FOR_DAILY_TASK;
  if (task.recurring_days) return BASE_STAT_FOR_RECURRING_TASK;
  return BASE_STAT_FOR_ONE_TIME_TASK;
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
  debugOverdueTasks: () => void;
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
        .from("tasks")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("due_date", { ascending: true });

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
      };

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...taskToCreate, user_id: userData.user.id }])
        .select("*")
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false,
      }));
    } catch (error) {
      console.error("Error creating task:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));
    } catch (error) {
      console.error("Error editing task:", error);
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
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      // No need to update tasks again since we already did it optimistically
    } catch (error) {
      console.error("Error deleting task:", error);

      // If there's an error, revert the optimistic update by adding the task back
      const taskToRestore = get().tasks.find((t) => t.id === id);
      if (taskToRestore) {
        set((state) => ({
          tasks: [...state.tasks, taskToRestore],
          error: (error as Error).message,
        }));

        // Show error notification
        useNotificationStore.getState().addNotification({
          message: "Failed to delete task. Please try again.",
          type: "error",
        });
      }
    }
  },

  // Rookie: 5, Champion 10, Ultimate: 20, Mega: 50

  completeTask: async (id: string, autoAllocate: boolean = false) => {
    try {
      // Get the current task
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      // Optimistically update the UI immediately
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, is_completed: true } : t
        ),
      }));

      // Then perform the actual update in the background
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Update the task in the database
      const { error } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Replace the feedDigimon call with feedMultipleDigimon
      const expPoints = Math.round(
        getExpPoints(task) * get().getExpMultiplier()
      );
      const reserveExp = await useDigimonStore
        .getState()
        .feedMultipleDigimon(expPoints);

      // Dispatch event to notify components that a task was completed
      window.dispatchEvent(new Event("task-completed"));

      // Check if we've reached the daily stat cap
      const { canGain, remaining } = await useDigimonStore
        .getState()
        .checkStatCap();

      if (!canGain) {
        useNotificationStore.getState().addNotification({
          message:
            "You've reached your stat gain limit for today. You can still complete tasks, but no more stat points will be gained until tomorrow.",
          type: "info",
        });
      } else if (task.category) {
        const boostValue = getStatPoints(task);
        const adjustedBoostValue = Math.min(boostValue, remaining);

        if (
          autoAllocate &&
          isUnderStatCap(useDigimonStore.getState().userDigimon)
        ) {
          // Get current daily_stat_gains from profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("daily_stat_gains")
            .eq("id", userData.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching daily stat gains:", profileError);
            throw profileError;
          }

          // Calculate new daily stat gains
          const newDailyGains =
            (profileData.daily_stat_gains || 0) + adjustedBoostValue;

          // Update daily_stat_gains in profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              daily_stat_gains: newDailyGains,
            })
            .eq("id", userData.user.id);

          if (updateError) {
            console.error("Error updating daily stat gains:", updateError);
            throw updateError;
          }

          // Apply stat boost to active Digimon
          await useDigimonStore
            .getState()
            .increaseStat(task.category as StatCategory, adjustedBoostValue);

          // Update the pet store's userDailyStatGains
          useDigimonStore.getState().fetchUserDailyStatGains();

          useNotificationStore.getState().addNotification({
            message: `Completed "${task.description}"! \n${
              useDigimonStore.getState().userDigimon?.name || "Active Digimon"
            } gained ${expPoints} exp and ${adjustedBoostValue} ${
              task.category
            }!\nReserve Digimon gained ${reserveExp} exp!`,
            type: "success",
          });
        } else {
          // Get current saved stats from the database
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("saved_stats, daily_stat_gains")
            .eq("id", userData.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching saved stats:", profileError);
            throw profileError;
          }

          // Update saved stats
          const savedStats = profileData.saved_stats || {
            HP: 0,
            SP: 0,
            ATK: 0,
            DEF: 0,
            INT: 0,
            SPD: 0,
          };

          savedStats[task.category] =
            (savedStats[task.category] || 0) + adjustedBoostValue;

          // Calculate new daily stat gains
          const newDailyGains =
            (profileData.daily_stat_gains || 0) + adjustedBoostValue;

          // Save to database
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              saved_stats: savedStats,
              daily_stat_gains: newDailyGains,
            })
            .eq("id", userData.user.id);

          if (updateError) {
            console.error("Error updating saved stats:", updateError);
            throw updateError;
          }

          // Also update localStorage for immediate UI feedback
          localStorage.setItem("savedStats", JSON.stringify(savedStats));

          // Update the pet store's userDailyStatGains
          useDigimonStore.getState().fetchUserDailyStatGains();

          if (autoAllocate) {
            useNotificationStore.getState().addNotification({
              message: `Digimon has reached its stat cap, ${adjustedBoostValue} ${
                task.category
              } points were saved!\n${
                useDigimonStore.getState().userDigimon?.name || "Active Digimon"
              } gained ${expPoints} exp!\nReserve Digimon gained ${reserveExp} exp!`,
              type: "success",
            });
          } else {
            useNotificationStore.getState().addNotification({
              message: `${adjustedBoostValue} ${
                task.category
              } saved for later!\n${
                useDigimonStore.getState().userDigimon?.name || "Active Digimon"
              } gained ${expPoints} exp!\nReserve Digimon gained ${reserveExp} exp!`,
              type: "success",
            });
          }
        }
      } else {
        useNotificationStore.getState().addNotification({
          message: `${
            useDigimonStore.getState().userDigimon?.name || "Active Digimon"
          } gained ${expPoints} exp!\nReserve Digimon gained ${reserveExp} exp!`,
          type: "success",
        });
      }

      // Check for level up
      await useDigimonStore.getState().checkLevelUp();

      // Check daily quota
      await get().checkDailyQuota();
    } catch (error) {
      console.error("Error completing task:", error);

      // If there's an error, revert the optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, is_completed: false } : t
        ),
        error: (error as Error).message,
      }));

      // Show error notification
      useNotificationStore.getState().addNotification({
        message: "Failed to complete task. Please try again.",
        type: "error",
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

      // Find tasks that have become overdue
      const newlyOverdueTasks = tasks.filter((task) => {
        if (task.is_daily || task.is_completed || !task.due_date) return false;

        const dueDate = new Date(task.due_date);
        return dueDate < now && !penalizedTasks.includes(task.id);
      });

      if (newlyOverdueTasks.length > 0) {
        // Get the current daily quota
        const { data: quotaData } = await supabase
          .from("daily_quotas")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        if (quotaData) {
          // Create a set of all penalized tasks to avoid duplicates
          const allPenalizedSet = new Set([
            ...(quotaData.penalized_tasks || []),
            ...newlyOverdueTasks.map((t) => t.id),
          ]);
          const allPenalized = Array.from(allPenalizedSet);

          // Update the database with all penalized tasks first
          await supabase
            .from("daily_quotas")
            .update({ penalized_tasks: allPenalized })
            .eq("user_id", userData.user.id);

          // Update local state
          set({ penalizedTasks: allPenalized });
        }

        // Apply penalties for each overdue task
        for (const _ of newlyOverdueTasks) {
          // Apply health and happiness penalties to the Digimon
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
      console.error("Error checking overdue tasks:", error);
    }
  },

  resetDailyTasks: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Reset all daily tasks to uncompleted
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: false })
        .eq("user_id", userData.user.id)
        .eq("is_daily", true);

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
        .from("daily_quotas")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching daily quota:", error);
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
          .from("daily_quotas")
          .insert({
            user_id: userData.user.id,
            completed_today: 0,
            consecutive_days_missed: 0,
            penalized_tasks: [],
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating daily quota:", createError);
          return;
        }

        set({
          dailyQuota: newQuota,
          penalizedTasks: [],
        });
      }
    } catch (error) {
      console.error("Error in fetchDailyQuota:", error);
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
      console.error("Error in checkDailyQuota:", error);
    }
  },

  debugOverdueTasks: () => {
    const { tasks } = get();
    const now = new Date();

    console.log("=== DEBUG: CHECKING OVERDUE TASKS ===");
    console.log(`Current time: ${now.toLocaleString()}`);

    tasks.forEach((task) => {
      if (!task.is_daily && !task.is_completed && task.due_date) {
        const dueDate = new Date(task.due_date);
        console.log(`Task: "${task.description}"`);
        console.log(`Due date: ${dueDate.toLocaleString()}`);
        console.log(`Is overdue: ${dueDate < now}`);
        console.log(
          `Time difference (ms): ${now.getTime() - dueDate.getTime()}`
        );
        console.log("---");
      }
    });
  },

  forceCheckOverdueTasks: async () => {
    await get().checkOverdueTasks();
  },

  subscribeToQuotaUpdates: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return () => {};
    }

    const subscription = await supabase
      .channel("daily_quota_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_quotas",
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

      if (get().dailyQuota?.completed_today === DAILY_QUOTA_AMOUNT) {
        // Get the XP multiplier based on streak
        const expMultiplier = get().getExpMultiplier();

        // Apply multiplier to the base reward
        const BASE_XP_REWARD = 100;
        const actualXpReward = Math.round(BASE_XP_REWARD * expMultiplier);

        // Reward the whole team with the calculated XP
        await useDigimonStore.getState().feedAllDigimon(actualXpReward);

        // Show notification about the team reward with multiplier info
        const multiplierText =
          expMultiplier > 1
            ? ` (${BASE_XP_REWARD} × ${expMultiplier.toFixed(1)} streak bonus)`
            : "";

        useNotificationStore.getState().addNotification({
          message: `🎉 Daily Quota Complete! All team members received ${actualXpReward} EXP${multiplierText}!`,
          type: "success",
        });

        // Check for streak titles
        const { longest_streak } = get().dailyQuota || {
          longest_streak: 0,
        };
        await useTitleStore.getState().checkStreakTitles(longest_streak);
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error in completeDailyQuota:", error);
      set({ loading: false });
    }
  },

  getExpMultiplier: () => {
    const { dailyQuota } = get();
    if (!dailyQuota) return 1.0;

    const streak = dailyQuota.current_streak;
    if (streak <= 1) return 1.0;

    return Math.min(1.0 + (streak - 1) * 0.1, 2.5);
  },

  editTask: async (id, updates) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));
    } catch (error) {
      console.error("Error editing task:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },
}));
