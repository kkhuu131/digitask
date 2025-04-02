import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface UserDigimon {
  id: string;
  user_id: string;
  digimon_id: number;
  name: string;
  current_level: number;
  experience_points: number;
  health: number;
  happiness: number;
  created_at: string;
  last_updated_at: string;
  last_fed_tasks_at: string;
}

export interface Digimon {
  id: number;
  digimon_id: number;
  name: string;
  stage: string;
  sprite_url: string;
  hp: number;
  sp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
}

export interface EvolutionOption {
  id: number;
  digimon_id: number;
  name: string;
  stage: string;
  sprite_url: string;
  level_required: number;
}

export interface DigimonState {
  userDigimon: UserDigimon | null;
  digimonData: Digimon | null;
  evolutionOptions: EvolutionOption[];
  discoveredDigimon: number[]; // Array of digimon_id values the user has discovered
  loading: boolean;
  error: string | null;
  fetchUserDigimon: () => Promise<void>;
  createUserDigimon: (name: string, digimonId: number) => Promise<void>;
  updateDigimonStats: (stats: Partial<UserDigimon>) => Promise<void>;
  feedDigimon: (taskPoints: number) => Promise<void>;
  checkEvolution: () => Promise<boolean>;
  evolveDigimon: (toDigimonId: number) => Promise<void>;
  getStarterDigimon: () => Promise<Digimon[]>;
  fetchDiscoveredDigimon: () => Promise<void>;
  addDiscoveredDigimon: (digimonId: number) => Promise<void>;
  subscribeToDigimonUpdates: () => RealtimeChannel | undefined;
}

export const useDigimonStore = create<DigimonState>((set, get) => ({
  userDigimon: null,
  digimonData: null,
  evolutionOptions: [],
  discoveredDigimon: [],
  loading: false,
  error: null,

  fetchDiscoveredDigimon: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("user_discovered_digimon")
        .select("digimon_id")
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Extract just the digimon_id values into an array
      const discoveredIds = data.map((item) => item.digimon_id);
      set({ discoveredDigimon: discoveredIds });
    } catch (error) {
      console.error("Error fetching discovered Digimon:", error);
    }
  },

  addDiscoveredDigimon: async (digimonId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Check if already discovered to avoid unique constraint errors
      const { discoveredDigimon } = get();
      if (discoveredDigimon.includes(digimonId)) return;

      // Add to discovered list
      const { error } = await supabase.from("user_discovered_digimon").insert({
        user_id: userData.user.id,
        digimon_id: digimonId,
      });

      if (error) throw error;

      // Update local state
      set({ discoveredDigimon: [...discoveredDigimon, digimonId] });
    } catch (error) {
      console.error("Error adding discovered Digimon:", error);
    }
  },

  fetchUserDigimon: async () => {
    try {
      set({ loading: true, error: null });

      // Get the user's Digimon
      const { data: userDigimonList, error: userDigimonError } = await supabase
        .from("user_digimon")
        .select("*");

      if (userDigimonError) throw userDigimonError;

      // If user has no Digimon, return early
      if (!userDigimonList || userDigimonList.length === 0) {
        set({
          userDigimon: null,
          digimonData: null,
          evolutionOptions: [],
          loading: false,
        });
        return;
      }

      // Use the first Digimon in the list
      const userDigimon = userDigimonList[0];

      // Get the Digimon data
      const { data: digimonData, error: digimonError } = await supabase
        .from("digimon")
        .select("*")
        .eq("id", userDigimon.digimon_id)
        .single();

      if (digimonError) throw digimonError;

      // Fetch discovered Digimon
      await get().fetchDiscoveredDigimon();

      // Mark current Digimon as discovered if not already
      await get().addDiscoveredDigimon(userDigimon.digimon_id);

      // Get evolution options
      const { data: evolutionPaths, error: evolutionError } = await supabase
        .from("evolution_paths")
        .select(
          `
          id,
          to_digimon_id,
          level_required,
          digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url)
        `
        )
        .eq("from_digimon_id", userDigimon.digimon_id);

      if (evolutionError) throw evolutionError;

      const evolutionOptions = evolutionPaths.map((path) => ({
        id: path.id,
        digimon_id: (path.digimon as any).id,
        name: (path.digimon as any).name,
        stage: (path.digimon as any).stage,
        sprite_url: (path.digimon as any).sprite_url,
        level_required: path.level_required,
      }));

      set({
        userDigimon,
        digimonData,
        evolutionOptions,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user Digimon:", error);
      set({
        error: (error as Error).message,
        loading: false,
        userDigimon: null,
        digimonData: null,
        evolutionOptions: [],
      });
    }
  },

  createUserDigimon: async (name: string, digimonId: number) => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Check if user already has a Digimon
      const { data: existingDigimon } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", userData.user.id);

      if (existingDigimon && existingDigimon.length > 0) {
        throw new Error("You already have a Digimon");
      }

      // Create a new Digimon for the user
      const { error } = await supabase.from("user_digimon").insert({
        user_id: userData.user.id,
        digimon_id: digimonId,
        name: name || "Unnamed Digimon", // Use provided name or default
        current_level: 1,
        experience_points: 0,
        health: 100,
        happiness: 100,
      });

      if (error) throw error;

      // Mark the starter Digimon as discovered
      await get().addDiscoveredDigimon(digimonId);

      // Fetch the complete Digimon data
      await get().fetchUserDigimon();
      set({ loading: false });
    } catch (error) {
      console.error("Error creating Digimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateDigimonStats: async (updates) => {
    try {
      set({ loading: true, error: null });

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_digimon")
        .update(updates)
        .eq("user_id", user.user.id)
        .select()
        .single();

      if (error) throw error;

      // Fix the type issue by ensuring userDigimon is not null
      set((state) => {
        if (!state.userDigimon) return { ...state, loading: false };

        return {
          ...state,
          userDigimon: {
            ...state.userDigimon,
            ...updates,
          },
          loading: false,
        };
      });

      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  feedDigimon: async (taskPoints) => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) throw new Error("No Digimon found");

      // Calculate new stats
      const newHealth = Math.min(100, userDigimon.health + taskPoints * 5);
      const newHappiness = Math.min(
        100,
        userDigimon.happiness + taskPoints * 5
      );
      const newExperiencePoints =
        userDigimon.experience_points + taskPoints * 10;

      // Level up if enough experience
      let newLevel = userDigimon.current_level;
      const expNeeded = newLevel * 20; // Simple formula: level * 20 exp needed to level up

      if (newExperiencePoints >= expNeeded) {
        newLevel += 1;
      }

      await get().updateDigimonStats({
        health: newHealth,
        happiness: newHappiness,
        experience_points: newExperiencePoints,
        current_level: newLevel,
        last_fed_tasks_at: new Date().toISOString(),
      });

      // Check if Digimon can evolve after leveling up
      if (newLevel > userDigimon.current_level) {
        await get().checkEvolution();
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  checkEvolution: async (): Promise<boolean> => {
    try {
      const { userDigimon, evolutionOptions } = get();
      if (!userDigimon) return false;

      // Check if any evolution options are available based on level
      const availableEvolutions = evolutionOptions.filter(
        (option) => userDigimon.current_level >= option.level_required
      );

      if (availableEvolutions.length > 0) {
        // Sort by level_required to find the earliest evolution
        const sortedEvolutions = [...availableEvolutions].sort(
          (a, b) => a.level_required - b.level_required
        );

        // Get the earliest evolution (or first one if multiple at same level)
        const earliestEvolution = sortedEvolutions[0];

        // Automatically evolve to the earliest evolution
        await get().evolveDigimon(earliestEvolution.digimon_id);

        // Return true if evolution occurred
        return true;
      }

      // Return false if no evolution occurred
      return false;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  evolveDigimon: async (toDigimonId) => {
    try {
      const { userDigimon, evolutionOptions } = get();
      if (!userDigimon) throw new Error("No Digimon found");

      // Find the evolution option for the target Digimon
      const evolutionOption = evolutionOptions.find(
        (option) => option.digimon_id === toDigimonId
      );

      // Check if the evolution option exists and if the user's Digimon meets the level requirement
      if (!evolutionOption) {
        throw new Error("Invalid evolution target");
      }

      if (userDigimon.current_level < evolutionOption.level_required) {
        throw new Error(
          `Your Digimon needs to be at least level ${evolutionOption.level_required} to evolve to ${evolutionOption.name}`
        );
      }

      set({ loading: true, error: null });

      // Update the user's Digimon
      const { error } = await supabase
        .from("user_digimon")
        .update({
          digimon_id: toDigimonId,
          // Reset experience points after evolving
          experience_points: 0,
          last_updated_at: new Date().toISOString(),
        })
        .eq("id", userDigimon.id);

      if (error) throw error;

      // Mark the new evolution as discovered
      await get().addDiscoveredDigimon(toDigimonId);

      // Fetch the updated Digimon data and evolution options
      await get().fetchUserDigimon();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getStarterDigimon: async () => {
    try {
      set({ loading: true, error: null });

      // Get Baby stage Digimon as starters
      const { data: starterDigimon, error } = await supabase
        .from("digimon")
        .select("*")
        .eq("stage", "Baby");

      if (error) throw error;
      set({ loading: false });

      return starterDigimon || [];
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return [];
    }
  },

  subscribeToDigimonUpdates: () => {
    const { user } = useAuthStore.getState();
    if (!user) return undefined;

    const subscription = supabase
      .channel("digimon-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_digimon",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Fix the type issue by ensuring userDigimon is not null
          set((state) => {
            if (!state.userDigimon) return state;

            return {
              ...state,
              userDigimon: {
                ...state.userDigimon,
                ...payload.new,
              },
            };
          });
        }
      )
      .subscribe();

    return subscription;
  },
}));
