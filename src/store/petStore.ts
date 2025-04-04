import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useNotificationStore } from "./notificationStore";

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
  is_active: boolean;
  digimon?: Digimon;
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

export interface PetState {
  userDigimon: UserDigimon | null;
  allUserDigimon: UserDigimon[];
  digimonData: Digimon | null;
  evolutionOptions: EvolutionOption[];
  discoveredDigimon: number[];
  loading: boolean;
  error: string | null;
  fetchUserDigimon: () => Promise<void>;
  fetchAllUserDigimon: () => Promise<void>;
  createUserDigimon: (name: string, digimonId: number) => Promise<void>;
  updateDigimonStats: (updates: Partial<UserDigimon>) => Promise<void>;
  feedDigimon: (taskPoints: number) => Promise<void>;
  checkEvolution: () => Promise<boolean>;
  evolveDigimon: (toDigimonId: number) => Promise<void>;
  getStarterDigimon: () => Promise<Digimon[]>;
  fetchDiscoveredDigimon: () => Promise<void>;
  addDiscoveredDigimon: (digimonId: number) => Promise<void>;
  subscribeToDigimonUpdates: () => Promise<() => void>;
  checkDigimonHealth: () => Promise<void>;
  checkLevelUp: () => Promise<boolean | undefined>;
  getDigimonDisplayName: () => string;
  setActiveDigimon: (digimonId: string) => Promise<void>;
}

export const useDigimonStore = create<PetState>((set, get) => ({
  userDigimon: null,
  allUserDigimon: [],
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
        set({ userDigimon: null, digimonData: null, loading: false });
        return;
      }

      // Fetch the active Digimon for this user
      const { data: userDigimon, error: digimonError } = await supabase
        .from("user_digimon")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .single();

      // If no active Digimon is found or there's an error, handle it gracefully
      if (digimonError || !userDigimon) {
        // Check if we have any Digimon at all
        const { data: anyDigimon, error: anyDigimonError } = await supabase
          .from("user_digimon")
          .select("*")
          .eq("user_id", userData.user.id)
          .limit(1);

        if (anyDigimonError) throw anyDigimonError;

        // If we have at least one Digimon but none is active, set the first one as active
        if (anyDigimon && anyDigimon.length > 0) {
          const { error: updateError } = await supabase
            .from("user_digimon")
            .update({ is_active: true })
            .eq("id", anyDigimon[0].id);

          if (updateError) throw updateError;

          // Retry fetching with the newly activated Digimon
          return await get().fetchUserDigimon();
        }

        // If no Digimon at all, return null values
        set({ userDigimon: null, digimonData: null, loading: false });
        return;
      }

      // Get the Digimon data
      const { data: digimonData, error: digimonDataError } = await supabase
        .from("digimon")
        .select("*")
        .eq("id", userDigimon.digimon_id)
        .single();

      if (digimonDataError) throw digimonDataError;

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
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAllUserDigimon: async () => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ allUserDigimon: [], loading: false });
        return;
      }

      // Fetch all Digimon for this user with their related Digimon data
      const { data: userDigimonList, error: digimonError } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon:digimon_id (*)
        `
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (digimonError) throw digimonError;

      set({
        allUserDigimon: userDigimonList || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching all user Digimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setActiveDigimon: async (digimonId: string) => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Update the selected Digimon to be active
      const { error: updateError } = await supabase
        .from("user_digimon")
        .update({ is_active: true })
        .eq("id", digimonId)
        .eq("user_id", userData.user.id);

      if (updateError) {
        throw updateError;
      }

      // Fetch the updated Digimon data
      await get().fetchUserDigimon();
      await get().fetchAllUserDigimon();

      set({ loading: false });
    } catch (error) {
      console.error("Error setting active Digimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createUserDigimon: async (name: string, digimonId: number) => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ error: "User not authenticated", loading: false });
        return;
      }

      // Count existing Digimon for this user
      const { count, error: countError } = await supabase
        .from("user_digimon")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userData.user.id);

      if (countError) {
        throw countError;
      }

      // Set is_active to true if this is the first Digimon
      const isActive = count === 0;

      // Create the new Digimon
      const { error } = await supabase
        .from("user_digimon")
        .insert({
          user_id: userData.user.id,
          digimon_id: digimonId,
          name: name,
          health: 100,
          happiness: 100,
          experience_points: 0,
          current_level: 1,
          is_active: isActive,
        })
        .select()
        .single();

      if (error) throw error;

      // Mark the starter Digimon as discovered
      await get().addDiscoveredDigimon(digimonId);

      // Fetch the complete Digimon data
      await get().fetchUserDigimon();
      set({ loading: false });
    } catch (error) {
      console.error("Error creating user Digimon:", error);
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
      set({ loading: true, error: null });

      const { userDigimon } = get();
      if (!userDigimon) {
        console.log("No Digimon to feed");
        set({ loading: false });
        return;
      }

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      console.log(`Feeding Digimon with ${taskPoints} points`);

      // Calculate new stats
      const newHealth = Math.ceil(
        Math.min(100, userDigimon.health + taskPoints * 0.5)
      );
      const newHappiness = Math.ceil(
        Math.min(100, userDigimon.happiness + taskPoints * 0.5)
      );
      const newXP = userDigimon.experience_points + taskPoints;

      // Update the Digimon in the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
          health: newHealth,
          happiness: newHappiness,
          experience_points: newXP,
          last_fed_tasks_at: new Date().toISOString(),
        })
        .eq("id", userDigimon.id); // Make sure we're using the ID to identify the record

      if (error) {
        console.error("Error feeding Digimon:", error);
        throw error;
      }

      // Update local state
      set({
        userDigimon: {
          ...userDigimon,
          health: newHealth,
          happiness: newHappiness,
          experience_points: newXP,
          last_fed_tasks_at: new Date().toISOString(),
        },
        loading: false,
      });

      console.log("Digimon fed successfully");
    } catch (error) {
      console.error("Error in feedDigimon:", error);
      set({ error: (error as Error).message, loading: false });
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

  subscribeToDigimonUpdates: async () => {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return () => {}; // Return empty function if no user
    }

    // Subscribe to changes on the user's active Digimon
    const subscription = await supabase
      .channel("user_digimon_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_digimon",
          filter: `user_id=eq.${userData.user.id} AND is_active=eq.true`,
        },
        async (payload) => {
          console.log("Digimon updated:", payload);
          // Refresh the Digimon data
          await get().fetchUserDigimon();
        }
      )
      .subscribe();

    // Return a cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  checkDigimonHealth: async () => {
    try {
      const { userDigimon, digimonData } = get();
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

        // Add a notification about the Digimon's death
        useNotificationStore.getState().addNotification({
          message: `Your Digimon ${
            userDigimon.name || digimonData?.name || "Unknown"
          } has died due to neglect.`,
          type: "error",
          persistent: true,
        });

        // Reset the store state
        set({
          userDigimon: null,
          digimonData: null,
          evolutionOptions: [],
          error: "Your Digimon has died due to neglect.",
        });

        console.log("Store state reset after Digimon death");

        // Use a small timeout before redirecting to ensure notification is processed
        setTimeout(() => {
          window.location.href = "/";
        }, 100);

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
        // await get().checkEvolution();

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
