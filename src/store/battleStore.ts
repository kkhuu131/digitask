import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";

type DigimonType = "Vaccine" | "Virus" | "Data" | "Free";

const TypeAdvantageMap: Record<DigimonType, Record<DigimonType, number>> = {
  Vaccine: {
    Virus: 2.0,
    Data: 0.5,
    Vaccine: 1.0,
    Free: 1.0,
  },
  Virus: {
    Data: 2.0,
    Vaccine: 0.5,
    Virus: 1.0,
    Free: 1.0,
  },
  Data: {
    Vaccine: 2.0,
    Virus: 0.5,
    Data: 1.0,
    Free: 1.0,
  },
  Free: {
    Vaccine: 1.0,
    Virus: 1.0,
    Data: 1.0,
    Free: 1.0,
  },
};

type DigimonAttribute =
  | "Plant"
  | "Water"
  | "Fire"
  | "Electric"
  | "Wind"
  | "Earth"
  | "Dark"
  | "Light"
  | "Neutral";

const AttributeAdvantageMap: Record<
  DigimonAttribute,
  Record<DigimonAttribute, number>
> = {
  Plant: {
    Plant: 1.0,
    Water: 1.5,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Water: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.5,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Fire: {
    Plant: 1.5,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Electric: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.5,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Wind: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.5,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Earth: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.5,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
  Dark: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.5,
    Neutral: 1.0,
  },
  Light: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.5,
    Light: 1.0,
    Neutral: 1.0,
  },
  Neutral: {
    Plant: 1.0,
    Water: 1.0,
    Fire: 1.0,
    Electric: 1.0,
    Wind: 1.0,
    Earth: 1.0,
    Dark: 1.0,
    Light: 1.0,
    Neutral: 1.0,
  },
};

function statModifier(stat: number, level: number) {
  if (level <= 50) {
    // From level 1 to 50, scale stat from 1/3x to 1x
    return stat * (1 / 3 + (level - 1) * (2 / 3 / 49));
  } else {
    // From level 50 to 99, scale stat from 1x to 2x
    return stat * (1 + (level - 50) * (1 / 49));
  }
}

function calculateCritMultiplier(SP: number, baseCritMultiplier: number = 1.5) {
  const SPModifier = 0.01 * SP;
  const critMultiplier = baseCritMultiplier + SPModifier;

  return critMultiplier;
}

const baseDamage = 175;
const missChance = 0.07;
const criticalHitChance = 0.125;
const baseCritMultiplier = 1.3;

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
    attacker: any;
    target: any;
    damage: number;
    isCriticalHit: boolean;
    didMiss: boolean;
    remainingUserHP: number;
    remainingOpponentHP: number;
  }[];
}

export interface TeamBattle {
  id: string;
  user_team: {
    current_level: number;
    experience_points: number;
    user_id: string;
    id: string;
    name: string;
    level: number;
    digimon_id: number;
    sprite_url: string;
    digimon_name: string;
    profile: {
      username: string;
      display_name: string;
    };
    stats?: {
      hp: number;
    };
  }[];
  opponent_team: {
    current_level: number;
    experience_points: number;
    user_id: string;
    id: string;
    name: string;
    level: number;
    digimon_id: number;
    sprite_url: string;
    digimon_name: string;
    profile: {
      username: string;
      display_name: string;
    };
    stats?: {
      hp: number;
    };
  }[];
  turns?: {
    attacker: any;
    target: any;
    damage: number;
    isCriticalHit: boolean;
    didMiss: boolean;
    remainingHP: {
      [key: string]: number;
    };
  }[];
  winner_id: string;
  created_at: string;
}

export interface TeamBattleHistory {
  user_id: string;
  opponent_id: string;
  winner_id: string;
  id: string;
  user_team: {
    current_level: number;
    experience_points: number;
    digimon: {
      name: string;
      sprite_url: string;
    };
    digimon_id: number;
    happiness: number;
    name: string;
    id: string;
  }[];
  opponent_team: {
    current_level: number;
    experience_points: number;
    digimon: {
      name: string;
      sprite_url: string;
    };
    digimon_id: number;
    happiness: number;
    name: string;
    id: string;
  }[];
  turns?: {
    attacker: any;
    target: any;
    damage: number;
    isCriticalHit: boolean;
    didMiss: boolean;
    remainingHP: {
      [key: string]: number;
    };
  }[];
  created_at: string;
  user?: {
    username: string;
  };
  opponent?: {
    username: string;
  };
}

interface BattleState {
  teamBattleHistory: TeamBattleHistory[];
  battleHistory: Battle[];
  currentBattle: Battle | null;
  currentTeamBattle: TeamBattle | null;
  loading: boolean;
  error: string | null;
  dailyBattlesRemaining: number;
  fetchBattleHistory: () => Promise<void>;
  fetchTeamBattleHistory: () => Promise<void>;
  queueForBattle: (userDigimonId: string) => Promise<void>;
  queueForTeamBattle: () => Promise<void>;
  clearCurrentBattle: () => void;
  clearCurrentTeamBattle: () => void;
  checkDailyBattleLimit: () => Promise<number>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battleHistory: [],
  teamBattleHistory: [],
  currentBattle: null,
  currentTeamBattle: null,
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

      // Check if we have a battle_limits record for today
      const { data: limitData, error: limitError } = await supabase
        .from("battle_limits")
        .select("*")
        .eq("user_id", userId)
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
        .eq("is_active", true)
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

  fetchTeamBattleHistory: async () => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No user found, can't fetch battle history");
        set({ battleHistory: [], loading: false });
        return;
      }

      // Fetch only battles where the user was the initiator
      const { data, error } = await supabase
        .from("team_battles")
        .select(
          `
          id,
          user_id,
          opponent_id,
          winner_id,
          created_at,
          user_team,
          opponent_team,
          turns,
          user:profiles!team_battles_user_id_fkey1(username),
          opponent:profiles!team_battles_opponent_id_fkey(username)
        `
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Add a type assertion to tell TypeScript about the actual structure
      const transformedData =
        data?.map((battle) => ({
          ...battle,
          user: { username: (battle.user as any)?.username || "You" },
          opponent: {
            username: (battle.opponent as any)?.username || "Opponent",
          },
        })) || [];

      set({ teamBattleHistory: transformedData || [], loading: false });

      get().checkDailyBattleLimit();
    } catch (error) {
      console.error("Error fetching team battle history:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  queueForBattle: async (userDigimonId: string) => {
    try {
      console.log("queueForBattle", userDigimonId);
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ error: "User not authenticated", loading: false });
        return;
      }

      // Start a transaction to handle the battle limit check and update atomically
      const { data: limitCheck, error: limitError } = await supabase.rpc(
        "check_and_increment_battle_limit"
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
          digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd)
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
          digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd)
        `
        )
        .neq("user_id", userDigimonData.user_id)
        .eq("is_active", true)
        .limit(100);

      console.log("opponents", opponents);

      if (opponentsError) throw opponentsError;

      // If no opponents found, create a dummy opponent
      let opponent;
      let opponentProfile = null;

      // chance to create a dummy opponent
      if (!opponents || opponents.length === 0 || Math.random() < 0.25) {
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
              ? Math.max(
                  userDigimonData.digimon.atk,
                  userDigimonData.digimon.int
                )
              : Math.max(opponent.digimon.atk, opponent.digimon.int),
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

          const sp = statModifier(
            attacker === "user"
              ? opponent.digimon.sp
              : userDigimonData.digimon.sp,
            attacker === "user"
              ? opponent.current_level
              : userDigimonData.current_level
          );

          const damageMultiplier = 0.5 + Math.random();

          const isCriticalHit = Math.random() < criticalHitChance;
          const criticalMultiplier = isCriticalHit
            ? calculateCritMultiplier(sp, baseCritMultiplier)
            : 1;

          const didMiss = Math.random() < missChance;

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
        let xpGain = 10;

        if (winnerId === userDigimonId) {
          xpGain += 20;
        }

        const { error: updateError } = await supabase
          .from("user_digimon")
          .update({
            experience_points: userDigimonData.experience_points + xpGain,
          })
          .eq("id", userDigimonId);

        if (updateError) {
          console.error("Error updating XP:", updateError);
          throw updateError;
        }

        // Check for level up
        await useDigimonStore.getState().checkLevelUp();

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
      let xpGain = 10;

      if (winnerId === userDigimonId) {
        xpGain += 20;
      }

      const { error: updateError } = await supabase
        .from("user_digimon")
        .update({
          experience_points: userDigimonData.experience_points + xpGain,
        })
        .eq("id", userDigimonId);

      if (updateError) {
        console.error("Error updating XP:", updateError);
        throw updateError;
      }

      // Check for level up
      await useDigimonStore.getState().checkLevelUp();

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

  queueForTeamBattle: async () => {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ error: "User not authenticated", loading: false });
        return;
      }

      // Start a transaction to handle the battle limit check and update atomically
      const { data: limitCheck, error: limitError } = await supabase.rpc(
        "check_and_increment_battle_limit"
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

      set({ loading: true, error: null });

      // Get the all user Digimon's data
      const { data: userTeamData, error: userDigimonError } = await supabase
        .from("user_digimon")
        .select(
          `
          *,
          digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd, type, attribute)
        `
        )
        .eq("user_id", userData.user.id)
        .eq("is_on_team", true)
        .limit(3);

      if (userDigimonError) throw userDigimonError;
      if (!userTeamData) throw new Error("Could not find your Digimon");

      // Get the user's profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", userData.user.id)
        .single();

      // Find a random opponent - exclude the current user's Digimon
      const { data: opponents, error: opponentsError } = await supabase.rpc(
        "get_opponents_with_digimon",
        {
          limit_count: 100,
          exclude_user: userData.user.id,
        }
      );

      if (opponentsError) throw opponentsError;

      // Pick a random opponent from the list
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];

      // Get the opponent's profile
      const { data: opponentProfile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", opponent.id)
        .single();

      // Get the opponent's Digimon
      const { data: opponentTeamData, error: opponentDigimonError } =
        await supabase
          .from("user_digimon")
          .select(
            `
          *,
          digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd, type, attribute)
        `
          )
          .eq("user_id", opponent.id)
          .limit(3);

      if (opponentDigimonError) throw opponentDigimonError;
      if (!opponentTeamData) throw new Error("Could not find your Digimon");

      // Add the opponent's Digimon to the discovered Digimon list
      for (const digimon of opponentTeamData) {
        await useDigimonStore
          .getState()
          .addDiscoveredDigimon(digimon.digimon.id);
      }

      function simulateTeamBattle(userTeamData: any, opponentTeamData: any) {
        function modifyStats(digimon: any) {
          return {
            hp: statModifier(digimon.digimon.hp, digimon.current_level),
            atk: statModifier(digimon.digimon.atk, digimon.current_level),
            def: statModifier(digimon.digimon.def, digimon.current_level),
            sp: statModifier(digimon.digimon.sp, digimon.current_level),
            int: statModifier(digimon.digimon.int, digimon.current_level),
            spd: statModifier(digimon.digimon.spd, digimon.current_level),
          };
        }

        function getAttributeDamageMultiplier(
          attacker: DigimonAttribute,
          defender: DigimonAttribute
        ): number {
          return AttributeAdvantageMap[attacker][defender] ?? 1.0;
        }

        function getTypeDamageMultiplier(
          attacker: DigimonType,
          defender: DigimonType
        ): number {
          return TypeAdvantageMap[attacker][defender] ?? 1.0;
        }

        for (const digimon of [...userTeamData, ...opponentTeamData]) {
          const stats = modifyStats(digimon);
          Object.assign(digimon.digimon, {
            ...stats,
            current_hp: stats.hp,
          });
        }

        const turns = [];

        const getAliveDigimon = (team: any) => {
          return team.filter((digimon: any) => digimon.digimon.current_hp > 0);
        };

        const allCombatants = [
          ...getAliveDigimon(userTeamData).map((d: any) => ({
            digimon: d.digimon,
            team: "user",
            id: d.id,
          })),
          ...getAliveDigimon(opponentTeamData).map((d: any) => ({
            digimon: d.digimon,
            team: "opponent",
            id: d.id,
          })),
        ];

        allCombatants.sort((a, b) => b.digimon.spd - a.digimon.spd);

        while (
          getAliveDigimon(userTeamData).length > 0 &&
          getAliveDigimon(opponentTeamData).length > 0
        ) {
          for (const combatant of allCombatants) {
            const digimonHPMap: Record<string, number> = {};

            for (const digimon of [...userTeamData, ...opponentTeamData]) {
              digimonHPMap[digimon.id] = digimon.digimon.current_hp;
            }

            const attacker = combatant.digimon;
            if (attacker.current_hp <= 0) continue;

            const targetTeam =
              combatant.team === "user" ? opponentTeamData : userTeamData;
            const targets = getAliveDigimon(targetTeam);

            if (targets.length === 0) break;

            const target = targets[Math.floor(Math.random() * targets.length)];

            const attackPower = Math.max(attacker.atk, attacker.int);
            const defense = target.digimon.def;
            const sp = target.digimon.sp;

            const damageMultiplier = 0.8 + Math.random() * 0.4;
            const isCriticalHit = Math.random() < criticalHitChance;

            const typeMultiplier = getTypeDamageMultiplier(
              attacker.type,
              target.digimon.type
            );
            const attributeMultiplier = getAttributeDamageMultiplier(
              attacker.attribute,
              target.digimon.attribute
            );

            const didMiss = Math.random() < missChance;

            const damage = didMiss
              ? 0
              : Math.max(
                  1,
                  Math.round(
                    (attackPower / (attackPower + defense / 2)) *
                      baseDamage *
                      damageMultiplier *
                      (isCriticalHit ? calculateCritMultiplier(sp) : 1) *
                      typeMultiplier *
                      attributeMultiplier
                  )
                );

            target.digimon.current_hp = Math.max(
              0,
              target.digimon.current_hp - damage
            );

            digimonHPMap[target.id] = Math.max(
              0,
              digimonHPMap[target.id] - damage
            );

            turns.push({
              attacker: combatant,
              target,
              damage,
              isCriticalHit,
              didMiss,
              remainingHP: { ...digimonHPMap },
            });
          }
        }

        const userAlive = getAliveDigimon(userTeamData).length;

        if (userAlive > 0) {
          return {
            winnerId: userTeamData[0].user_id,
            turns,
          };
        } else {
          return {
            winnerId: opponentTeamData[0].user_id,
            turns,
          };
        }
      }

      // Determine winner
      const { winnerId, turns } = simulateTeamBattle(
        userTeamData,
        opponentTeamData
      );

      const simulatedTeamBattle = {
        user_team: userTeamData.map((d) => ({
          user_id: d.user_id,
          current_level: d.current_level,
          experience_points: d.experience_points,
          id: d.id,
          name: d.name,
          level: d.current_level,
          digimon_id: d.digimon_id,
          sprite_url: d.digimon.sprite_url,
          digimon_name: d.digimon.name,
          profile: {
            username: userProfile?.username ?? "You",
            display_name: userProfile?.display_name ?? "You",
          },
          stats: {
            hp: d.digimon.hp,
          },
        })),
        opponent_team: opponentTeamData.map((d) => ({
          user_id: d.user_id,
          current_level: d.current_level,
          experience_points: d.experience_points,
          id: d.id,
          name: d.name,
          level: d.current_level,
          digimon_id: d.digimon_id,
          sprite_url: d.digimon.sprite_url,
          digimon_name: d.digimon.name,
          profile: {
            username: opponentProfile?.username ?? "Unknown",
            display_name: opponentProfile?.display_name ?? "Unknown",
          },
          stats: {
            hp: d.digimon.hp,
          },
        })),
        turns,
        winner_id: winnerId,
      };

      const { error: TeamBattleError } = await supabase
        .from("team_battles")
        .insert({
          user_id: userData.user.id,
          opponent_id: opponent.id,
          winner_id: winnerId,
          user_team: userTeamData,
          opponent_team: opponentTeamData,
          created_at: new Date().toISOString(),
          turns: turns,
        });

      if (TeamBattleError) throw TeamBattleError;

      let xpGain = 10;

      if (winnerId === userTeamData[0].user_id) {
        xpGain += 20;
      }

      const allUserDigimon = useDigimonStore.getState().allUserDigimon;

      // Update each Digimon with the XP gain
      for (const digimon of allUserDigimon) {
        const { error: updateError } = await supabase
          .from("user_digimon")
          .update({
            experience_points: digimon.experience_points + xpGain,
          })
          .eq("id", digimon.id);

        if (updateError) {
          console.error("Error updating XP:", updateError);
          throw updateError;
        }
      }

      set({
        currentTeamBattle: simulatedTeamBattle as TeamBattle,
        loading: false,
      });

      return;
    } catch (error) {
      console.error("Error queueing for team battle:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearCurrentBattle: () => {
    set({ currentBattle: null });
  },

  clearCurrentTeamBattle: () => {
    set({ currentTeamBattle: null });
  },
}));
