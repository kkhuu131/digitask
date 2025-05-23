import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./authStore";

interface OnboardingState {
  hasCompletedOnboarding: boolean | null;
  isCheckingStatus: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  markOnboardingComplete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasCompletedOnboarding: null,
  isCheckingStatus: false,

  checkOnboardingStatus: async () => {
    try {
      if (get().isCheckingStatus) {
        return get().hasCompletedOnboarding || false;
      }

      set({ isCheckingStatus: true });

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        set({ hasCompletedOnboarding: null, isCheckingStatus: false });
        return false;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking onboarding status:", error);
        set({ isCheckingStatus: false });
        return false;
      }

      const completed = !!profileData?.has_completed_onboarding;

      set({
        hasCompletedOnboarding: completed,
        isCheckingStatus: false,
      });

      return completed;
    } catch (error) {
      console.error("Error in checkOnboardingStatus:", error);
      set({ isCheckingStatus: false });
      return false;
    }
  },

  markOnboardingComplete: async () => {
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return;

      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", userId);

      if (error) {
        console.error("Error updating onboarding status:", error);
        return;
      }

      set({ hasCompletedOnboarding: true });
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
    }
  },
}));
