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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

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

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false,
      }));
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

  completeTask: async (id) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loading: false,
      }));

      // Feed the digimon when a task is completed
      await useDigimonStore.getState().feedDigimon(1);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkOverdueTasks: async () => {
    try {
      const { tasks } = get();
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find daily tasks from yesterday that weren't completed
      const overdueDailyTasks = tasks.filter((task) => {
        if (!task.is_daily || task.is_completed) return false;

        const taskDate = new Date(task.created_at);
        return taskDate < yesterday && !task.is_completed;
      });

      // Find non-daily tasks with due dates in the past
      const overdueNonDailyTasks = tasks.filter((task) => {
        if (task.is_daily || task.is_completed || !task.due_date) return false;

        const dueDate = new Date(task.due_date);
        return dueDate < now;
      });

      const totalOverdueTasks =
        overdueDailyTasks.length + overdueNonDailyTasks.length;

      if (totalOverdueTasks > 0) {
        // Decrease digimon health and happiness based on overdue tasks
        const { userDigimon } = useDigimonStore.getState();
        if (userDigimon) {
          const healthDecrease = Math.min(
            userDigimon.health,
            totalOverdueTasks * 5
          );
          const happinessDecrease = Math.min(
            userDigimon.happiness,
            totalOverdueTasks * 5
          );

          await useDigimonStore.getState().updateDigimonStats({
            health: userDigimon.health - healthDecrease,
            happiness: userDigimon.happiness - happinessDecrease,
          });
        }

        // Reset daily tasks
        for (const task of overdueDailyTasks) {
          await get().updateTask(task.id, {
            is_completed: false,
            completed_at: null,
          });
        }
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
