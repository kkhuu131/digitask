import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useNotificationStore } from "./notificationStore";
import { useTaskStore } from "./taskStore";
import { StatCategory } from "../utils/categoryDetection";
import statModifier from "./battleStore";

export function expToBoostPoints(
  level: number,
  experience: number,
  evolution: boolean = true
) {
  const totalEXP = (20 * (level * (level - 1))) / 2 + experience;

  if (evolution) {
    return Math.floor(totalEXP / 1500);
  } else {
    return Math.floor(totalEXP / 1000);
  }
}

export interface UserDigimon {
  id: string;
  user_id: string;
  digimon_id: number;
  name: string;
  current_level: number;
  experience_points: number;
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
  personality?: string;
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
  stat_requirements?: {
    hp?: number;
    sp?: number;
    atk?: number;
    def?: number;
    int?: number;
    spd?: number;
  };
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
  checkDevolution: () => Promise<boolean>;
  evolveDigimon: (
    toDigimonId: number,
    specificDigimonId?: string
  ) => Promise<void>;
  devolveDigimon: (
    fromDigimonId: number,
    specificDigimonId?: string
  ) => Promise<void>;
  getStarterDigimon: () => Promise<Digimon[]>;
  fetchDiscoveredDigimon: () => Promise<void>;
  addDiscoveredDigimon: (digimonId: number) => Promise<void>;
  subscribeToDigimonUpdates: () => Promise<() => void>;
  checkLevelUp: () => Promise<boolean | undefined>;
  getDigimonDisplayName: () => string;
  setActiveDigimon: (digimonId: string) => Promise<void>;
  applyPenalty: (happinessPenalty: number) => Promise<void>;
  testPenalty: () => Promise<void>;
  debugHealth: () => void;
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
  calculateDailyStatCap: () => number;
  userDailyStatGains: number;
  fetchUserDailyStatGains: () => Promise<number>;
  updateDigimonName: (
    digimonId: string,
    newName: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateDigimonInStore: (updatedDigimon: UserDigimon) => void;
}

export const useDigimonStore = create<PetState>((set, get) => ({
  userDigimon: null,
  allUserDigimon: [],
  digimonData: null,
  evolutionOptions: [],
  discoveredDigimon: [],
  loading: false,
  error: null,
  userDailyStatGains: 0,

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
        // If no active Digimon found, try to get any Digimon
        if (error.code === "PGRST116") {
          console.log("No active Digimon found, looking for any Digimon");

          const { data: anyAvailableDigimon, error: availableError } =
            await supabase
              .from("user_digimon")
              .select(
                `
              *,
              digimon:digimon_id(*)
            `
              )
              .eq("user_id", userData.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

          if (availableError) {
            console.error("Error fetching any Digimon:", availableError);
            set({ userDigimon: null, digimonData: null, loading: false });
            return;
          }

          // Found a Digimon, make it active
          if (anyAvailableDigimon) {
            console.log(
              "Found Digimon, making it active:",
              anyAvailableDigimon.id
            );

            await supabase
              .from("user_digimon")
              .update({ is_active: true })
              .eq("id", anyAvailableDigimon.id);

            set({
              userDigimon: {
                ...anyAvailableDigimon,
                is_active: true,
                digimon: anyAvailableDigimon.digimon,
              },
              digimonData: anyAvailableDigimon.digimon,
              loading: false,
            });
            return;
          }
        }

        console.error("Error fetching user Digimon:", error);
        set({ error: error.message, loading: false });
        return;
      }

      // Successfully found an active Digimon
      set({
        userDigimon,
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
          stat_requirements,
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
        stat_requirements: path.stat_requirements || {},
      }));

      set({
        evolutionOptions,
        loading: false,
      });
    } catch (error) {
      console.error("Error in fetchUserDigimon:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAllUserDigimon: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ allUserDigimon: [], loading: false });
        return;
      }

      const { data: digimon, error } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon (*)
        `
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ allUserDigimon: digimon || [], loading: false });

      // Also fetch the user's daily stat gains
      await get().fetchUserDailyStatGains();
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
        throw new Error("User not authenticated");
      }

      // Create the user's Digimon
      const { data, error } = await supabase
        .from("user_digimon")
        .insert([
          {
            user_id: userData.user.id,
            digimon_id: digimonId,
            name: name,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Also fetch the user profile to update the auth store
      const { useAuthStore } = await import("../store/authStore");
      await useAuthStore.getState().fetchUserProfile();

      set({
        userDigimon: data,
        loading: false,
      });

      return data;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
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
      const newHappiness = Math.ceil(Math.min(100, userDigimon.happiness + 20));
      const newXP = userDigimon.experience_points + multipliedPoints;

      // Update the Digimon in the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
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

  checkDevolution: async () => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return false;

      // Fetch evolution options for the current Digimon
      const { data: evolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(
          `
          id,
          to_digimon_id,
          level_required,
          stat_requirements,
          digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url)
        `
        )
        .eq("to_digimon_id", userDigimon.digimon_id);

      if (error) throw error;

      const availableEvolutions = evolutionPaths.filter((path) => {
        return get().discoveredDigimon.includes(path.to_digimon_id);
      });

      return availableEvolutions.length > 0;
    } catch (error) {
      console.error("Error checking de-evolution:", error);
      return false;
    }
  },

  checkEvolution: async () => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return false;

      // Fetch evolution options for the current Digimon
      const { data: evolutionPaths, error } = await supabase
        .from("evolution_paths")
        .select(
          `
          id,
          to_digimon_id,
          level_required,
          stat_requirements,
          digimon:to_digimon_id (id, digimon_id, name, stage, sprite_url)
        `
        )
        .eq("from_digimon_id", userDigimon.digimon_id);

      if (error) throw error;

      // Check if any evolution paths are available and meet requirements
      const availableEvolutions = evolutionPaths.filter((path) => {
        // Check level requirement
        const meetsLevelRequirement =
          userDigimon.current_level >= path.level_required;

        // Check stat requirements if they exist
        let meetsStatRequirements = true;
        if (path.stat_requirements) {
          const statReqs = path.stat_requirements;

          // Calculate base stats for current level
          const baseHP = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.hp_level1 || 0,
            userDigimon.digimon?.hp || 0,
            userDigimon.digimon?.hp_level99 || 0
          );

          const baseSP = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.sp_level1 || 0,
            userDigimon.digimon?.sp || 0,
            userDigimon.digimon?.sp_level99 || 0
          );

          const baseATK = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.atk_level1 || 0,
            userDigimon.digimon?.atk || 0,
            userDigimon.digimon?.atk_level99 || 0
          );

          const baseDEF = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.def_level1 || 0,
            userDigimon.digimon?.def || 0,
            userDigimon.digimon?.def_level99 || 0
          );

          const baseINT = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.int_level1 || 0,
            userDigimon.digimon?.int || 0,
            userDigimon.digimon?.int_level99 || 0
          );

          const baseSPD = statModifier(
            userDigimon.current_level,
            userDigimon.digimon?.spd_level1 || 0,
            userDigimon.digimon?.spd || 0,
            userDigimon.digimon?.spd_level99 || 0
          );

          // Check each stat requirement
          if (
            statReqs.hp &&
            baseHP + (userDigimon.hp_bonus || 0) < statReqs.hp
          ) {
            meetsStatRequirements = false;
          }
          if (
            statReqs.sp &&
            baseSP + (userDigimon.sp_bonus || 0) < statReqs.sp
          ) {
            meetsStatRequirements = false;
          }
          if (
            statReqs.atk &&
            baseATK + (userDigimon.atk_bonus || 0) < statReqs.atk
          ) {
            meetsStatRequirements = false;
          }
          if (
            statReqs.def &&
            baseDEF + (userDigimon.def_bonus || 0) < statReqs.def
          ) {
            meetsStatRequirements = false;
          }
          if (
            statReqs.int &&
            baseINT + (userDigimon.int_bonus || 0) < statReqs.int
          ) {
            meetsStatRequirements = false;
          }
          if (
            statReqs.spd &&
            baseSPD + (userDigimon.spd_bonus || 0) < statReqs.spd
          ) {
            meetsStatRequirements = false;
          }
        }

        return meetsLevelRequirement && meetsStatRequirements;
      });

      return availableEvolutions.length > 0;
    } catch (error) {
      console.error("Error checking evolution:", error);
      return false;
    }
  },

  evolveDigimon: async (toDigimonId: number, specificDigimonId?: string) => {
    try {
      set({ loading: true, error: null });

      // Get the Digimon to evolve (either active or specified)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      let digimonToEvolve;
      if (specificDigimonId) {
        const { data, error } = await supabase
          .from("user_digimon")
          .select(
            `
            *,
            digimon (*)
          `
          )
          .eq("id", specificDigimonId)
          .single();

        if (error) throw error;
        digimonToEvolve = data;
      } else {
        digimonToEvolve = get().userDigimon;
      }

      if (!digimonToEvolve) {
        throw new Error("No Digimon found to evolve");
      }

      // Get the evolution path
      const { data: evolutionPath, error: evolutionError } = await supabase
        .from("evolution_paths")
        .select("*, digimon:to_digimon_id (*)")
        .eq("from_digimon_id", digimonToEvolve.digimon_id)
        .eq("to_digimon_id", toDigimonId)
        .single();

      if (evolutionError) throw evolutionError;

      // Check level requirement
      if (digimonToEvolve.current_level < evolutionPath.level_required) {
        throw new Error(
          `Your Digimon needs to be at least level ${evolutionPath.level_required} to evolve.`
        );
      }

      // Check stat requirements if they exist
      if (evolutionPath.stat_requirements) {
        const statReqs = evolutionPath.stat_requirements;
        const statErrors = [];

        // Calculate base stats for current level
        const baseHP = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.hp_level1 || 0,
          digimonToEvolve.digimon?.hp || 0,
          digimonToEvolve.digimon?.hp_level99 || 0
        );

        const baseSP = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.sp_level1 || 0,
          digimonToEvolve.digimon?.sp || 0,
          digimonToEvolve.digimon?.sp_level99 || 0
        );

        const baseATK = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.atk_level1 || 0,
          digimonToEvolve.digimon?.atk || 0,
          digimonToEvolve.digimon?.atk_level99 || 0
        );

        const baseDEF = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.def_level1 || 0,
          digimonToEvolve.digimon?.def || 0,
          digimonToEvolve.digimon?.def_level99 || 0
        );

        const baseINT = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.int_level1 || 0,
          digimonToEvolve.digimon?.int || 0,
          digimonToEvolve.digimon?.int_level99 || 0
        );

        const baseSPD = statModifier(
          digimonToEvolve.current_level,
          digimonToEvolve.digimon?.spd_level1 || 0,
          digimonToEvolve.digimon?.spd || 0,
          digimonToEvolve.digimon?.spd_level99 || 0
        );

        // Check each stat requirement
        if (
          statReqs.hp &&
          baseHP + (digimonToEvolve.hp_bonus || 0) < statReqs.hp
        ) {
          statErrors.push(
            `HP: ${baseHP + (digimonToEvolve.hp_bonus || 0)}/${statReqs.hp}`
          );
        }
        if (
          statReqs.sp &&
          baseSP + (digimonToEvolve.sp_bonus || 0) < statReqs.sp
        ) {
          statErrors.push(
            `SP: ${baseSP + (digimonToEvolve.sp_bonus || 0)}/${statReqs.sp}`
          );
        }
        if (
          statReqs.atk &&
          baseATK + (digimonToEvolve.atk_bonus || 0) < statReqs.atk
        ) {
          statErrors.push(
            `ATK: ${baseATK + (digimonToEvolve.atk_bonus || 0)}/${statReqs.atk}`
          );
        }
        if (
          statReqs.def &&
          baseDEF + (digimonToEvolve.def_bonus || 0) < statReqs.def
        ) {
          statErrors.push(
            `DEF: ${baseDEF + (digimonToEvolve.def_bonus || 0)}/${statReqs.def}`
          );
        }
        if (
          statReqs.int &&
          baseINT + (digimonToEvolve.int_bonus || 0) < statReqs.int
        ) {
          statErrors.push(
            `INT: ${baseINT + (digimonToEvolve.int_bonus || 0)}/${statReqs.int}`
          );
        }
        if (
          statReqs.spd &&
          baseSPD + (digimonToEvolve.spd_bonus || 0) < statReqs.spd
        ) {
          statErrors.push(
            `SPD: ${baseSPD + (digimonToEvolve.spd_bonus || 0)}/${statReqs.spd}`
          );
        }

        if (statErrors.length > 0) {
          throw new Error(
            `Your Digimon doesn't meet the stat requirements: ${statErrors.join(
              ", "
            )}`
          );
        }
      }

      const boostPoints = expToBoostPoints(
        digimonToEvolve.current_level,
        digimonToEvolve.experience_points,
        true
      );

      const { error } = await supabase
        .from("user_digimon")
        .update({
          digimon_id: toDigimonId,
          current_level: 1,
          experience_points: 0,
          hp_bonus: digimonToEvolve.hp_bonus + boostPoints,
          sp_bonus: digimonToEvolve.sp_bonus + boostPoints,
          atk_bonus: digimonToEvolve.atk_bonus + boostPoints,
          def_bonus: digimonToEvolve.def_bonus + boostPoints,
          int_bonus: digimonToEvolve.int_bonus + boostPoints,
          spd_bonus: digimonToEvolve.spd_bonus + boostPoints,
        })
        .eq("id", digimonToEvolve.id);

      if (error) throw error;

      // Add the new Digimon to discovered list
      await get().addDiscoveredDigimon(toDigimonId);

      // Always refresh all user Digimon to update the UI
      await get().fetchAllUserDigimon();

      // If we evolved the active Digimon, refresh its data too
      const { userDigimon } = get();
      if (userDigimon && digimonToEvolve.id === userDigimon.id) {
        await get().fetchUserDigimon();
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error evolving Digimon:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  devolveDigimon: async (fromDigimonId: number, specificDigimonId?: string) => {
    try {
      set({ loading: true, error: null });

      // Get the Digimon to evolve (either active or specified)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return;
      }

      let digimonToDevolve;
      if (specificDigimonId) {
        const { data, error } = await supabase
          .from("user_digimon")
          .select(
            `
            *,
            digimon (*)
          `
          )
          .eq("id", specificDigimonId)
          .single();

        if (error) throw error;
        digimonToDevolve = data;
      } else {
        digimonToDevolve = get().userDigimon;
      }

      if (!digimonToDevolve) {
        throw new Error("No Digimon found to devolve");
      }

      // Get the evolution path
      const { error: devolutionError } = await supabase
        .from("evolution_paths")
        .select("*, digimon:from_digimon_id (*)")
        .eq("from_digimon_id", fromDigimonId)
        .eq("to_digimon_id", digimonToDevolve.digimon_id)
        .single();

      if (devolutionError) throw devolutionError;

      // Check if we've discovered the Digimon we're devolving to
      if (!get().discoveredDigimon.includes(fromDigimonId)) {
        throw new Error(
          `You haven't discovered the Digimon you're devolving to. Please discover it first.`
        );
      }

      const boostPoints = expToBoostPoints(
        digimonToDevolve.current_level,
        digimonToDevolve.experience_points,
        false
      );

      const { error } = await supabase
        .from("user_digimon")
        .update({
          digimon_id: fromDigimonId,
          current_level: 1,
          experience_points: 0,
          hp_bonus: digimonToDevolve.hp_bonus + boostPoints,
          sp_bonus: digimonToDevolve.sp_bonus + boostPoints,
          atk_bonus: digimonToDevolve.atk_bonus + boostPoints,
          def_bonus: digimonToDevolve.def_bonus + boostPoints,
          int_bonus: digimonToDevolve.int_bonus + boostPoints,
          spd_bonus: digimonToDevolve.spd_bonus + boostPoints,
        })
        .eq("id", digimonToDevolve.id);

      if (error) throw error;

      // Always refresh all user Digimon to update the UI
      await get().fetchAllUserDigimon();

      // If we evolved the active Digimon, refresh its data too
      const { userDigimon } = get();
      if (userDigimon && digimonToDevolve.id === userDigimon.id) {
        await get().fetchUserDigimon();
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error evolving Digimon:", error);
      set({ error: (error as Error).message, loading: false });
      throw error;
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

  applyPenalty: async (happinessPenalty: number) => {
    try {
      const { userDigimon } = get();
      if (!userDigimon) return;

      // Calculate new happiness value
      const newHappiness = Math.max(
        0,
        userDigimon.happiness - happinessPenalty
      );

      // Update the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
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
              happiness: newHappiness,
            }
          : null,
      }));
    } catch (error) {
      console.error("Error applying penalty:", error);
    }
  },

  testPenalty: async () => {
    console.log("Testing penalty application");
    await get().applyPenalty(10);
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
    console.log(`Happiness: ${userDigimon.happiness}`);
    console.log(`Is happiness exactly 0? ${userDigimon.happiness === 0}`);
    console.log(`Happiness type: ${typeof userDigimon.happiness}`);

    // Check for potential floating point issues
    if (userDigimon.happiness < 1 && userDigimon.happiness > 0) {
      console.log(
        "WARNING: Happiness is between 0 and 1, possible floating point issue"
      );
      console.log(`Happiness exact value: ${userDigimon.happiness}`);
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

      // Update all Digimon in the database
      const updates = allUserDigimon.map(async (digimon) => {
        // Calculate new stats
        const newXP = digimon.experience_points + taskPoints;

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

      // Map the stat category to the corresponding bonus field
      const bonusField = `${statCategory.toLowerCase()}_bonus`;

      // Get the current bonus value
      const currentBonus =
        (activeDigimon[bonusField as keyof typeof activeDigimon] as number) ||
        0;

      // Calculate the new bonus value
      const newBonus = currentBonus + amount;

      // Update the Digimon in the database
      const { error } = await supabase
        .from("user_digimon")
        .update({
          [bonusField]: newBonus,
        })
        .eq("id", activeDigimon.id);

      if (error) throw error;

      // Update the local state
      set((state) => ({
        userDigimon: state.userDigimon
          ? {
              ...state.userDigimon,
              [bonusField]: newBonus,
            }
          : null,
        allUserDigimon: state.allUserDigimon.map((digimon) =>
          digimon.id === activeDigimon.id
            ? {
                ...digimon,
                [bonusField]: newBonus,
              }
            : digimon
        ),
      }));

      return true;
    } catch (error) {
      console.error(`Error increasing ${statCategory}:`, error);
      return false;
    }
  },

  checkStatCap: async () => {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { canGain: false, remaining: 0, cap: 0 };

      // Get the user's profile with daily_stat_gains
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("daily_stat_gains, last_stat_reset")
        .eq("id", userData.user.id)
        .single();

      if (error) throw error;

      // Calculate the cap based on the number of digimon owned
      const cap = get().calculateDailyStatCap();

      // Calculate remaining points
      const remaining = Math.max(0, cap - (profileData.daily_stat_gains || 0));

      // Update the local state
      set({ userDailyStatGains: profileData.daily_stat_gains || 0 });

      return {
        canGain: remaining > 0,
        remaining,
        cap,
      };
    } catch (error) {
      console.error("Error checking stat cap:", error);
      return { canGain: false, remaining: 0, cap: 0 };
    }
  },

  // Add a helper function to calculate the daily stat cap
  calculateDailyStatCap: () => {
    // Base cap of 2 + 2 per digimon owned
    return 2 + 2 * get().allUserDigimon.length;
  },

  fetchUserDailyStatGains: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;

      // First check if the profile exists
      const { data: profileExists, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userData.user.id);

      if (checkError || !profileExists || profileExists.length === 0) {
        console.error("Profile not found, creating one");

        // Create a profile if it doesn't exist
        const username =
          userData.user.user_metadata?.username ||
          userData.user.email?.split("@")[0] ||
          `user_${Date.now()}`;

        await supabase.from("profiles").insert([
          {
            id: userData.user.id,
            username,
            display_name: username,
            saved_stats: { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 },
            daily_stat_gains: 0,
            last_stat_reset: new Date().toISOString(),
            battles_won: 0,
            battles_completed: 0,
          },
        ]);

        return 0;
      }

      // Now fetch the daily_stat_gains
      const { data, error } = await supabase
        .from("profiles")
        .select("daily_stat_gains")
        .eq("id", userData.user.id)
        .single();

      if (error) {
        console.error("Error fetching user daily stat gains:", error);
        return 0;
      }

      // Update the store state
      set({ userDailyStatGains: data?.daily_stat_gains || 0 });

      return data?.daily_stat_gains || 0;
    } catch (error) {
      console.error("Error fetching user daily stat gains:", error);
      return 0;
    }
  },

  updateDigimonName: async (digimonId: string, newName: string) => {
    try {
      // First update the database
      const { error } = await supabase
        .from("user_digimon")
        .update({ name: newName })
        .eq("id", digimonId);

      if (error) throw error;

      // Then update the local store state
      set((state) => {
        // Create a new array with the updated digimon
        const updatedAllUserDigimon = state.allUserDigimon.map((digimon) =>
          digimon.id === digimonId ? { ...digimon, name: newName } : digimon
        );

        // Also update userDigimon if it's the active one
        const updatedUserDigimon =
          state.userDigimon && state.userDigimon.id === digimonId
            ? { ...state.userDigimon, name: newName }
            : state.userDigimon;

        return {
          ...state,
          allUserDigimon: updatedAllUserDigimon,
          userDigimon: updatedUserDigimon,
        };
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating digimon name:", error);
      set({ error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  },

  updateDigimonInStore: (updatedDigimon: UserDigimon) => {
    set((state) => ({
      allUserDigimon: state.allUserDigimon.map((d) =>
        d.id === updatedDigimon.id ? updatedDigimon : d
      ),
      userDigimon:
        state.userDigimon?.id === updatedDigimon.id
          ? updatedDigimon
          : state.userDigimon,
    }));
  },
}));
