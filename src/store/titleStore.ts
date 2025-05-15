import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Title, TITLES } from "../constants/titles";
import { useNotificationStore } from "./notificationStore";
import { useAuthStore } from "./authStore";

export interface UserTitle {
  id: number;
  title_id: number;
  is_displayed: boolean;
  earned_at: string;
  title?: Title;
}

interface TitleState {
  availableTitles: Title[];
  userTitles: UserTitle[];
  loading: boolean;
  error: string | null;

  fetchUserTitles: () => Promise<void>;
  checkForNewTitles: () => Promise<void>;
  checkCampaignTitles: (stageCleared: number) => Promise<void>;
  checkCollectionTitles: (digimonCount: number) => Promise<void>;
  checkBattleTitles: (battleWins: number) => Promise<void>;
  checkEvolutionTitles: (digimonStage: string) => Promise<void>;
  updateDisplayedTitle: (
    titleId: number,
    isDisplayed: boolean
  ) => Promise<boolean>;
}

export const useTitleStore = create<TitleState>((set, get) => ({
  availableTitles: TITLES,
  userTitles: [],
  loading: false,
  error: null,

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

      // Enrich with title details
      const enrichedTitles = userTitlesData.map((userTitle) => ({
        ...userTitle,
        title: TITLES.find((t) => t.id === userTitle.title_id),
      }));

      set({
        userTitles: enrichedTitles,
        loading: false,
      });
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

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("highest_stage_cleared, battles_won")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get discovered digimon count
      const { count: digimonCount, error: digimonError } = await supabase
        .from("user_discovered_digimon")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (digimonError) throw digimonError;

      // Check for new titles
      await get().checkCampaignTitles(profileData.highest_stage_cleared);
      await get().checkCollectionTitles(digimonCount || 0);
      await get().checkBattleTitles(profileData.battles_won);

      // Refresh titles after checks
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

      // Find campaign titles that should be earned
      const campaignTitles = availableTitles.filter(
        (title) =>
          title.category === "campaign" &&
          Number(title.requirement_value) <= stageCleared &&
          !earnedTitleIds.includes(title.id)
      );

      // Award new titles
      if (campaignTitles.length > 0) {
        // First check which titles the user already has to avoid duplicates
        const { data: existingTitles } = await supabase
          .from("user_titles")
          .select("title_id")
          .eq("user_id", user.id)
          .in(
            "title_id",
            campaignTitles.map((t) => t.id)
          );

        // Filter out titles the user already has
        const existingTitleIds = existingTitles?.map((t) => t.title_id) || [];
        const newTitlesToAdd = campaignTitles.filter(
          (title) => !existingTitleIds.includes(title.id)
        );

        if (newTitlesToAdd.length === 0) return; // No new titles to add

        const newTitles = newTitlesToAdd.map((title) => ({
          title_id: title.id,
          user_id: user.id,
        }));

        const { error } = await supabase.from("user_titles").insert(newTitles);

        if (error) throw error;

        // Notify user of new titles
        newTitlesToAdd.forEach((title) => {
          useNotificationStore.getState().addNotification({
            message: `New title earned: ${title.name}`,
            type: "success",
          });
        });
      }
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

      // Find collection titles that should be earned
      const collectionTitles = availableTitles.filter(
        (title) =>
          title.category === "collection" &&
          Number(title.requirement_value) <= digimonCount &&
          !earnedTitleIds.includes(title.id)
      );

      // Award new titles
      if (collectionTitles.length > 0) {
        // First check which titles the user already has to avoid duplicates
        const { data: existingTitles } = await supabase
          .from("user_titles")
          .select("title_id")
          .eq("user_id", user.id)
          .in(
            "title_id",
            collectionTitles.map((t) => t.id)
          );

        // Filter out titles the user already has
        const existingTitleIds = existingTitles?.map((t) => t.title_id) || [];
        const newTitlesToAdd = collectionTitles.filter(
          (title) => !existingTitleIds.includes(title.id)
        );

        if (newTitlesToAdd.length === 0) return; // No new titles to add

        const newTitles = newTitlesToAdd.map((title) => ({
          title_id: title.id,
          user_id: user.id,
        }));

        const { error } = await supabase.from("user_titles").insert(newTitles);

        if (error) throw error;

        // Notify user of new titles
        newTitlesToAdd.forEach((title) => {
          useNotificationStore.getState().addNotification({
            message: `New title earned: ${title.name}`,
            type: "success",
          });
        });
      }
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

      // Find battle titles that should be earned
      const battleTitles = availableTitles.filter(
        (title) =>
          title.category === "battle" &&
          Number(title.requirement_value) <= battleWins &&
          !earnedTitleIds.includes(title.id)
      );

      // Award new titles
      if (battleTitles.length > 0) {
        // First check which titles the user already has to avoid duplicates
        const { data: existingTitles } = await supabase
          .from("user_titles")
          .select("title_id")
          .eq("user_id", user.id)
          .in(
            "title_id",
            battleTitles.map((t) => t.id)
          );

        // Filter out titles the user already has
        const existingTitleIds = existingTitles?.map((t) => t.title_id) || [];
        const newTitlesToAdd = battleTitles.filter(
          (title) => !existingTitleIds.includes(title.id)
        );

        if (newTitlesToAdd.length === 0) return; // No new titles to add

        const newTitles = newTitlesToAdd.map((title) => ({
          title_id: title.id,
          user_id: user.id,
        }));

        const { error } = await supabase.from("user_titles").insert(newTitles);

        if (error) throw error;

        // Notify user of new titles
        newTitlesToAdd.forEach((title) => {
          useNotificationStore.getState().addNotification({
            message: `New title earned: ${title.name}`,
            type: "success",
          });
        });
      }
    } catch (error) {
      console.error("Error checking battle titles:", error);
    }
  },

  checkEvolutionTitles: async (digimonStage: string) => {
    try {
      console.log("digimonStage", digimonStage);
      const { userTitles, availableTitles } = get();
      const earnedTitleIds = userTitles.map((ut) => ut.title_id);
      const { user } = useAuthStore.getState();

      if (!user) return;

      // Find evolution titles that should be earned based on stage
      const evolutionTitles = availableTitles.filter(
        (title) =>
          title.category === "evolution" &&
          title.requirement_type === "digimon_stage" &&
          title.requirement_value === digimonStage &&
          !earnedTitleIds.includes(title.id)
      );

      // Award new titles
      if (evolutionTitles.length > 0) {
        // First check which titles the user already has to avoid duplicates
        const { data: existingTitles } = await supabase
          .from("user_titles")
          .select("title_id")
          .eq("user_id", user.id)
          .in(
            "title_id",
            evolutionTitles.map((t) => t.id)
          );

        // Filter out titles the user already has
        const existingTitleIds = existingTitles?.map((t) => t.title_id) || [];
        const newTitlesToAdd = evolutionTitles.filter(
          (title) => !existingTitleIds.includes(title.id)
        );

        if (newTitlesToAdd.length === 0) return; // No new titles to add

        const newTitles = newTitlesToAdd.map((title) => ({
          title_id: title.id,
          user_id: user.id,
        }));

        const { error } = await supabase.from("user_titles").insert(newTitles);

        if (error) throw error;

        // Notify user of new titles
        newTitlesToAdd.forEach((title) => {
          useNotificationStore.getState().addNotification({
            message: `New title earned: ${title.name}`,
            type: "success",
          });
        });

        // Refresh titles
        await get().fetchUserTitles();
      }
    } catch (error) {
      console.error("Error checking evolution titles:", error);
    }
  },

  updateDisplayedTitle: async (titleId: number, isDisplayed: boolean) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      const { userTitles } = get();

      // If we're setting a new title to displayed and already have 3 displayed titles,
      // we need to un-display the oldest one
      if (isDisplayed) {
        const displayedTitles = userTitles
          .filter((title) => title.is_displayed)
          .sort(
            (a, b) =>
              new Date(a.earned_at).getTime() - new Date(b.earned_at).getTime()
          );

        if (displayedTitles.length >= 3) {
          // Un-display the oldest title
          const oldestTitle = displayedTitles[0];
          await supabase
            .from("user_titles")
            .update({ is_displayed: false })
            .eq("id", oldestTitle.id);
        }
      }

      // Update the selected title
      const { error } = await supabase
        .from("user_titles")
        .update({ is_displayed: isDisplayed })
        .eq("id", titleId);

      if (error) throw error;

      // Refresh titles
      await get().fetchUserTitles();

      return true;
    } catch (error) {
      console.error("Error updating displayed title:", error);
      return false;
    }
  },
}));
