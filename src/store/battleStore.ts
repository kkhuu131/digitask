import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";

export interface Battle {
  id: string;
  user_digimon_id: string;
  opponent_digimon_id: string;
  winner_digimon_id: string;
  created_at: string;
  user_digimon_details?: {
    name: string;
    level: number;
    digimon_id: number;
    sprite_url: string;
    digimon_name: string;
  };
  opponent_digimon_details?: {
    name: string;
    level: number;
    digimon_id: number;
    sprite_url: string;
    digimon_name: string;
  };
  user_digimon?: {
    id: string;
    name: string;
    digimon_id: number;
    current_level: number;
    user_id: string;
    user?: {
      id: string;
      email: string;
    };
    profile?: {
      username: string;
      display_name?: string;
    };
    digimon?: {
      name: string;
      sprite_url: string;
      hp: number;
      atk: number;
      def: number;
      spd: number;
    };
  };
  opponent_digimon?: {
    id: string;
    name: string;
    digimon_id: number;
    current_level: number;
    user_id: string;
    user?: {
      id: string;
      email: string;
    };
    profile?: {
      username: string;
      display_name?: string;
    };
    digimon?: {
      name: string;
      sprite_url: string;
      hp: number;
      atk: number;
      def: number;
      spd: number;
    };
  };
  turns?: {
    attacker: string;
    damage: number;
    isCriticalHit: boolean;
    didMiss: boolean;
    remainingUserHP: number;
    remainingOpponentHP: number;
  }[];
}

interface BattleState {
  battleHistory: Battle[];
  currentBattle: Battle | null;
  loading: boolean;
  error: string | null;
  dailyBattlesRemaining: number;
  fetchBattleHistory: () => Promise<void>;
  queueForBattle: (userDigimonId: string) => Promise<void>;
  clearCurrentBattle: () => void;
  checkDailyBattleLimit: () => Promise<number>;
  resetDailyBattleLimit: () => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battleHistory: [],
  currentBattle: null,
  loading: false,
  error: null,
  dailyBattlesRemaining: 5,

  checkDailyBattleLimit: async () => {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No user found, can't check battle limit");
        set({ dailyBattlesRemaining: 0 });
        return 0;
      }

      const userId = userData.user.id;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      // Check if we have a battle_limits record for today
      const { data: limitData, error: limitError } = await supabase
        .from("battle_limits")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (limitError && limitError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking battle limit:", limitError);
        // Default to 0 remaining in case of error
        set({ dailyBattlesRemaining: 0 });
        return 0;
      }

      const DAILY_BATTLE_LIMIT = 5;

      if (!limitData) {
        // No record for today, user hasn't battled yet
        set({ dailyBattlesRemaining: DAILY_BATTLE_LIMIT });
        return DAILY_BATTLE_LIMIT;
      }

      // Calculate remaining battles
      const remaining = Math.max(
        0,
        DAILY_BATTLE_LIMIT - limitData.battles_used
      );
      set({ dailyBattlesRemaining: remaining });
      return remaining;
    } catch (error) {
      console.error("Error checking daily battle limit:", error);
      set({ dailyBattlesRemaining: 0 });
      return 0;
    }
  },

  resetDailyBattleLimit: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const userId = userData.user.id;
      const today = new Date().toISOString().split("T")[0];

      // Delete today's record if it exists
      await supabase
        .from("battle_limits")
        .delete()
        .eq("user_id", userId)
        .eq("date", today);

      set({ dailyBattlesRemaining: 5 });
    } catch (error) {
      console.error("Error resetting battle limit:", error);
    }
  },

  fetchBattleHistory: async () => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const userData = await supabase.auth.getUser();
      if (!userData.data.user) {
        console.log("No user found, can't fetch battle history");
        set({ battleHistory: [], loading: false });
        return;
      }

      // Get the user's Digimon
      const { data: userDigimon } = await supabase
        .from("user_digimon")
        .select("id")
        .eq("user_id", userData.data.user.id)
        .single();

      if (!userDigimon) {
        console.log("No Digimon found for user, can't fetch battle history");
        set({ battleHistory: [], loading: false });
        return;
      }

      console.log("Found user Digimon:", userDigimon.id);

      // Fetch only battles where the user's Digimon was the initiator (user_digimon_id)
      // This means the user queued for this battle
      const { data, error } = await supabase
        .from("battles")
        .select(
          `
          *,
          user_digimon:user_digimon_id (
            id, name, digimon_id, current_level, user_id,
            digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
          ),
          opponent_digimon:opponent_digimon_id (
            id, name, digimon_id, current_level, user_id,
            digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
          )
        `
        )
        .eq("user_digimon_id", userDigimon.id) // Only get battles where user was the initiator
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Now fetch profiles separately and add them to the battle data
      if (data && data.length > 0) {
        // Get all user IDs from the battle data
        const userIds = new Set<string>();
        data.forEach((battle) => {
          if (battle.user_digimon?.user_id)
            userIds.add(battle.user_digimon.user_id);
          if (battle.opponent_digimon?.user_id)
            userIds.add(battle.opponent_digimon.user_id);
        });

        // Fetch profiles for these users
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", Array.from(userIds));

        // Create a map of user ID to profile
        const profileMap = new Map();
        if (profiles) {
          profiles.forEach((profile) => {
            profileMap.set(profile.id, profile);
          });
        }

        // Add profiles to the battle data
        const battlesWithProfiles = data.map((battle) => {
          const userDigimonUserId = battle.user_digimon?.user_id;
          const opponentDigimonUserId = battle.opponent_digimon?.user_id;

          return {
            ...battle,
            user_digimon: {
              ...battle.user_digimon,
              profile: userDigimonUserId
                ? profileMap.get(userDigimonUserId)
                : null,
            },
            opponent_digimon: {
              ...battle.opponent_digimon,
              profile: opponentDigimonUserId
                ? profileMap.get(opponentDigimonUserId)
                : null,
            },
          };
        });

        set({ battleHistory: battlesWithProfiles, loading: false });
      } else {
        set({ battleHistory: data || [], loading: false });
      }

      get().checkDailyBattleLimit();
    } catch (error) {
      console.error("Error fetching battle history:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  queueForBattle: async (userDigimonId: string) => {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ error: "User not authenticated", loading: false });
        return;
      }

      const userId = userData.user.id;
      const today = new Date().toISOString().split("T")[0];
      const DAILY_BATTLE_LIMIT = 5;

      // Start a transaction to handle the battle limit check and update atomically
      const { data: limitCheck, error: limitError } = await supabase.rpc(
        "check_and_increment_battle_limit",
        {
          p_user_id: userId,
          p_date: today,
          p_limit: DAILY_BATTLE_LIMIT,
        }
      );

      if (limitError) {
        console.error("Error checking battle limit:", limitError);
        set({ error: "Error checking battle limit", loading: false });
        return;
      }

      // If the function returns false, the user has reached their limit
      if (!limitCheck) {
        set({
          error:
            "You've reached your daily battle limit of 5 battles. Try again tomorrow!",
          loading: false,
        });
        return;
      }

      // If we get here, the battle limit has been checked and incremented successfully
      // Continue with the battle logic
      set({ loading: true, error: null });

      // Get the user's Digimon data
      const { data: userDigimonData, error: userDigimonError } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
        `
        )
        .eq("id", userDigimonId)
        .single();

      if (userDigimonError) throw userDigimonError;
      if (!userDigimonData) throw new Error("Could not find your Digimon");
      console.log("Found user Digimon:", userDigimonData.name);

      // Get the user's profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", userDigimonData.user_id)
        .single();

      // Find a random opponent - exclude the current user's Digimon
      const { data: opponents, error: opponentsError } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
        `
        )
        .neq("user_id", userDigimonData.user_id)
        .limit(100);

      console.log("opponents", opponents);

      if (opponentsError) throw opponentsError;

      // If no opponents found, create a dummy opponent
      let opponent;
      let opponentProfile = null;

      // chance to create a dummy opponent
      if (!opponents || opponents.length === 0 || Math.random() < 0.05) {
        console.log("No opponents found, creating a dummy opponent");

        const randomId = Math.floor(Math.random() * 341) + 1;

        // Get a random Digimon from the database
        const { data: randomDigimon } = await supabase
          .from("digimon")
          .select("*")
          .eq("digimon_id", randomId)
          .limit(1)
          .single();

        if (!randomDigimon) {
          throw new Error(
            "Could not create a dummy opponent. Try again later."
          );
        }

        // Create a dummy opponent based on a random Digimon
        opponent = {
          id: "dummy-" + Date.now(),
          name: randomDigimon.name,
          digimon_id: randomDigimon.id,
          current_level: Math.max(1, userDigimonData.current_level - 2), // Slightly lower level
          user_id: "dummy",
          digimon: randomDigimon,
        };

        // Create a dummy profile
        opponentProfile = {
          username: "Wild",
          display_name: "Wild",
        };
      } else {
        // Pick a random opponent from the list
        opponent = opponents[Math.floor(Math.random() * opponents.length)];

        // Get the opponent's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, display_name")
          .eq("id", opponent.user_id)
          .single();

        opponentProfile = profile;
      }

      // Add the opponent's Digimon to the discovered Digimon list
      await useDigimonStore
        .getState()
        .addDiscoveredDigimon(opponent.digimon_id);

      console.log("Selected opponent:", opponent.name);

      // Add profiles to the Digimon objects
      const userDigimonWithProfile = {
        ...userDigimonData,
        profile: userProfile || { username: "You", display_name: "You" },
      };

      const opponentWithProfile = {
        ...opponent,
        profile: opponentProfile || {
          username: "Unknown",
          display_name: "Unknown",
        },
      };

      function simulateBattle(userDigimonData: any, opponent: any) {
        function statModifier(stat: number, level: number) {
          return stat * (1 + (level - 50) / 50);
        }

        let userMaxHP = statModifier(
          userDigimonData.digimon.hp,
          userDigimonData.current_level
        );
        let opponentMaxHP = statModifier(
          opponent.digimon.hp,
          opponent.current_level
        );

        let userHP = statModifier(
          userDigimonData.digimon.hp,
          userDigimonData.current_level
        );
        let opponentHP = statModifier(
          opponent.digimon.hp,
          opponent.current_level
        );

        const turns = [];
        let attacker =
          userDigimonData.digimon.spd >= opponent.digimon.spd
            ? "user"
            : "opponent";

        while (userHP > 0 && opponentHP > 0) {
          const attackPower = statModifier(
            attacker === "user"
              ? userDigimonData.digimon.atk
              : opponent.digimon.atk,
            attacker === "user"
              ? userDigimonData.current_level
              : opponent.current_level
          );
          const defense = statModifier(
            attacker === "user"
              ? opponent.digimon.def
              : userDigimonData.digimon.def,
            attacker === "user"
              ? opponent.current_level
              : userDigimonData.current_level
          );

          const baseDamage = 50;

          const damageMultiplier = 0.5 + Math.random();

          const isCriticalHit = Math.random() < 0.15; // 15% chance
          const criticalMultiplier = isCriticalHit ? 3 : 1;

          // Miss chance
          const didMiss = Math.random() < 0.07; // 7% chance to miss

          const damage = didMiss
            ? 0
            : Math.max(
                1,
                Math.round(
                  (attackPower / (attackPower + defense / 2)) *
                    baseDamage *
                    damageMultiplier *
                    criticalMultiplier
                )
              );

          if (attacker === "user") {
            opponentHP -= damage;
          } else {
            userHP -= damage;
          }

          turns.push({
            attacker,
            damage,
            isCriticalHit,
            didMiss,
            remainingUserHP: (userHP / userMaxHP) * 100,
            remainingOpponentHP: (opponentHP / opponentMaxHP) * 100,
          });

          // Swap turns
          attacker = attacker === "user" ? "opponent" : "user";
        }

        console.log("turns", turns);

        return {
          winnerId: userHP > 0 ? userDigimonData.id : opponent.id,
          turns,
        };
      }

      // Determine winner
      const { winnerId, turns } = simulateBattle(userDigimonData, opponent);

      // If this is a dummy opponent, don't create a battle record
      if (opponent.id.startsWith("dummy-")) {
        // Create a simulated battle result without inserting into the database
        const simulatedBattle = {
          id: "simulated-" + Date.now(),
          user_digimon_id: userDigimonId,
          opponent_digimon_id: opponent.id,
          winner_digimon_id: winnerId,
          created_at: new Date().toISOString(),
          user_digimon: userDigimonWithProfile,
          opponent_digimon: opponentWithProfile,
          // Add the detailed information
          user_digimon_details: {
            name: userDigimonData.name,
            level: userDigimonData.current_level,
            digimon_id: userDigimonData.digimon_id,
            sprite_url: userDigimonData.digimon.sprite_url,
            digimon_name: userDigimonData.digimon.name,
          },
          opponent_digimon_details: {
            name: opponent.name,
            level: opponent.current_level,
            digimon_id: opponent.digimon_id,
            sprite_url: opponent.digimon.sprite_url,
            digimon_name: opponent.digimon.name,
          },
          turns,
        };

        // Award XP for battle and check for level up
        if (winnerId === userDigimonId) {
          // Award more XP for winning
          const newXP = userDigimonData.experience_points + 15;
          await useDigimonStore.getState().updateDigimonStats({
            experience_points: newXP,
          });

          // Check for level up
          await useDigimonStore.getState().checkLevelUp();
        } else {
          // Award some XP even for losing
          const newXP = userDigimonData.experience_points + 5;
          await useDigimonStore.getState().updateDigimonStats({
            experience_points: newXP,
          });

          // Check for level up
          await useDigimonStore.getState().checkLevelUp();
        }

        // Update state with battle result
        set({
          currentBattle: simulatedBattle as Battle,
          loading: false,
        });

        return;
      }

      // Create battle record with detailed Digimon information
      const { data: battle, error: battleError } = await supabase
        .from("battles")
        .insert({
          user_digimon_id: userDigimonId,
          opponent_digimon_id: opponent.id,
          winner_digimon_id: winnerId,
          // Store additional information about the Digimon at battle time
          user_digimon_details: {
            name: userDigimonData.name,
            level: userDigimonData.current_level,
            digimon_id: userDigimonData.digimon_id,
            sprite_url: userDigimonData.digimon.sprite_url,
            digimon_name: userDigimonData.digimon.name,
          },
          opponent_digimon_details: {
            name: opponent.name,
            level: opponent.current_level,
            digimon_id: opponent.digimon_id,
            sprite_url: opponent.digimon.sprite_url,
            digimon_name: opponent.digimon.name,
          },
        })
        .select(
          `
          *,
          user_digimon:user_digimon_id (
            id, name, digimon_id, current_level, user_id,
            digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
          ),
          opponent_digimon:opponent_digimon_id (
            id, name, digimon_id, current_level, user_id,
            digimon:digimon_id (name, sprite_url, hp, atk, def, spd)
          )
        `
        )
        .single();

      if (battleError) throw battleError;

      // Add profiles to the battle data
      const battleWithProfiles = {
        ...battle,
        user_digimon: {
          ...battle.user_digimon,
          profile: userProfile,
        },
        opponent_digimon: {
          ...battle.opponent_digimon,
          profile: opponentProfile,
        },
        turns: turns,
      };

      // Award XP for battle and check for level up
      if (winnerId === userDigimonId) {
        // Award more XP for winning
        const newXP = userDigimonData.experience_points + 15;
        await useDigimonStore.getState().updateDigimonStats({
          experience_points: newXP,
        });

        // Check for level up
        await useDigimonStore.getState().checkLevelUp();
      } else {
        // Award some XP even for losing
        const newXP = userDigimonData.experience_points + 5;
        await useDigimonStore.getState().updateDigimonStats({
          experience_points: newXP,
        });

        // Check for level up
        await useDigimonStore.getState().checkLevelUp();
      }

      // Update state with battle result
      set({
        currentBattle: battleWithProfiles as Battle,
        loading: false,
      });

      // Refresh battle history
      await get().fetchBattleHistory();

      // Update the remaining battles count - we already know it's been decremented by 1
      await get().checkDailyBattleLimit(); // Refresh the count from the database
    } catch (error) {
      console.error("Error queueing for battle:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearCurrentBattle: () => {
    set({ currentBattle: null });
  },
}));
