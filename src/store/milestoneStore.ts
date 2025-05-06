import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { useNotificationStore } from "./notificationStore";

export const ABI_MILESTONES = [5, 10, 25, 40, 60, 85, 115, 150, 200, 240, 300];

export function getABIThreshold() {
  const teamSize = useDigimonStore.getState().allUserDigimon.length;
  return ABI_MILESTONES[teamSize - 1] || 999;
}

export function getABITotal() {
  const allUserDigimon = useDigimonStore.getState().allUserDigimon;
  return allUserDigimon.reduce((acc, digimon) => acc + digimon.abi, 0);
}

interface MilestoneState {
  lastDigimonClaimedAt: string | null;
  loading: boolean;
  error: string | null;
  canClaimDigimon: boolean;

  // Methods
  fetchMilestones: () => Promise<void>;
  claimSelectedDigimon: (digimonId: number) => Promise<boolean>;
  checkCanClaimDigimon: () => boolean;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  lastDigimonClaimedAt: null,
  loading: false,
  error: null,
  canClaimDigimon: false,

  fetchMilestones: async () => {
    try {
      set({ loading: true, error: null });
      set({
        loading: false,
        canClaimDigimon: get().checkCanClaimDigimon(),
      });
    } catch (error) {
      console.error("Error fetching milestones:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  claimSelectedDigimon: async (digimonId: number) => {
    try {
      set({ loading: true, error: null });

      // Check if user can claim a Digimon
      if (!get().checkCanClaimDigimon()) {
        set({
          loading: false,
          error:
            "You haven't reached the ABI threshold to claim a Digimon yet.",
        });
        return false;
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false, error: "User not authenticated." });
        return false;
      }

      // Check if user already has max Digimon
      const { data: userDigimonCount } = await supabase
        .from("user_digimon")
        .select("count")
        .eq("user_id", userData.user.id);

      if (userDigimonCount && userDigimonCount[0]?.count >= 12) {
        set({
          loading: false,
          error: "You already have the maximum number of Digimon (12).",
        });
        return false;
      }

      // Create the new Digimon
      const { error: createError } = await supabase
        .from("user_digimon")
        .insert({
          user_id: userData.user.id,
          digimon_id: digimonId,
          name: "",
          happiness: 100,
          experience_points: 0,
          current_level: 1,
          is_active: false,
        });

      if (createError) throw createError;

      // Refresh the user's Digimon list
      await useDigimonStore.getState().fetchAllUserDigimon();

      // Show success notification
      useNotificationStore.getState().addNotification({
        message: `You've claimed a new Digimon! Check your collection.`,
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
    return getABITotal() >= getABIThreshold();
  },
}));
