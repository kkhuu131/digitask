import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { useNotificationStore } from "./notificationStore";

// Constants for milestone requirements
export const DAILY_QUOTA_MILESTONE = 3; // Complete daily quota 3 times
export const TASKS_COMPLETED_MILESTONE = 10; // Complete 10 tasks

interface MilestoneState {
  dailyQuotaStreak: number;
  tasksCompletedCount: number;
  lastDigimonClaimedAt: string | null;
  loading: boolean;
  error: string | null;
  canClaimDigimon: boolean;

  // Methods
  fetchMilestones: () => Promise<void>;
  incrementDailyQuotaStreak: () => Promise<void>;
  incrementTasksCompleted: (count?: number) => Promise<void>;
  resetMilestoneProgress: (
    type: "daily_quota" | "tasks_completed"
  ) => Promise<void>;
  claimDigimon: () => Promise<boolean>;
  checkCanClaimDigimon: () => boolean;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  dailyQuotaStreak: 0,
  tasksCompletedCount: 0,
  lastDigimonClaimedAt: null,
  loading: false,
  error: null,
  canClaimDigimon: false,

  fetchMilestones: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Check if user has milestone data
      const { data: milestoneData, error } = await supabase
        .from("user_milestones")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // If no milestone data exists, create it
      if (!milestoneData) {
        const { error: createError } = await supabase
          .from("user_milestones")
          .insert({
            user_id: userData.user.id,
            daily_quota_streak: 0,
            tasks_completed_count: 0,
          })
          .select("*")
          .single();

        if (createError) throw createError;

        set({
          dailyQuotaStreak: 0,
          tasksCompletedCount: 0,
          lastDigimonClaimedAt: null,
          loading: false,
          canClaimDigimon: false,
        });
        return;
      }

      // Update state with milestone data
      set({
        dailyQuotaStreak: milestoneData.daily_quota_streak,
        tasksCompletedCount: milestoneData.tasks_completed_count,
        lastDigimonClaimedAt: milestoneData.last_digimon_claimed_at,
        loading: false,
        canClaimDigimon: get().checkCanClaimDigimon(),
      });
    } catch (error) {
      console.error("Error fetching milestones:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  incrementDailyQuotaStreak: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Increment the streak in the database
      const { error } = await supabase
        .from("user_milestones")
        .update({
          daily_quota_streak: get().dailyQuotaStreak + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        dailyQuotaStreak: state.dailyQuotaStreak + 1,
        canClaimDigimon: get().checkCanClaimDigimon(),
      }));

      // Check if milestone reached
      if (get().dailyQuotaStreak % DAILY_QUOTA_MILESTONE === 0) {
        useNotificationStore.getState().addNotification({
          message: `You've completed your daily quota ${DAILY_QUOTA_MILESTONE} times! You can claim a new Digimon.`,
          type: "success",
          persistent: true,
        });
      }
    } catch (error) {
      console.error("Error incrementing daily quota streak:", error);
    }
  },

  incrementTasksCompleted: async (count = 1) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const newCount = get().tasksCompletedCount + count;

      // Update the count in the database
      const { error } = await supabase
        .from("user_milestones")
        .update({
          tasks_completed_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Update local state
      set({
        tasksCompletedCount: newCount,
        canClaimDigimon: get().checkCanClaimDigimon(),
      });

      // Check if milestone reached
      if (
        Math.floor(newCount / TASKS_COMPLETED_MILESTONE) >
        Math.floor((newCount - count) / TASKS_COMPLETED_MILESTONE)
      ) {
        useNotificationStore.getState().addNotification({
          message: `You've completed ${TASKS_COMPLETED_MILESTONE} tasks! You can claim a new Digimon.`,
          type: "success",
          persistent: true,
        });
      }
    } catch (error) {
      console.error("Error incrementing tasks completed:", error);
    }
  },

  resetMilestoneProgress: async (type: "daily_quota" | "tasks_completed") => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const updates =
        type === "daily_quota"
          ? { daily_quota_streak: 0 }
          : { tasks_completed_count: 0 };

      // Reset the progress in the database
      const { error } = await supabase
        .from("user_milestones")
        .update({
          ...updates,
          last_digimon_claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Update local state
      set(() => ({
        ...(type === "daily_quota"
          ? { dailyQuotaStreak: 0 }
          : { tasksCompletedCount: 0 }),
        lastDigimonClaimedAt: new Date().toISOString(),
        canClaimDigimon: false,
      }));
    } catch (error) {
      console.error(`Error resetting ${type} progress:`, error);
    }
  },

  claimDigimon: async () => {
    try {
      set({ loading: true, error: null });

      // Check if user can claim a Digimon
      if (!get().canClaimDigimon) {
        set({
          loading: false,
          error: "You haven't reached a milestone to claim a Digimon yet.",
        });
        return false;
      }

      // Get available starter Digimon
      const starterDigimon = await useDigimonStore
        .getState()
        .getStarterDigimon();
      if (!starterDigimon || starterDigimon.length === 0) {
        set({ loading: false, error: "No Digimon available to claim." });
        return false;
      }

      // Randomly select a Digimon from the starters
      const randomIndex = Math.floor(Math.random() * starterDigimon.length);
      const selectedDigimon = starterDigimon[randomIndex];

      // Create the Digimon for the user (not active by default)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false, error: "User not authenticated." });
        return false;
      }

      // Check if user already has 3 Digimon
      const { data: userDigimonCount } = await supabase
        .from("user_digimon")
        .select("count")
        .eq("user_id", userData.user.id);

      if (userDigimonCount && userDigimonCount[0]?.count >= 3) {
        set({
          loading: false,
          error: "You already have the maximum number of Digimon (3).",
        });
        return false;
      }

      // Create the new Digimon
      const { error: createError } = await supabase
        .from("user_digimon")
        .insert({
          user_id: userData.user.id,
          digimon_id: selectedDigimon.id,
          name: selectedDigimon.name,
          health: 100,
          happiness: 100,
          experience_points: 0,
          current_level: 1,
          is_active: false,
        });

      if (createError) throw createError;

      // Determine which milestone was reached
      const dailyQuotaReached = get().dailyQuotaStreak >= DAILY_QUOTA_MILESTONE;
      const tasksReached =
        get().tasksCompletedCount >= TASKS_COMPLETED_MILESTONE;

      // Reset the appropriate milestone counter
      if (dailyQuotaReached) {
        await get().resetMilestoneProgress("daily_quota");
      } else if (tasksReached) {
        await get().resetMilestoneProgress("tasks_completed");
      }

      // Refresh the user's Digimon list
      await useDigimonStore.getState().fetchAllUserDigimon();

      // Show success notification
      useNotificationStore.getState().addNotification({
        message: `You've claimed a new ${selectedDigimon.name}! Check your Digimon collection.`,
        type: "success",
      });

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error claiming Digimon:", error);
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  checkCanClaimDigimon: () => {
    const { dailyQuotaStreak, tasksCompletedCount } = get();
    return (
      dailyQuotaStreak >= DAILY_QUOTA_MILESTONE ||
      tasksCompletedCount >= TASKS_COMPLETED_MILESTONE
    );
  },
}));
