import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { useNotificationStore } from "./notificationStore";

export const ABI_MILESTONES = [2, 5, 10, 15, 20, 30, 50, 75, 100, 150, 200];

export function getABIThreshold() {
  const partyCount = useDigimonStore.getState().allUserDigimon.length;
  const storageCount = useDigimonStore.getState().storageDigimon.length;
  const teamSizeRaw = partyCount + storageCount;
  // Ensure minimum index of 0 for thresholds (first milestone) when data not yet loaded
  const teamSize = Math.max(1, teamSizeRaw);
  return ABI_MILESTONES[teamSize - 1] || 200 + (teamSize - 11) * 50;
}

export function getABITotal() {
  const allUserDigimon = useDigimonStore.getState().allUserDigimon;
  const storageDigimon = useDigimonStore.getState().storageDigimon;
  return (
    allUserDigimon.reduce((acc, digimon) => acc + digimon.abi, 0) +
    storageDigimon.reduce((acc, digimon) => acc + digimon.abi, 0)
  );
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
      // Ensure digimon lists are loaded before computing thresholds
      try {
        await useDigimonStore.getState().fetchAllUserDigimon();
        await useDigimonStore.getState().fetchStorageDigimon();
      } catch (e) {
        // Non-fatal: proceed with whatever is loaded
      }
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

      // Get active party count to decide storage placement
      const { data: userDigimonCount } = await supabase
        .from("user_digimon")
        .select("count")
        .eq("is_in_storage", false)
        .eq("user_id", userData.user.id);
      const partyCount = userDigimonCount?.[0]?.count ?? 0;
      const goesToStorage = partyCount >= 9;

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
          is_in_storage: goesToStorage,
        });

      useDigimonStore.getState().addDiscoveredDigimon(digimonId);

      if (createError) throw createError;

      // Refresh the user's Digimon lists
      await useDigimonStore.getState().fetchAllUserDigimon();
      await useDigimonStore.getState().fetchStorageDigimon();

      // Show success notification
      useNotificationStore.getState().addNotification({
        message: goesToStorage
          ? `You've claimed a new Digimon! Your party is full, so it was sent to DigiFarm storage.`
          : `You've claimed a new Digimon!`,
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
