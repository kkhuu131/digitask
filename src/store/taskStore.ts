import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { DAILY_QUOTA_MILESTONE, useMilestoneStore } from "./milestoneStore";

export interface Task {
  id: string;
  user_id: string;
  description: string;
  is_daily: boolean;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
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
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
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

  createTask: async (task) => {
    try {
      set({ loading: true, error: null });

      const { data: user } = await supabase.auth.getUser();

      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...task,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false,
      }));

      // Check if the newly created task is already overdue
      if (
        !data.is_daily &&
        data.due_date &&
        new Date(data.due_date) < new Date()
      ) {
        console.log(
          "Newly created task is already overdue, checking penalties..."
        );
        await get().checkOverdueTasks();
      }
    } catch (error) {
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
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  completeTask: async (taskId) => {
    try {
      set({ loading: true, error: null });

      // Find the task in the current state
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Update the task in the database
      const { data: updatedTask, error } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Update the local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));

      // Increment the tasks completed count for milestones
      await useMilestoneStore.getState().incrementTasksCompleted(1);

      // Calculate points based on task type
      const points = calculateTaskPoints(task);

      // Update Digimon stats
      await useDigimonStore.getState().feedDigimon(points);
      await useDigimonStore.getState().checkLevelUp();

      // If it's a daily task, increment the daily quota
      if (task.is_daily) {
        await get().fetchDailyQuota();
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error completing task:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkOverdueTasks: async () => {
    try {
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
        console.log(`Found ${newlyOverdueTasks.length} newly overdue tasks`);

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
        for (const task of newlyOverdueTasks) {
          console.log(`Applying penalty for overdue task: ${task.description}`);

          // Apply health and happiness penalties to the Digimon
          await useDigimonStore.getState().applyPenalty(10, 15);
          penaltyApplied = true;
        }

        // After applying penalties, check if the Digimon has died
        if (penaltyApplied) {
          // Fetch the updated Digimon data to check health
          await useDigimonStore.getState().fetchUserDigimon();

          // Check if the Digimon has died and handle it
          const { userDigimon } = useDigimonStore.getState();
          if (userDigimon && userDigimon.health <= 0) {
            console.log("Digimon has died due to overdue tasks");
            await useDigimonStore.getState().handleDigimonDeath();
          }
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
      if (dailyQuota && dailyQuota.completed_today >= DAILY_QUOTA_MILESTONE) {
        // Increment the daily quota streak for milestones
        await useMilestoneStore.getState().incrementDailyQuotaStreak();
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
    console.log("Manually triggering overdue task check");
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
          console.log("Daily quota changed:", payload);
          // Update the state with the new quota data
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

      // ... existing code to update daily quota ...

      // After successfully completing the daily quota, update the milestone
      // This will now fetch the updated milestone data after the database trigger runs
      await useMilestoneStore.getState().incrementDailyQuotaStreak();

      // ... rest of the function ...
    } catch (error) {
      // ... error handling ...
    }
  },

  getExpMultiplier: () => {
    const { dailyQuota } = get();
    if (!dailyQuota) return 1.0;

    const streak = dailyQuota.current_streak;
    if (streak <= 1) return 1.0;

    // Add 0.1 (10%) for each streak day beyond the first
    // Cap at 3.0 (300%)
    return Math.min(1.0 + (streak - 1) * 0.1, 3.0);
  },
}));

// Move these helper functions to a separate utility file
const calculateTaskPoints = (task: Task): number => {
  if (task.is_daily) return 50;
  return 75;
};
