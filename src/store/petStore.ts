import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useNotificationStore } from "./notificationStore";
import { useTaskStore } from "./taskStore";
import { StatCategory } from "../utils/categoryDetection";
import { getDailyStatCap } from "../utils/statCaps";

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
  is_on_team: boolean;
  hp_bonus: number;
  sp_bonus: number;
  atk_bonus: number;
  def_bonus: number;
  int_bonus: number;
  spd_bonus: number;
  daily_stat_gains: number;
  last_stat_reset: string;
  digimon?: Digimon;
}

export interface Digimon {
  id: number;
  digimon_id: number;
  name: string;
  stage: string;
  sprite_url: string;
  type: string;
  attribute: string;
  hp: number;
  sp: number;
  atk: number;
  def: number;
  int: number;
  spd: number;
  hp_level1: number;
  sp_level1: number;
  atk_level1: number;
  def_level1: number;
  int_level1: number;
  spd_level1: number;
  hp_level99: number;
  sp_level99: number;
  atk_level99: number;
  def_level99: number;
  int_level99: number;
  spd_level99: number;
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
  evolveDigimon: (
    toDigimonId: number,
    specificDigimonId?: string
  ) => Promise<void>;
  getStarterDigimon: () => Promise<Digimon[]>;
  fetchDiscoveredDigimon: () => Promise<void>;
  addDiscoveredDigimon: (digimonId: number) => Promise<void>;
  subscribeToDigimonUpdates: () => Promise<() => void>;
  checkDigimonHealth: () => Promise<void>;
  checkLevelUp: () => Promise<boolean | undefined>;
  getDigimonDisplayName: () => string;
  setActiveDigimon: (digimonId: string) => Promise<void>;
  applyPenalty: (
    healthPenalty: number,
    happinessPenalty: number
  ) => Promise<void>;
  testPenalty: () => Promise<void>;
  debugHealth: () => void;
  isDigimonDead: boolean;
  resetDeadState: () => void;
  handleDigimonDeath: () => Promise<void>;
  releaseDigimon: (digimonId: string) => Promise<boolean>;
  setTeamMember: (digimonId: string, isOnTeam: boolean) => Promise<void>;
  swapTeamMember: (
    teamDigimonId: string,
    reserveDigimonId: string
  ) => Promise<void>;
  feedAllDigimon: (taskPoints: number) => Promise<void>;
  increaseStat: (
    statCategory: StatCategory,
    amount: number
  ) => Promise<boolean>;
  checkStatCap: () => Promise<{
    canGain: boolean;
    remaining: number;
    cap: number;
  }>;
  checkStatReset: () => Promise<boolean>;
}

export const useDigimonStore = create<PetState>((set, get) => ({
  userDigimon: null,
  allUserDigimon: [],
  digimonData: null,
  evolutionOptions: [],
  discoveredDigimon: [],
  loading: false,
  error: null,
  isDigimonDead: false,

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

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ userDigimon: null, digimonData: null, loading: false });
        return;
      }

      // First check if the user has any Digimon at all
      const { data: anyDigimon, error: checkError } = await supabase
        .from("user_digimon")
        .select("count")
        .eq("user_id", userData.user.id);

      if (checkError) {
        console.error("Error checking for any Digimon:", checkError);
        throw checkError;
      }

      // If user has no Digimon at all, return early
      if (!anyDigimon || anyDigimon[0]?.count === 0) {
        set({ userDigimon: null, digimonData: null, loading: false });
        return;
      }

      // Now try to get the active Digimon
      const { data: userDigimon, error } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon:digimon_id(*)
        `
        )
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .single();

      if (error) {
        // If no active Digimon found, try to get any Digimon with health > 0
        if (error.code === "PGRST116") {
          console.log(
            "No active Digimon found, looking for any healthy Digimon"
          );

          const { data: healthyDigimon, error: healthyError } = await supabase
            .from("user_digimon")
            .select(
              `
              *,
              digimon:digimon_id(*)
            `
            )
            .eq("user_id", userData.user.id)
            .gt("health", 0)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (healthyError) {
            console.error("Error fetching healthy Digimon:", healthyError);

            // If no healthy Digimon, check if all Digimon are dead
            const { data: deadDigimon } = await supabase
              .from("user_digimon")
              .select("id")
              .eq("user_id", userData.user.id)
              .eq("health", 0);

            if (deadDigimon && deadDigimon.length > 0) {
              console.log("All Digimon are dead");
              set({ isDigimonDead: true });
            }

            set({ userDigimon: null, digimonData: null, loading: false });
            return;
          }

          // Found a healthy Digimon, make it active
          if (healthyDigimon) {
            console.log(
              "Found healthy Digimon, making it active:",
              healthyDigimon.id
            );

            await supabase
              .from("user_digimon")
              .update({ is_active: true })
              .eq("id", healthyDigimon.id);

            set({
              userDigimon: {
                ...healthyDigimon,
                is_active: true,
                digimon: healthyDigimon.digimon,
              },
              digimonData: healthyDigimon.digimon,
              loading: false,
            });
          }
        }

        console.error("Error fetching user Digimon:", error);
        set({ error: error.message, loading: false });
        return;
      }

      // Successfully found active Digimon
      set({
        userDigimon: {
          ...userDigimon,
          digimon: userDigimon.digimon,
        },
        digimonData: userDigimon.digimon,
        loading: false,
      });

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
        evolutionOptions,
        loading: false,
      });
    } catch (error) {
      console.error("Error in fetchUserDigimon:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
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

      const MAX_DIGIMON = 9;

      if (count && count >= MAX_DIGIMON) {
        console.log("WARNING!!: You can only have up to 3 Digimon");
        set({ loading: false });
        return;
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
        set({ loading: false });
        return;
      }

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Get the XP multiplier from taskStore
      const expMultiplier = useTaskStore.getState().getExpMultiplier();

      // Apply the multiplier to the task points
      const multipliedPoints = Math.round(taskPoints * expMultiplier);

      // Calculate new stats
      const newHealth = Math.ceil(Math.min(100, userDigimon.health + 5));
      const newHappiness = Math.ceil(Math.min(100, userDigimon.happiness + 5));
      const newXP = userDigimon.experience_points + multipliedPoints;

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
    } catch (error) {
      console.error("Error in feedDigimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Feed allUserDigimon

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

  evolveDigimon: async (toDigimonId: number, specificDigimonId?: string) => {
    try {
      set({ loading: true, error: null });

      // Determine which Digimon to evolve
      let digimonIdToEvolve: string;

      if (specificDigimonId) {
        // If a specific Digimon ID was provided, use that
        digimonIdToEvolve = specificDigimonId;
      } else if (get().userDigimon) {
        // Otherwise, use the active Digimon
        digimonIdToEvolve = get().userDigimon?.id || "";
      } else {
        throw new Error("No Digimon found to evolve");
      }

      // Update the Digimon's species while preserving the custom name (if any)
      const { error } = await supabase
        .from("user_digimon")
        .update({
          digimon_id: toDigimonId,
        })
        .eq("id", digimonIdToEvolve);

      if (error) throw error;

      // Add the new Digimon to discovered list
      await get().addDiscoveredDigimon(toDigimonId);

      // Always refresh all user Digimon to update the UI
      await get().fetchAllUserDigimon();

      // If we evolved the active Digimon, refresh its data too
      const { userDigimon } = get();
      if (userDigimon && digimonIdToEvolve === userDigimon.id) {
        await get().fetchUserDigimon();
      }

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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return () => {};
    }

    const subscription = supabase
      .channel("digimon_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "user_digimon",
          filter: `user_id=eq.${userData.user.id}`,
        },
        async (payload) => {
          // If it's a DELETE event and our current Digimon was deleted
          if (
            payload.eventType === "DELETE" &&
            get().userDigimon?.id === payload.old.id
          ) {
            set({ userDigimon: null, digimonData: null, evolutionOptions: [] });

            // Show notification about Digimon death
            useNotificationStore.getState().addNotification({
              message:
                "Your Digimon has died due to neglect. You'll need to create a new one.",
              type: "error",
              persistent: true,
            });

            // Dispatch a custom event
            window.dispatchEvent(new CustomEvent("digimon-died"));

            return;
          }

          // For other events, refresh the Digimon data
          await get().fetchUserDigimon();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  checkDigimonHealth: async () => {
    try {
      const { userDigimon } = get();

      // If no Digimon, nothing to check
      if (!userDigimon) {
        // Check if user has any Digimon at all
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: anyDigimon } = await supabase
          .from("user_digimon")
          .select("count")
          .eq("user_id", userData.user.id);

        // If user has Digimon but none active, try to find a healthy one
        if (anyDigimon && anyDigimon[0]?.count > 0) {
          await get().fetchUserDigimon();
        }

        return;
      }

      // Check if health is 0 or less
      if (userDigimon.health <= 0) {
        console.log("Digimon health is 0 or less, handling death");
        await get().handleDigimonDeath();
      }
    } catch (error) {
      console.error("Error checking Digimon health:", error);
    }
  },

  checkLevelUp: async () => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return;

      // Calculate XP needed for next level (20 base + 10 per level)
      const xpNeeded = 20 + (userDigimon.current_level - 1) * 20;

      // Check if Digimon has enough XP to level up
      if (userDigimon.experience_points >= xpNeeded) {
        // Calculate new level and remaining XP
        const newLevel = userDigimon.current_level + 1;
        const remainingXP = userDigimon.experience_points - xpNeeded;

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
          await get().checkLevelUp();
        }

        return true;
      } else {
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

  applyPenalty: async (healthPenalty: number, happinessPenalty: number) => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return;

      console.log(
        `Applying penalty: -${healthPenalty} health, -${happinessPenalty} happiness`
      );

      // Calculate new health and happiness values
      const newHealth = Math.max(0, userDigimon.health - healthPenalty);
      const newHappiness = Math.max(
        0,
        userDigimon.happiness - happinessPenalty
      );

      // Update the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
          health: newHealth,
          happiness: newHappiness,
          last_updated_at: new Date().toISOString(),
        })
        .eq("id", userDigimon.id)
        .eq("is_active", true); // Only update if this is the active Digimon

      if (error) {
        console.error("Error updating Digimon stats:", error);
        return;
      }

      // Update the local state
      set((state) => ({
        userDigimon: state.userDigimon
          ? {
              ...state.userDigimon,
              health: newHealth,
              happiness: newHappiness,
            }
          : null,
      }));

      // If health is now 0, handle Digimon death
      if (newHealth <= 0) {
        await get().handleDigimonDeath();
      }
    } catch (error) {
      console.error("Error applying penalty:", error);
    }
  },

  testPenalty: async () => {
    console.log("Testing penalty application");
    await get().applyPenalty(10, 15);
    await get().fetchUserDigimon();
  },

  debugHealth: () => {
    const { userDigimon } = get();
    if (!userDigimon) {
      console.log("No Digimon found to debug");
      return;
    }

    console.log("=== DIGIMON HEALTH DEBUG ===");
    console.log(`Digimon ID: ${userDigimon.id}`);
    console.log(`Health: ${userDigimon.health}`);
    console.log(`Happiness: ${userDigimon.happiness}`);
    console.log(`Is health exactly 0? ${userDigimon.health === 0}`);
    console.log(`Is health <= 0? ${userDigimon.health <= 0}`);
    console.log(`Health type: ${typeof userDigimon.health}`);

    // Check for potential floating point issues
    if (userDigimon.health < 1 && userDigimon.health > 0) {
      console.log(
        "WARNING: Health is between 0 and 1, possible floating point issue"
      );
      console.log(`Health exact value: ${userDigimon.health}`);
    }
  },

  resetDeadState: () => {
    set({ isDigimonDead: false });
  },

  handleDigimonDeath: async () => {
    const { userDigimon, allUserDigimon } = get();

    if (!userDigimon || userDigimon.health > 0) return;

    console.log("Handling Digimon death");

    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        return;
      }

      // Get all overdue tasks that might not be in the penalized list yet
      const { data: overdueTasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("is_completed", false)
        .eq("is_daily", false)
        .not("due_date", "is", null)
        .lt("due_date", new Date().toISOString());

      if (overdueTasks && overdueTasks.length > 0) {
        // Get the current daily quota
        const { data: quotaData } = await supabase
          .from("daily_quotas")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        if (quotaData) {
          // Add all overdue task IDs to the penalized tasks list
          const currentPenalized = quotaData.penalized_tasks || [];
          const overdueIds = overdueTasks.map((t) => t.id);

          // Create a set to remove duplicates
          const allPenalizedSet = new Set([...currentPenalized, ...overdueIds]);
          const allPenalized = Array.from(allPenalizedSet);

          // Update the penalized tasks in the database
          await supabase
            .from("daily_quotas")
            .update({ penalized_tasks: allPenalized })
            .eq("user_id", userData.user.id);

          // Update the local state in taskStore
          const taskStore = useTaskStore.getState();
          if (taskStore.setPenalizedTasks) {
            taskStore.setPenalizedTasks(allPenalized);
          }
        }
      }

      // Mark the current Digimon as dead in the database
      await supabase
        .from("user_digimon")
        .update({ is_active: false, health: 0 })
        .eq("id", userDigimon.id);

      // Show a notification about the Digimon's death
      useNotificationStore.getState().addNotification({
        message: `Your Digimon ${
          userDigimon.name || userDigimon.digimon?.name || "Digimon"
        } has died due to neglect.`,
        type: "error",
        persistent: true,
      });

      // Find another Digimon to make active
      const otherDigimon = allUserDigimon.find(
        (d) => d.id !== userDigimon.id && d.health > 0
      );

      if (otherDigimon) {
        console.log(`Switching to another Digimon: ${otherDigimon.id}`);

        // Make the other Digimon active
        await supabase
          .from("user_digimon")
          .update({ is_active: true })
          .eq("id", otherDigimon.id);

        // Update the local state
        set({
          userDigimon: { ...otherDigimon, is_active: true },
          isDigimonDead: false,
        });

        // Show notification about switching Digimon
        useNotificationStore.getState().addNotification({
          message: `Your active Digimon is now ${
            otherDigimon.name ||
            otherDigimon.digimon?.name ||
            "your other Digimon"
          }.`,
          type: "info",
        });

        // Refresh Digimon data to ensure everything is up to date
        await get().fetchUserDigimon();
        await get().fetchAllUserDigimon();
      } else {
        // No other Digimon available, set isDigimonDead to true
        set({ isDigimonDead: true });

        // Show notification about needing to create a new Digimon
        useNotificationStore.getState().addNotification({
          message: "You'll need to create a new Digimon.",
          type: "info",
        });
      }
    } catch (error) {
      console.error("Error handling Digimon death:", error);
    }
  },

  releaseDigimon: async (digimonId: string) => {
    try {
      set({ loading: true, error: null });

      const { userDigimon } = get();

      // Don't allow releasing the active Digimon
      if (userDigimon && digimonId === userDigimon.id) {
        set({
          error:
            "You cannot release your active Digimon. Please switch to another Digimon first.",
          loading: false,
        });
        return false;
      }

      // Delete the Digimon from the database
      const { error } = await supabase
        .from("user_digimon")
        .delete()
        .eq("id", digimonId);

      if (error) throw error;

      // Refresh the user's Digimon list
      await get().fetchAllUserDigimon();

      // Show success notification
      useNotificationStore.getState().addNotification({
        message: "Digimon released successfully.",
        type: "success",
      });

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error releasing Digimon:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return false;
    }
  },

  setTeamMember: async (digimonId: string, isOnTeam: boolean) => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Count current team members
      const { data: teamCount, error: countError } = await supabase
        .from("user_digimon")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("is_on_team", true);

      if (countError) throw countError;

      // If trying to add to team but already at max, show error
      if (isOnTeam && teamCount && teamCount.length >= 3) {
        set({
          error: "You can only have 3 Digimon on your team. Remove one first.",
          loading: false,
        });
        return;
      }

      // Update the Digimon's team status
      const { error: updateError } = await supabase
        .from("user_digimon")
        .update({ is_on_team: isOnTeam })
        .eq("id", digimonId)
        .eq("user_id", userData.user.id);

      if (updateError) throw updateError;

      // Refresh Digimon data
      await get().fetchAllUserDigimon();
      set({ loading: false });
    } catch (error) {
      console.error("Error setting team member:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  swapTeamMember: async (teamDigimonId: string, reserveDigimonId: string) => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Start a transaction to swap the two Digimon
      const { error } = await supabase.rpc("swap_team_members", {
        team_digimon_id: teamDigimonId,
        reserve_digimon_id: reserveDigimonId,
        user_id_param: userData.user.id,
      });

      if (error) throw error;

      // Refresh Digimon data
      await get().fetchAllUserDigimon();
      set({ loading: false });
    } catch (error) {
      console.error("Error swapping team members:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  feedAllDigimon: async (taskPoints: number) => {
    try {
      set({ loading: true, error: null });

      console.log("Feeding all Digimon");

      const { allUserDigimon } = get();
      if (allUserDigimon.length === 0) {
        set({ loading: false });
        return;
      }

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      // Get the XP multiplier from taskStore
      const expMultiplier = useTaskStore.getState().getExpMultiplier();

      // Apply the multiplier to the task points
      const multipliedPoints = Math.round(taskPoints * expMultiplier);

      // Update all Digimon in the database
      const updates = allUserDigimon.map(async (digimon) => {
        // Calculate new stats
        const newXP = digimon.experience_points + multipliedPoints;

        console.log(`Feeding Digimon ${digimon.id} with ${newXP} XP`);

        // Update the Digimon in the database
        const { error } = await supabase
          .from("user_digimon")
          .update({
            experience_points: newXP,
          })
          .eq("id", digimon.id);

        if (error) {
          console.error(`Error feeding Digimon ${digimon.id}:`, error);
          throw error;
        }

        // Return the updated Digimon data
        return {
          ...digimon,
          experience_points: newXP,
        };
      });

      // Wait for all updates to complete
      const updatedDigimon = await Promise.all(updates);

      // Update local state
      set({
        allUserDigimon: updatedDigimon,
        loading: false,
      });

      // If the active Digimon was updated, update that state too
      const { userDigimon } = get();
      if (userDigimon) {
        const updatedActiveDigimon = updatedDigimon.find(
          (d) => d.id === userDigimon.id
        );
        if (updatedActiveDigimon) {
          set({
            userDigimon: updatedActiveDigimon,
          });
        }
      }

      // Check for level ups after feeding
      await get().checkLevelUp();
    } catch (error) {
      console.error("Error in feedAllDigimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  increaseStat: async (statCategory: StatCategory, amount: number) => {
    try {
      // Get the active Digimon
      const activeDigimon = get().userDigimon;
      if (!activeDigimon) {
        console.log("No active Digimon to increase stats for");
        return false;
      }

      // Check if we've reached the daily stat cap
      const { canGain, remaining } = await get().checkStatCap();

      if (!canGain) {
        // We've reached the cap, notify the user but don't increase stats
        useNotificationStore.getState().addNotification({
          message:
            "You've reached your stat gain limit for today. You can still complete tasks, but no more stats will be gained until tomorrow.",
          type: "info",
        });
        return true; // Return true so task completion continues
      }

      // Adjust the amount if it would exceed the remaining points
      const adjustedAmount = Math.min(amount, remaining);

      // Map the stat category to the corresponding bonus field
      const bonusField = `${statCategory.toLowerCase()}_bonus`;

      // Get the current bonus value
      const currentBonus =
        (activeDigimon[bonusField as keyof typeof activeDigimon] as number) ||
        0;

      // Calculate the new bonus value
      const newBonus = currentBonus + adjustedAmount;

      // Calculate the new daily stat gains
      const newDailyGains = activeDigimon.daily_stat_gains + adjustedAmount;

      // Update the Digimon in the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
          [bonusField]: newBonus,
          daily_stat_gains: newDailyGains,
        })
        .eq("id", activeDigimon.id);

      if (error) throw error;

      // Update the local state
      set((state) => ({
        userDigimon: state.userDigimon
          ? {
              ...state.userDigimon,
              [bonusField]: newBonus,
              daily_stat_gains: newDailyGains,
            }
          : null,
        allUserDigimon: state.allUserDigimon.map((digimon) =>
          digimon.id === activeDigimon.id
            ? {
                ...digimon,
                [bonusField]: newBonus,
                daily_stat_gains: newDailyGains,
              }
            : digimon
        ),
      }));

      // If we've reached the cap after this increase, notify the user
      if (newDailyGains >= (await get().checkStatCap()).cap) {
        useNotificationStore.getState().addNotification({
          message:
            "You've reached your stat gain limit for today. You can still complete tasks, but no more stats will be gained until tomorrow.",
          type: "info",
        });
      }

      console.log(
        `Increased ${statCategory} by ${adjustedAmount}. New value: ${newBonus}`
      );
      return true;
    } catch (error) {
      console.error(`Error increasing ${statCategory}:`, error);
      return false;
    }
  },

  checkStatCap: async () => {
    const activeDigimon = get().userDigimon;
    if (!activeDigimon || !activeDigimon.digimon)
      return { canGain: false, remaining: 0, cap: 0 };

    // Get the cap based on the Digimon's stage
    const cap = getDailyStatCap(activeDigimon.digimon.stage);

    // Check if we need to reset the daily stats (if it's a new day)
    await get().checkStatReset();

    // Calculate remaining points
    const remaining = Math.max(0, cap - activeDigimon.daily_stat_gains);

    return {
      canGain: remaining > 0,
      remaining,
      cap,
    };
  },

  checkStatReset: async () => {
    const activeDigimon = get().userDigimon;
    if (!activeDigimon) return false;

    const lastReset = new Date(activeDigimon.last_stat_reset);
    const now = new Date();

    // Check if the last reset was on a different day
    const isNewDay =
      lastReset.getFullYear() !== now.getFullYear() ||
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getDate() !== now.getDate();

    if (isNewDay) {
      // Reset the daily stat gains
      const { error } = await supabase
        .from("user_digimon")
        .update({
          daily_stat_gains: 0,
          last_stat_reset: now.toISOString(),
        })
        .eq("id", activeDigimon.id);

      if (error) {
        console.error("Error resetting daily stat gains:", error);
        return false;
      }

      // Update local state
      set((state) => ({
        userDigimon: state.userDigimon
          ? {
              ...state.userDigimon,
              daily_stat_gains: 0,
              last_stat_reset: now.toISOString(),
            }
          : null,
        allUserDigimon: state.allUserDigimon.map((digimon) =>
          digimon.id === activeDigimon.id
            ? {
                ...digimon,
                daily_stat_gains: 0,
                last_stat_reset: now.toISOString(),
              }
            : digimon
        ),
      }));

      return true;
    }

    return false;
  },
}));
