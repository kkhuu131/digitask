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
  lastQuotaCheck: string | null;
  consecutiveDaysMissed: number;
  checkDailyQuota: () => Promise<void>;
  penalizedTasks: string[];
  debugOverdueTasks: () => void;
  initializeStore: () => Promise<void>;
  forceCheckOverdueTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  penalizedTasks: JSON.parse(localStorage.getItem("penalizedTasks") || "[]"),
  lastQuotaCheck: localStorage.getItem("lastQuotaCheck"),
  consecutiveDaysMissed: parseInt(
    localStorage.getItem("consecutiveDaysMissed") || "0"
  ),

  initializeStore: async () => {
    const penalizedTasks = JSON.parse(
      localStorage.getItem("penalizedTasks") || "[]"
    );
    set({ penalizedTasks });

    await get().fetchTasks();

    await get().checkOverdueTasks();
  },

  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });

      // Get the current user
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

      // Check for overdue tasks after fetching
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

      set((state) => {
        const updatedPenalizedTasks = state.penalizedTasks.filter(
          (id) => id !== data.id
        );
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );

        return {
          tasks: [...state.tasks, data],
          penalizedTasks: updatedPenalizedTasks,
          loading: false,
        };
      });

      // Check if the newly created task is already overdue
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

      set((state) => {
        const updatedPenalizedTasks = state.penalizedTasks.filter(
          (taskId) => taskId !== id
        );

        // Update localStorage
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );

        return {
          tasks: state.tasks.filter((task) => task.id !== id),
          penalizedTasks: updatedPenalizedTasks,
          loading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  completeTask: async (taskId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      set({ loading: true, error: null });

      // Get the task to check if it's overdue
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!task) throw new Error("Task not found");

      // Get the user's active Digimon
      const { error: digimonError } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", user?.user?.id)
        .eq("is_active", true)
        .single();

      if (digimonError) throw digimonError;

      // Update the task status
      const { error } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      // Remove from penalized tasks if it was there
      set((state) => {
        const updatedPenalizedTasks = state.penalizedTasks.filter(
          (id) => id !== taskId
        );

        // Update localStorage
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );

        return { ...state, penalizedTasks: updatedPenalizedTasks };
      });

      // Calculate points
      const points = calculateTaskPoints(task);
      console.log(`Task completed: ${task.description}, Points: ${points}`);

      // Feed the Digimon with the points
      await useDigimonStore.getState().feedDigimon(points);

      // Explicitly check for level up after feeding
      await useDigimonStore.getState().checkLevelUp();

      // Check if the task is overdue
      if (isTaskOverdue(task)) {
        await useDigimonStore.getState().checkDigimonHealth();
      }

      // Refresh the task list
      await get().fetchTasks();

      set({ loading: false });
    } catch (error) {
      console.error("Error completing task:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkOverdueTasks: async () => {
    try {
      const { tasks, penalizedTasks } = get();
      console.log("Running checkOverdueTasks");
      console.log("Total tasks:", tasks.length);
      console.log("Already penalized tasks:", penalizedTasks.length);

      // Filter for incomplete tasks that are overdue AND haven't been penalized yet
      const newOverdueTasks = tasks.filter((task) => {
        const isOverdue = isTaskOverdue(task);
        const isIncomplete = !task.is_completed;
        const isNotPenalized = !penalizedTasks.includes(task.id);

        console.log(`Task ${task.id}: "${task.description}"`);
        console.log(`- Due date: ${task.due_date}`);
        console.log(`- Is overdue: ${isOverdue}`);
        console.log(`- Is incomplete: ${isIncomplete}`);
        console.log(`- Is not penalized: ${isNotPenalized}`);

        return isIncomplete && isOverdue && isNotPenalized;
      });

      console.log(
        `Found ${newOverdueTasks.length} new overdue tasks to penalize`
      );

      if (newOverdueTasks.length > 0) {
        // Get the Digimon
        const { userDigimon } = useDigimonStore.getState();
        console.log("Active Digimon:", userDigimon?.id);

        if (!userDigimon) {
          console.log("No Digimon to penalize");
          return;
        }

        // Calculate penalty based on number of overdue tasks
        const healthPenalty = Math.min(newOverdueTasks.length * 5, 20);
        const happinessPenalty = Math.min(newOverdueTasks.length * 5, 20);

        console.log(
          `Applying penalties: Health -${healthPenalty}, Happiness -${happinessPenalty}`
        );
        console.log(
          `Current health: ${userDigimon.health}, happiness: ${userDigimon.happiness}`
        );

        // Update Digimon stats
        const newHealth = Math.max(0, userDigimon.health - healthPenalty);
        const newHappiness = Math.max(
          0,
          userDigimon.happiness - happinessPenalty
        );

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

        console.log("Successfully updated Digimon stats in database");

        // Mark these tasks as penalized
        const updatedPenalizedTasks = [
          ...penalizedTasks,
          ...newOverdueTasks.map((task) => task.id),
        ];

        console.log("Updating penalized tasks list:", updatedPenalizedTasks);

        // Store in localStorage for persistence
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );

        // Update state
        set({ penalizedTasks: updatedPenalizedTasks });
        console.log("State updated with new penalized tasks");

        // Check if Digimon health is critical
        await useDigimonStore.getState().checkDigimonHealth();
      }
    } catch (error) {
      console.error("Error checking overdue tasks:", error);
    }
  },

  resetDailyTasks: async () => {
    try {
      set({ loading: true, error: null });

      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0];

      // Get all completed daily tasks
      const { data: completedDailyTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_daily", true)
        .eq("is_completed", true);

      if (fetchError) throw fetchError;

      // No completed daily tasks to reset
      if (!completedDailyTasks || completedDailyTasks.length === 0) {
        set({ loading: false });
        return;
      }

      // Reset all completed daily tasks and update due_date to today
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

      // Update local state
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

  checkDailyQuota: async () => {
    try {
      const today = new Date().toDateString();
      const { lastQuotaCheck, tasks, consecutiveDaysMissed } = get();

      // Skip if we already checked today
      if (lastQuotaCheck === today) return;

      // Count completed tasks for today
      const completedToday = tasks.filter((task) => {
        if (!task.is_completed || !task.completed_at) return false;

        const completedDate = new Date(task.completed_at).toDateString();
        return completedDate === today;
      }).length;

      const DAILY_QUOTA = 3; // Minimum tasks to complete per day

      // Check if quota was met
      if (completedToday < DAILY_QUOTA) {
        // Quota not met - decrease happiness significantly
        const { userDigimon } = useDigimonStore.getState();
        if (userDigimon) {
          // Calculate happiness decrease - more severe if consecutive days missed
          const happinessDecrease = Math.min(
            userDigimon.happiness,
            10 + consecutiveDaysMissed * 5
          );

          // Calculate health decrease - only if consecutive days missed
          const healthDecrease =
            consecutiveDaysMissed > 0
              ? Math.min(userDigimon.health, consecutiveDaysMissed * 7)
              : 0;

          // Update Digimon stats
          await useDigimonStore.getState().updateDigimonStats({
            happiness: userDigimon.happiness - happinessDecrease,
            health: userDigimon.health - healthDecrease,
          });

          // Increment consecutive days missed
          const newConsecutiveDays = consecutiveDaysMissed + 1;
          set({ consecutiveDaysMissed: newConsecutiveDays });
          localStorage.setItem(
            "consecutiveDaysMissed",
            newConsecutiveDays.toString()
          );

          console.log(
            `Daily quota not met! ${completedToday}/${DAILY_QUOTA} tasks completed.`
          );
          console.log(`Consecutive days missed: ${newConsecutiveDays}`);
          console.log(
            `Happiness decreased by ${happinessDecrease}, health decreased by ${healthDecrease}`
          );
        }
      } else {
        // Quota met - reset consecutive days counter
        set({ consecutiveDaysMissed: 0 });
        localStorage.setItem("consecutiveDaysMissed", "0");
        console.log(
          `Daily quota met! ${completedToday}/${DAILY_QUOTA} tasks completed.`
        );
      }

      // Update last check date
      set({ lastQuotaCheck: today });
      localStorage.setItem("lastQuotaCheck", today);

      // After checking quota, check if Digimon health is zero
      await useDigimonStore.getState().checkDigimonHealth();
    } catch (error) {
      console.error("Error checking daily quota:", error);
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
}));

const calculateTaskPoints = (task: Task): number => {
  if (task.is_daily) return 15;
  return 20;
};

// Update the logic for checking if a task is overdue
const isTaskOverdue = (task: Task): boolean => {
  // If there's no due date, it can't be overdue
  if (!task.due_date) return false;

  // For daily tasks, they're only overdue if the due date is before today's date
  if (task.is_daily) {
    const dueDate = new Date(task.due_date);
    const today = new Date();

    // Reset time components to compare just the dates
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

  // For one-time tasks, they're overdue if the due date is before the current time
  const dueDate = new Date(task.due_date);
  const now = new Date();
  return dueDate < now;
};
