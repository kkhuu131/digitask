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
}

interface BattleState {
  battleHistory: Battle[];
  currentBattle: Battle | null;
  loading: boolean;
  error: string | null;
  fetchBattleHistory: () => Promise<void>;
  queueForBattle: (userDigimonId: string) => Promise<void>;
  clearCurrentBattle: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battleHistory: [],
  currentBattle: null,
  loading: false,
  error: null,

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
    } catch (error) {
      console.error("Error fetching battle history:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  queueForBattle: async (userDigimonId: string) => {
    try {
      set({ loading: true, error: null });
      console.log("Queueing for battle with Digimon ID:", userDigimonId);

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

      // 2% chance to create a dummy opponent
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

      // Simple battle simulation
      const userStats = {
        hp: userDigimonData.digimon.hp,
        atk: userDigimonData.digimon.atk,
        def: userDigimonData.digimon.def,
        spd: userDigimonData.digimon.spd,
        level: userDigimonData.current_level,
      };

      const opponentStats = {
        hp: opponent.digimon.hp,
        atk: opponent.digimon.atk,
        def: opponent.digimon.def,
        spd: opponent.digimon.spd,
        level: opponent.current_level,
      };

      // Apply level multipliers
      const userMultiplier = 1 + userStats.level * 0.1;
      const opponentMultiplier = 1 + opponentStats.level * 0.1;

      // Calculate battle power
      const userPower =
        (userStats.hp * 0.5 +
          userStats.atk * 1.2 +
          userStats.def * 0.8 +
          userStats.spd * 1.0) *
        userMultiplier;
      const opponentPower =
        (opponentStats.hp * 0.5 +
          opponentStats.atk * 1.2 +
          opponentStats.def * 0.8 +
          opponentStats.spd * 1.0) *
        opponentMultiplier;

      // Add some randomness
      const userRoll = userPower * (0.8 + Math.random() * 0.4); // 80% to 120% of power
      const opponentRoll = opponentPower * (0.8 + Math.random() * 0.4);

      console.log(
        `Rolls: ${userRoll.toFixed(2)} vs ${opponentRoll.toFixed(2)}`
      );

      // Determine winner
      const winnerId = userRoll >= opponentRoll ? userDigimonId : opponent.id;

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
    } catch (error) {
      console.error("Error queueing for battle:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearCurrentBattle: () => {
    set({ currentBattle: null });
  },
}));
