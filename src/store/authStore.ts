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
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  signUp: async (email, password, username) => {
    try {
      set({ loading: true, error: null });

      // Check if username is available
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);

      // Only check for duplicates if the query was successful
      if (!checkError && existingUsers && existingUsers.length > 0) {
        throw new Error("Username is already taken");
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Store the username in user metadata so we can access it later
            username: username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create the user profile with the provided username
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: username, // Use the provided username
          display_name: username, // Use the same for display_name
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

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
        error: (error as Error).message,
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

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        set({
          user: data.user,
          userProfile: profile || null,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
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
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session?.user) {
        // Try to get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        // If no profile exists, create one
        if (profileError && profileError.code === "PGRST116") {
          console.log("No profile found, creating one...");

          // Try to get username from user metadata first
          const userMetadata = data.session.user.user_metadata;
          const username =
            userMetadata?.username ||
            data.session.user.email?.split("@")[0] ||
            `user_${Math.floor(Math.random() * 10000)}`;

          // Create the profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: data.session.user.id,
              username: username,
              display_name: username, // Use the same for display_name
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
          }

          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          set({
            user: data.session.user,
            userProfile: newProfile || null,
            loading: false,
          });
        } else {
          set({
            user: data.session.user,
            userProfile: profile || null,
            loading: false,
          });
        }
      } else {
        set({ user: null, userProfile: null, loading: false });
      }
    } catch (error) {
      console.error("Session check error:", error);
      set({
        error: (error as Error).message,
        loading: false,
        user: null,
        userProfile: null,
      });
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
}));
