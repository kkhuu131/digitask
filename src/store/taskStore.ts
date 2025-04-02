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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  lastQuotaCheck: localStorage.getItem("lastQuotaCheck"),
  consecutiveDaysMissed: parseInt(
    localStorage.getItem("consecutiveDaysMissed") || "0"
  ),
  penalizedTasks: JSON.parse(localStorage.getItem("penalizedTasks") || "[]"),

  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      set({ tasks: tasks || [], loading: false });
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

  completeTask: async (id: string): Promise<void> => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately
      set((state) => {
        const updatedPenalizedTasks = state.penalizedTasks.filter(
          (taskId) => taskId !== id
        );
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );

        return {
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  is_completed: true,
                  completed_at: new Date().toISOString(),
                }
              : task
          ),
          penalizedTasks: updatedPenalizedTasks,
          loading: false,
        };
      });

      // Calculate XP gain
      const task = get().tasks.find((t) => t.id === id);
      const xpGain = task?.is_daily ? 10 : 15; // Daily tasks give less XP

      // Update the Digimon's XP and stats immediately
      const { userDigimon } = useDigimonStore.getState();
      if (userDigimon) {
        // Calculate new XP and potential level up
        const currentXP = userDigimon.experience_points;
        const currentLevel = userDigimon.current_level;
        const newXP = currentXP + xpGain;

        // XP needed for next level = current level * 20
        const xpForNextLevel = currentLevel * 20;
        const leveledUp = newXP >= xpForNextLevel;

        // Calculate new level and remaining XP if leveled up
        const newLevel = leveledUp ? currentLevel + 1 : currentLevel;
        const remainingXP = leveledUp ? newXP - xpForNextLevel : newXP;

        // Update happiness and health
        const newHappiness = Math.min(100, userDigimon.happiness + 5);
        const newHealth = Math.min(100, userDigimon.health + 3);

        // Update the Digimon stats
        await useDigimonStore.getState().updateDigimonStats({
          experience_points: leveledUp ? remainingXP : newXP,
          current_level: newLevel,
          happiness: newHappiness,
          health: newHealth,
        });

        // Show a toast or notification for XP gain and level up
        if (leveledUp) {
          // You could implement a toast notification system here
          console.log(`Level Up! Your Digimon is now level ${newLevel}!`);
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkOverdueTasks: async () => {
    try {
      set({ loading: true, error: null });

      const { tasks, penalizedTasks } = get();
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find daily tasks that should have been completed yesterday
      const overdueDailyTasks = tasks.filter((task) => {
        if (!task.is_daily || task.is_completed) return false;

        // If the task has never been completed, or was completed before yesterday
        const taskDate = task.completed_at ? new Date(task.completed_at) : null;
        if (!taskDate) return true;

        return taskDate < yesterday && !task.is_completed;
      });

      // Find non-daily tasks with due dates in the past
      const overdueNonDailyTasks = tasks.filter((task) => {
        if (task.is_daily || task.is_completed || !task.due_date) return false;

        // Compare the full timestamp, not just the date
        const dueDate = new Date(task.due_date);
        const now = new Date();

        // Detailed logging for debugging
        console.log(`Task: "${task.description}"`);
        console.log(`Due date string: ${task.due_date}`);
        console.log(`Parsed due date: ${dueDate.toString()}`);
        console.log(`Current time: ${now.toString()}`);
        console.log(`Is overdue: ${dueDate < now}`);
        console.log(
          `Time difference (ms): ${now.getTime() - dueDate.getTime()}`
        );

        return dueDate < now;
      });

      // Filter out tasks that have already been penalized
      const newOverdueTasks = [
        ...overdueDailyTasks,
        ...overdueNonDailyTasks,
      ].filter((task) => !penalizedTasks.includes(task.id));

      if (newOverdueTasks.length > 0) {
        // Decrease digimon health and happiness based on NEW overdue tasks only
        const { userDigimon } = useDigimonStore.getState();
        if (userDigimon) {
          const healthDecrease = Math.min(
            userDigimon.health,
            newOverdueTasks.length * 5
          );
          const happinessDecrease = Math.min(
            userDigimon.happiness,
            newOverdueTasks.length * 5
          );

          await useDigimonStore.getState().updateDigimonStats({
            health: userDigimon.health - healthDecrease,
            happiness: userDigimon.happiness - happinessDecrease,
          });

          // Log which tasks caused penalties
          console.log(
            `Applied penalties for ${newOverdueTasks.length} newly overdue tasks`
          );
          newOverdueTasks.forEach((task) => {
            console.log(`- Task "${task.description}" is overdue`);
          });
        }

        // Reset daily tasks
        for (const task of overdueDailyTasks) {
          await get().updateTask(task.id, {
            is_completed: false,
            completed_at: null,
          });
        }

        // Add the newly penalized tasks to the tracking array
        const updatedPenalizedTasks = [
          ...penalizedTasks,
          ...newOverdueTasks.map((task) => task.id),
        ];
        set({ penalizedTasks: updatedPenalizedTasks });
        localStorage.setItem(
          "penalizedTasks",
          JSON.stringify(updatedPenalizedTasks)
        );
      }

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  resetDailyTasks: async () => {
    try {
      set({ loading: true, error: null });

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

      // Reset all completed daily tasks
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          is_completed: false,
          completed_at: null,
        })
        .eq("is_daily", true)
        .eq("is_completed", true);

      if (updateError) throw updateError;

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.is_daily && task.is_completed
            ? { ...task, is_completed: false, completed_at: null }
            : task
        ),
        loading: false,
      }));

      console.log(`Reset ${completedDailyTasks.length} daily tasks`);
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
}));
