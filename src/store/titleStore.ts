import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Title, TITLES } from "../constants/titles";
import { useNotificationStore } from "./notificationStore";
import { useAuthStore } from "./authStore";
import { useDigimonStore } from "./petStore";

export interface UserTitle {
  id: number;
  title_id: number;
  is_displayed: boolean;
  earned_at: string;
  claimed_at?: string | null;
  title?: Title;
}

interface TitleState {
  availableTitles: Title[];
  userTitles: UserTitle[];
  loading: boolean;
  error: string | null;

  // Getters
  unclaimedCount: () => number;

  // Fetch
  fetchUserTitles: () => Promise<void>;

  // Achievement checks (mark as earned but unclaimed)
  checkForNewTitles: () => Promise<void>;
  checkCampaignTitles: (stageCleared: number) => Promise<void>;
  checkCollectionTitles: (digimonCount: number) => Promise<void>;
  checkBattleTitles: (battleWins: number) => Promise<void>;
  checkEvolutionTitles: (digimonStage: string) => Promise<void>;
  checkStreakTitles: (longestStreak: number) => Promise<void>;
  checkTaskAchievements: (lifetimeCount: number) => Promise<void>;

  // Claim
  claimAchievement: (userTitleId: number, chosenDigimonId?: number) => Promise<boolean>;

  // Display management
  updateDisplayedTitle: (titleId: number, isDisplayed: boolean) => Promise<boolean>;
}

// Helper: insert newly earned titles as unclaimed (claimed_at = null)
async function awardNewTitles(
  titlesToAdd: Title[],
  userId: string
): Promise<void> {
  if (titlesToAdd.length === 0) return;

  // Double-check DB for any already existing to avoid duplicates
  const { data: existing } = await supabase
    .from("user_titles")
    .select("title_id")
    .eq("user_id", userId)
    .in("title_id", titlesToAdd.map((t) => t.id));

  const existingIds = existing?.map((t) => t.title_id) ?? [];
  const newOnes = titlesToAdd.filter((t) => !existingIds.includes(t.id));
  if (newOnes.length === 0) return;

  const rows = newOnes.map((title) => ({
    title_id: title.id,
    user_id: userId,
    claimed_at: null, // unclaimed until user visits Achievements page
  }));

  const { error } = await supabase.from("user_titles").insert(rows);
  if (error) throw error;

  // Notify with a single consolidated message
  const names = newOnes.map((t) => t.name).join(", ");
  useNotificationStore.getState().addNotification({
    message: `Achievement${newOnes.length > 1 ? "s" : ""} unlocked: ${names}! Visit Achievements to claim your rewards.`,
    type: "success",
  });
}

export const useTitleStore = create<TitleState>((set, get) => ({
  availableTitles: TITLES,
  userTitles: [],
  loading: false,
  error: null,

  unclaimedCount: () =>
    get().userTitles.filter((t) => t.claimed_at === null).length,

  fetchUserTitles: async () => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data: userTitlesData, error } = await supabase
        .from("user_titles")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      const enrichedTitles = userTitlesData.map((userTitle) => ({
        ...userTitle,
        title: TITLES.find((t) => t.id === userTitle.title_id),
      }));

      set({ userTitles: enrichedTitles, loading: false });
    } catch (error) {
      console.error("Error fetching user titles:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load titles",
        loading: false,
      });
    }
  },

  checkForNewTitles: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("highest_stage_cleared, battles_won")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { count: digimonCount, error: digimonError } = await supabase
        .from("user_discovered_digimon")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (digimonError) throw digimonError;

      await get().checkCampaignTitles(profileData.highest_stage_cleared);
      await get().checkCollectionTitles(digimonCount || 0);
      await get().checkBattleTitles(profileData.battles_won);

      // Check task achievements
      const { data: milestoneData } = await supabase
        .from("user_milestones")
        .select("tasks_completed_count")
        .eq("user_id", user.id)
        .single();

      if (milestoneData) {
        await get().checkTaskAchievements(milestoneData.tasks_completed_count ?? 0);
      }

      await get().fetchUserTitles();
    } catch (error) {
      console.error("Error checking for new titles:", error);
    }
  },

  checkCampaignTitles: async (stageCleared: number) => {
    try {
      const { userTitles, availableTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);
      const { user } = useAuthStore.getState();
      if (!user) return;

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "campaign" &&
          Number(title.requirement_value) <= stageCleared &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
    } catch (error) {
      console.error("Error checking campaign titles:", error);
    }
  },

  checkCollectionTitles: async (digimonCount: number) => {
    try {
      const { userTitles, availableTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);
      const { user } = useAuthStore.getState();
      if (!user) return;

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "collection" &&
          Number(title.requirement_value) <= digimonCount &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
    } catch (error) {
      console.error("Error checking collection titles:", error);
    }
  },

  checkBattleTitles: async (battleWins: number) => {
    try {
      const { userTitles, availableTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);
      const { user } = useAuthStore.getState();
      if (!user) return;

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "battle" &&
          Number(title.requirement_value) <= battleWins &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
    } catch (error) {
      console.error("Error checking battle titles:", error);
    }
  },

  checkEvolutionTitles: async (digimonStage: string) => {
    try {
      const { userTitles, availableTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);
      const { user } = useAuthStore.getState();
      if (!user) return;

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "evolution" &&
          title.requirement_type === "digimon_stage" &&
          title.requirement_value === digimonStage &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
      await get().fetchUserTitles();
    } catch (error) {
      console.error("Error checking evolution titles:", error);
    }
  },

  checkStreakTitles: async (longestStreak: number) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { availableTitles, userTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "streak" &&
          title.requirement_type === "longest_streak" &&
          Number(title.requirement_value) <= longestStreak &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
      await get().fetchUserTitles();
    } catch (error) {
      console.error("Error checking streak titles:", error);
    }
  },

  checkTaskAchievements: async (lifetimeCount: number) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { availableTitles, userTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);

      const eligible = availableTitles.filter(
        (title) =>
          title.category === "tasks" &&
          title.requirement_type === "tasks_completed" &&
          Number(title.requirement_value) <= lifetimeCount &&
          !earnedTitleIds.includes(title.id)
      );

      await awardNewTitles(eligible, user.id);
      if (eligible.length > 0) await get().fetchUserTitles();
    } catch (error) {
      console.error("Error checking task achievements:", error);
    }
  },

  claimAchievement: async (userTitleId: number, chosenDigimonId?: number) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      // Find the user title entry
      const userTitle = get().userTitles.find((ut) => ut.id === userTitleId);
      if (!userTitle) return false;
      if (userTitle.claimed_at) return false; // already claimed

      const title = userTitle.title;

      // 1. Mark as claimed
      const { error: claimError } = await supabase
        .from("user_titles")
        .update({ claimed_at: new Date().toISOString() })
        .eq("id", userTitleId);

      if (claimError) throw claimError;

      // 2. Grant bits reward
      if (title?.rewards?.bits) {
        const { error: bitsError } = await supabase.rpc("grant_bits_self", {
          p_amount: title.rewards.bits,
        });
        // Non-fatal: log but don't throw (RPC may not exist yet)
        if (bitsError) {
          console.warn("grant_bits_self failed, falling back to direct update:", bitsError);
          // Fallback: direct update
          await supabase.rpc("grant_energy_self", { p_amount: 0 }); // no-op to check connection
          const { data: currencyData } = await supabase
            .from("user_currency")
            .select("bits")
            .eq("user_id", user.id)
            .single();
          if (currencyData) {
            await supabase
              .from("user_currency")
              .update({ bits: currencyData.bits + title.rewards.bits })
              .eq("user_id", user.id);
          }
        }
        window.dispatchEvent(new Event("currency-updated"));
      }

      // 3. Grant DigiEgg (add chosen Digimon to party/storage)
      if (chosenDigimonId) {
        const { data: partyData } = await supabase
          .from("user_digimon")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("is_in_storage", false);

        const partyCount = partyData?.length ?? 0;
        const goesToStorage = partyCount >= 9;

        const { error: digimonError } = await supabase
          .from("user_digimon")
          .insert({
            user_id: user.id,
            digimon_id: chosenDigimonId,
            name: "",
            happiness: 100,
            experience_points: 0,
            current_level: 1,
            is_active: false,
            is_in_storage: goesToStorage,
          });

        if (digimonError) throw digimonError;

        useDigimonStore.getState().addDiscoveredDigimon(chosenDigimonId);
        await useDigimonStore.getState().fetchAllUserDigimon();
        await useDigimonStore.getState().fetchStorageDigimon();

        useNotificationStore.getState().addNotification({
          message: goesToStorage
            ? "Your new Digimon was sent to DigiFarm storage — your party is full!"
            : "Your new Digimon joined your party!",
          type: "success",
        });
      }

      // 4. Refresh local state
      await get().fetchUserTitles();

      return true;
    } catch (error) {
      console.error("Error claiming achievement:", error);
      return false;
    }
  },

  updateDisplayedTitle: async (titleId: number, isDisplayed: boolean) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      const { userTitles } = get();

      if (isDisplayed) {
        const displayedTitles = userTitles
          .filter((title) => title.is_displayed)
          .sort(
            (a, b) =>
              new Date(a.earned_at).getTime() - new Date(b.earned_at).getTime()
          );

        if (displayedTitles.length >= 3) {
          const oldestTitle = displayedTitles[0];
          await supabase
            .from("user_titles")
            .update({ is_displayed: false })
            .eq("id", oldestTitle.id);
        }
      }

      const { error } = await supabase
        .from("user_titles")
        .update({ is_displayed: isDisplayed })
        .eq("id", titleId);

      if (error) throw error;

      await get().fetchUserTitles();
      return true;
    } catch (error) {
      console.error("Error updating displayed title:", error);
      return false;
    }
  },
}));
