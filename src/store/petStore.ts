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
  createUserDigimon: (name: string | null, digimonId: number) => Promise<void>;
  updateDigimonStats: (stats: Partial<UserDigimon>) => Promise<void>;
  feedDigimon: (taskPoints: number) => Promise<void>;
  checkEvolution: () => Promise<boolean>;
  evolveDigimon: (toDigimonId: number) => Promise<void>;
  getStarterDigimon: () => Promise<Digimon[]>;
  fetchDiscoveredDigimon: () => Promise<void>;
  addDiscoveredDigimon: (digimonId: number) => Promise<void>;
  subscribeToDigimonUpdates: () => RealtimeChannel | undefined;
  checkDigimonHealth: () => Promise<void>;
  checkLevelUp: () => Promise<boolean | undefined>;
  getDigimonDisplayName: () => string;
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

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({
          userDigimon: null,
          digimonData: null,
          evolutionOptions: [],
          loading: false,
        });
        return;
      }

      console.log("Fetching Digimon for user:", userData.user.id);

      // Get the user's Digimon
      const { data: userDigimonList, error: userDigimonError } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", userData.user.id);

      if (userDigimonError) throw userDigimonError;

      console.log("User Digimon data:", userDigimonList);

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

      console.log("Setting user Digimon data:", userDigimon.name);

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

  createUserDigimon: async (name: string | null, digimonId: number) => {
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
        name: name,
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

  feedDigimon: async (taskPoints: number) => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return;

      console.log(`Feeding Digimon with ${taskPoints} points`);

      // Calculate happiness and health gains
      const happinessGain = Math.min(taskPoints / 2, 10); // Cap happiness gain at 10
      const healthGain = Math.min(taskPoints / 3, 5); // Cap health gain at 5

      // Calculate new stats
      const newHappiness = Math.min(100, userDigimon.happiness + happinessGain);
      const newHealth = Math.min(100, userDigimon.health + healthGain);
      const newXP = userDigimon.experience_points + taskPoints;

      console.log(
        `Current XP: ${userDigimon.experience_points}, New XP: ${newXP}`
      );

      // Update Digimon stats
      await supabase
        .from("user_digimon")
        .update({
          happiness: newHappiness,
          health: newHealth,
          experience_points: newXP,
          last_fed_tasks_at: new Date().toISOString(),
        })
        .eq("id", userDigimon.id);

      // Update local state
      set({
        userDigimon: {
          ...userDigimon,
          happiness: newHappiness,
          health: newHealth,
          experience_points: newXP,
          last_fed_tasks_at: new Date().toISOString(),
        },
      });

      // Check for level up after gaining XP
      await get().checkLevelUp();
    } catch (error) {
      console.error("Error feeding Digimon:", error);
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

  evolveDigimon: async (toDigimonId: number) => {
    try {
      set({ loading: true, error: null });

      const { userDigimon } = get();
      if (!userDigimon) throw new Error("No Digimon found");

      // Update the Digimon's species while preserving the custom name (if any)
      const { error } = await supabase
        .from("user_digimon")
        .update({
          digimon_id: toDigimonId,
          // Don't update the name field - keep it as is (null or custom)
        })
        .eq("id", userDigimon.id);

      if (error) throw error;

      // Add the new Digimon to discovered list
      await get().addDiscoveredDigimon(toDigimonId);

      // Refresh Digimon data
      await get().fetchUserDigimon();

      set({ loading: false });
    } catch (error) {
      console.error("Error evolving Digimon:", error);
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

  checkDigimonHealth: async () => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) {
        console.log("No Digimon to check health for");
        return;
      }

      console.log(
        "Checking Digimon health:",
        userDigimon.health,
        "for Digimon ID:",
        userDigimon.id
      );

      // If health is 0 or less, the Digimon should die
      if (userDigimon.health <= 0) {
        console.log("Digimon health is 0 or below, triggering death");

        // Delete the current Digimon
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          console.log("User not authenticated, can't delete Digimon");
          throw new Error("User not authenticated");
        }

        console.log(
          "Attempting to delete Digimon with ID:",
          userDigimon.id,
          "for user:",
          user.user.id
        );

        // First, delete all battles that reference this Digimon
        console.log("Deleting battles that reference this Digimon...");

        // Delete battles where this Digimon is the user's Digimon
        const { error: userBattlesError } = await supabase
          .from("battles")
          .delete()
          .eq("user_digimon_id", userDigimon.id);

        if (userBattlesError) {
          console.error("Error deleting user battles:", userBattlesError);
          throw userBattlesError;
        }

        // Delete battles where this Digimon is the opponent's Digimon
        const { error: opponentBattlesError } = await supabase
          .from("battles")
          .delete()
          .eq("opponent_digimon_id", userDigimon.id);

        if (opponentBattlesError) {
          console.error(
            "Error deleting opponent battles:",
            opponentBattlesError
          );
          throw opponentBattlesError;
        }

        console.log(
          "Successfully deleted all battles referencing this Digimon"
        );

        // Now try to delete the Digimon
        const { error: deleteError, data: deleteData } = await supabase
          .from("user_digimon")
          .delete()
          .eq("id", userDigimon.id)
          .select();

        if (deleteError) {
          console.error("Error deleting Digimon:", deleteError);
          throw deleteError;
        }

        console.log("Digimon deleted successfully, response:", deleteData);

        // Reset the store state
        set({
          userDigimon: null,
          digimonData: null,
          evolutionOptions: [],
          error:
            "Your Digimon has died due to neglect. You'll need to start with a new one.",
        });

        console.log("Store state reset after Digimon death");

        // Force a page refresh to ensure the UI updates
        window.location.href = "/";

        return;
      } else {
        console.log("Digimon health is above 0, it's still alive");
      }

      // If we get here, the Digimon is still alive, so we don't need to do anything
    } catch (error) {
      console.error("Error checking Digimon health:", error);
      set({ error: (error as Error).message });
    }
  },

  checkLevelUp: async () => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return;

      console.log("Checking for level up...");
      console.log(
        `Current level: ${userDigimon.current_level}, XP: ${userDigimon.experience_points}`
      );

      // Calculate XP needed for next level (20 base + 10 per level)
      const xpNeeded = 20 + (userDigimon.current_level - 1) * 10;
      console.log(`XP needed for next level: ${xpNeeded}`);

      // Check if Digimon has enough XP to level up
      if (userDigimon.experience_points >= xpNeeded) {
        console.log(
          `Digimon leveling up! Current XP: ${userDigimon.experience_points}, Needed: ${xpNeeded}`
        );

        // Calculate new level and remaining XP
        const newLevel = userDigimon.current_level + 1;
        const remainingXP = userDigimon.experience_points - xpNeeded;
        console.log(`New level: ${newLevel}, Remaining XP: ${remainingXP}`);

        // Update Digimon stats
        const { error } = await supabase
          .from("user_digimon")
          .update({
            current_level: newLevel,
            experience_points: remainingXP,
          })
          .eq("id", userDigimon.id);

        if (error) {
          console.error("Error updating level:", error);
          throw error;
        }

        console.log("Level up successful!");

        // Update local state
        set({
          userDigimon: {
            ...userDigimon,
            current_level: newLevel,
            experience_points: remainingXP,
          },
        });

        // Check if there's enough XP for another level up
        if (remainingXP > 0) {
          console.log("Checking for additional level ups with remaining XP...");
          await get().checkLevelUp();
        }

        // Check if Digimon can digivolve at this level
        await get().checkEvolution();

        return true;
      } else {
        console.log("Not enough XP for level up");
        return false;
      }
    } catch (error) {
      console.error("Error checking level up:", error);
      return false;
    }
  },

  getDigimonDisplayName: () => {
    const { userDigimon, digimonData } = get();
    if (!userDigimon || !digimonData) return "Unknownmon";

    if (userDigimon.name != "") return userDigimon.name;

    // Otherwise, use the species name
    return digimonData.name;
  },
}));
