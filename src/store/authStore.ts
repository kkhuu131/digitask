import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  checkAdminStatus: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isAdmin: false,

  signUp: async (email, password, username) => {
    try {
      set({ loading: true, error: null });

      // Validate inputs before making API calls
      if (!email || !password || !username) {
        throw new Error("Email, password, and username are required");
      }

      // Check if username is available
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);

      if (checkError) {
        console.error("Error checking username availability:", checkError);
        throw new Error(
          "Unable to verify username availability. Please try again."
        );
      }

      // Only check for duplicates if the query was successful
      if (existingUsers && existingUsers.length > 0) {
        throw new Error("Username is already taken");
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create the user profile with the provided username
        await createProfile(data.user.id, username);

        set({
          user: data.user,
          userProfile: {
            id: data.user.id,
            username: username,
            display_name: username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({
        error:
          (error as Error).message ||
          "An unknown error occurred during sign up",
        loading: false,
      });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        loading: false,
      });

      // Fetch user profile after sign in
      await get().fetchUserProfile();

      // Check admin status after sign in
      await get().checkAdminStatus();
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
      set({ user: null, userProfile: null, loading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  checkSession: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        set({ user: data.session.user });

        // Fetch user profile
        await get().fetchUserProfile();

        // Check admin status
        await get().checkAdminStatus();
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error checking session:", error);
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ loading: true, error: null });

      const { user, userProfile } = useAuthStore.getState();

      if (!user || !userProfile) {
        throw new Error("You must be logged in to update your profile");
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      set({
        userProfile: updatedProfile || null,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  checkAdminStatus: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ isAdmin: false });
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");

      if (error) {
        console.error("Error checking admin status:", error);
        set({ isAdmin: false });
        return;
      }

      set({ isAdmin: !!data });
    } catch (error) {
      console.error("Error checking admin status:", error);
      set({ isAdmin: false });
    }
  },

  fetchUserProfile: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error("User not logged in");
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      set({
        userProfile: profile || null,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },
}));

// Add this function to create a profile after signup
const createProfile = async (userId: string, username: string) => {
  try {
    const { error } = await supabase.from("profiles").insert([
      {
        id: userId,
        username,
        display_name: username,
        saved_stats: { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 },
        daily_stat_gains: 0,
        last_stat_reset: new Date().toISOString(),
        battles_won: 0,
        battles_completed: 0,
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating profile:", error);
    return false;
  }
};
