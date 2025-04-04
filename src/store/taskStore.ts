import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";

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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  penalizedTasks: [],
  dailyQuota: null,

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

      const { dailyQuota } = get();
      if (
        dailyQuota &&
        dailyQuota.penalized_tasks &&
        dailyQuota.penalized_tasks.includes(data.id)
      ) {
        const updatedPenalizedTasks = dailyQuota.penalized_tasks.filter(
          (id) => id !== data.id
        );

        await supabase
          .from("daily_quotas")
          .update({ penalized_tasks: updatedPenalizedTasks })
          .eq("id", dailyQuota.id);

        set((state) => ({
          dailyQuota: state.dailyQuota
            ? {
                ...state.dailyQuota,
                penalized_tasks: updatedPenalizedTasks,
              }
            : null,
          penalizedTasks: updatedPenalizedTasks,
        }));
      }

      if (isTaskOverdue(data)) {
        console.log(
          "Newly created task is already overdue, checking penalties"
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

      const { dailyQuota } = get();
      if (
        dailyQuota &&
        dailyQuota.penalized_tasks &&
        dailyQuota.penalized_tasks.includes(id)
      ) {
        const updatedPenalizedTasks = dailyQuota.penalized_tasks.filter(
          (taskId) => taskId !== id
        );

        await supabase
          .from("daily_quotas")
          .update({ penalized_tasks: updatedPenalizedTasks })
          .eq("id", dailyQuota.id);

        set((state) => ({
          dailyQuota: state.dailyQuota
            ? {
                ...state.dailyQuota,
                penalized_tasks: updatedPenalizedTasks,
              }
            : null,
          penalizedTasks: updatedPenalizedTasks,
          tasks: state.tasks.filter((task) => task.id !== id),
          loading: false,
        }));
      } else {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  completeTask: async (taskId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      set({ loading: true, error: null });

      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!task) throw new Error("Task not found");

      const { data: userDigimon } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", user?.user?.id)
        .eq("is_active", true)
        .single();

      if (userDigimon) {
        const { error } = await supabase
          .from("tasks")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (error) throw error;

        set((state) => {
          const updatedPenalizedTasks = state.penalizedTasks.filter(
            (id) => id !== taskId
          );

          return { ...state, penalizedTasks: updatedPenalizedTasks };
        });

        const points = calculateTaskPoints(task);
        console.log(`Task completed: ${task.description}, Points: ${points}`);

        await useDigimonStore.getState().feedDigimon(points);
        await useDigimonStore.getState().checkLevelUp();

        if (isTaskOverdue(task)) {
          await useDigimonStore.getState().checkDigimonHealth();
        }

        await get().fetchTasks();
        await get().fetchDailyQuota();

        set({ loading: false });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkOverdueTasks: async () => {
    try {
      const { tasks, dailyQuota, penalizedTasks } = get();

      if (!dailyQuota) {
        await get().fetchDailyQuota();
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: userDigimon } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .single();

      if (!userDigimon) {
        console.log("No active Digimon found, skipping overdue check");
        return;
      }

      const now = new Date();
      const newOverdueTasks = tasks.filter(
        (task) =>
          !task.is_completed &&
          task.due_date &&
          new Date(task.due_date) < now &&
          !penalizedTasks.includes(task.id)
      );

      if (newOverdueTasks.length > 0) {
        console.log(`Found ${newOverdueTasks.length} new overdue tasks`);

        const healthPenalty = Math.min(
          userDigimon.health,
          newOverdueTasks.length * 5
        );
        const happinessPenalty = Math.min(
          userDigimon.happiness,
          newOverdueTasks.length * 10
        );

        const newHealth = userDigimon.health - healthPenalty;
        const newHappiness = userDigimon.happiness - happinessPenalty;

        console.log(`New health: ${newHealth}, new happiness: ${newHappiness}`);

        const { error } = await supabase
          .from("user_digimon")
          .update({
            health: newHealth,
            happiness: newHappiness,
          })
          .eq("id", userDigimon.id);

        if (error) {
          console.error("Error updating Digimon stats:", error);
          return;
        }

        const updatedPenalizedTasks = [
          ...penalizedTasks,
          ...newOverdueTasks.map((task) => task.id),
        ];

        await supabase
          .from("daily_quotas")
          .update({ penalized_tasks: updatedPenalizedTasks })
          .eq("id", dailyQuota.id);

        set((state) => ({
          dailyQuota: state.dailyQuota
            ? {
                ...state.dailyQuota,
                penalized_tasks: updatedPenalizedTasks,
              }
            : null,
          penalizedTasks: updatedPenalizedTasks,
        }));

        await useDigimonStore.getState().checkDigimonHealth();
      }
    } catch (error) {
      console.error("Error checking overdue tasks:", error);
    }
  },

  resetDailyTasks: async () => {
    try {
      set({ loading: true, error: null });

      const today = new Date().toISOString().split("T")[0];

      const { data: completedDailyTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_daily", true)
        .eq("is_completed", true);

      if (fetchError) throw fetchError;

      if (!completedDailyTasks || completedDailyTasks.length === 0) {
        set({ loading: false });
        return;
      }

      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          is_completed: false,
          completed_at: null,
          due_date: today,
        })
        .eq("is_daily", true)
        .eq("is_completed", true);

      if (updateError) throw updateError;

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.is_daily && task.is_completed
            ? {
                ...task,
                is_completed: false,
                completed_at: null,
                due_date: today,
              }
            : task
        ),
        loading: false,
      }));

      console.log(
        `Reset ${completedDailyTasks.length} daily tasks with due date set to today`
      );
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDailyQuota: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Try to get today's quota record
      const { data: quota, error } = await supabase
        .from("daily_quotas")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching daily quota:", error);
        return;
      }

      if (quota) {
        const penalized_tasks = quota.penalized_tasks || [];
        set({
          dailyQuota: quota,
          penalizedTasks: penalized_tasks,
        });
      } else {
        // No quota for today - check if we need to create a new one or update an existing one
        const nextReset = new Date();
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);

        // First check if there's any existing quota for this user
        const { data: existingQuota } = await supabase
          .from("daily_quotas")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existingQuota) {
          // Update the existing quota for today
          const { data: updatedQuota, error: updateError } = await supabase
            .from("daily_quotas")
            .update({
              completed_today: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingQuota.id)
            .select()
            .single();

          if (updateError) {
            console.error("Error updating daily quota:", updateError);
            return;
          }

          set({
            dailyQuota: updatedQuota,
            penalizedTasks: updatedQuota.penalized_tasks || [],
          });
        } else {
          // Create a new quota record
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
      }
    } catch (error) {
      console.error("Error in fetchDailyQuota:", error);
    }
  },

  checkDailyQuota: async () => {
    try {
      await get().fetchDailyQuota();
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
          get().dailyQuota = payload.new as DailyQuota;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },
}));

const calculateTaskPoints = (task: Task): number => {
  if (task.is_daily) return 15;
  return 20;
};

const isTaskOverdue = (task: Task): boolean => {
  if (!task.due_date) return false;

  if (task.is_daily) {
    const dueDate = new Date(task.due_date);
    const today = new Date();

    const dueDateOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return dueDateOnly < todayOnly;
  }

  const dueDate = new Date(task.due_date);
  const now = new Date();
  return dueDate < now;
};
