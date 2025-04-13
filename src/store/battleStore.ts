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

/**
 * Calculates a Digimon's stat at any level using piecewise linear interpolation
 * between known values at levels 1, 50, and 99.
 *
 * @param level The target level (1-99)
 * @param level1Stat The stat value at level 1
 * @param level50Stat The stat value at level 50
 * @param level99Stat The stat value at level 99
 * @returns The interpolated stat value at the target level
 */
export default function statModifier(
  level: number,
  level1Stat: number,
  level50Stat: number,
  level99Stat: number
) {
  const clampedLevel = Math.max(1, Math.min(99, level));

  // Direct return for exact known levels
  if (clampedLevel === 1) return level1Stat;
  if (clampedLevel === 50) return level50Stat;
  if (clampedLevel === 99) return level99Stat;

  // For levels 1-49, interpolate between level 1 and level 50 stats
  if (clampedLevel < 50) {
    // Calculate how far between level 1 and 50 we are (0.0 to 1.0)
    const progress = (clampedLevel - 1) / (50 - 1);
    // Linear interpolation: start + progress * (end - start)
    return Math.round(level1Stat + progress * (level50Stat - level1Stat));
  }

  // For levels 51-99, interpolate between level 50 and level 99 stats
  // Calculate how far between level 50 and 99 we are (0.0 to 1.0)
  const progress = (clampedLevel - 50) / (99 - 50);
  // Linear interpolation: start + progress * (end - start)
  return Math.round(level50Stat + progress * (level99Stat - level50Stat));
}

function calculateCritMultiplier(SP: number) {
  const SPModifier = 0.01 * SP;
  const critMultiplier = baseCritMultiplier + SPModifier;

  return critMultiplier;
}

const baseDamage = 250;
const missChance = 0.07;
const criticalHitChance = 0.125;
const baseCritMultiplier = 1.3;

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
  currentTeamBattle: TeamBattle | null;
  loading: boolean;
  error: string | null;
  dailyBattlesRemaining: number;
  fetchTeamBattleHistory: () => Promise<void>;
  queueForTeamBattle: () => Promise<void>;
  clearCurrentTeamBattle: () => void;
  checkDailyBattleLimit: () => Promise<number>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  teamBattleHistory: [],
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

  fetchTeamBattleHistory: async () => {
    try {
      set({ loading: true, error: null });

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No user found, can't fetch team battle history");
        set({ teamBattleHistory: [], loading: false });
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
          digimon:digimon_id (name, stage, sprite_url, type, attribute, hp, sp, atk, def, int, spd, hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1, hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99)
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

      const wildEncounterChance = Math.max(
        0.05,
        0.33 - opponents.length * 0.01
      );

      // Chance to fight a team of up to 2-3 wild Digimon that match user Digimon level and stage
      if (Math.random() < wildEncounterChance) {
        const wildDigimonTeam = [];

        for (const digimon of userTeamData) {
          const { data: digimonData, error } = await supabase.rpc(
            "get_random_digimon_by_stage",
            {
              stage_param: digimon.digimon.stage,
            }
          );

          if (error) throw error;

          const wildDigimon = digimonData[0];

          wildDigimonTeam.push({
            digimon: wildDigimon,
            current_level: Math.max(1, digimon.current_level - 1),
            digimon_id: wildDigimon.id,
            name: wildDigimon.name,
            user_id: "00000000-0000-0000-0000-000000000000",
            experience_points: 0,
            id: crypto.randomUUID
              ? crypto.randomUUID()
              : "00000000-0000-0000-0000-000000000001",
          });
        }

        // Determine winner
        const { winnerId, turns } = simulateTeamBattle(
          userTeamData,
          wildDigimonTeam
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
          opponent_team: wildDigimonTeam.map((d) => ({
            id: d.id,
            user_id: d.user_id,
            current_level: d.current_level,
            experience_points: d.experience_points,
            name: d.name,
            level: d.current_level,
            digimon_id: d.digimon_id,
            sprite_url: d.digimon.sprite_url,
            digimon_name: d.digimon.name,
            profile: {
              username: "Wild Encounter",
              display_name: "Wild Encounter",
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
            winner_id: winnerId,
            user_team: userTeamData,
            opponent_team: wildDigimonTeam,
            created_at: new Date().toISOString(),
            turns: turns,
          });

        if (TeamBattleError) throw TeamBattleError;

        let xpGain = 10;

        if (winnerId === userTeamData[0].user_id) {
          xpGain += 20;
        }

        await useDigimonStore.getState().feedAllDigimon(xpGain);

        set({
          currentTeamBattle: simulatedTeamBattle as TeamBattle,
          loading: false,
        });

        return;
      }

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
          digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd, type, attribute, hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1, hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99)
        `
          )
          .eq("user_id", opponent.id)
          .order("current_level", { ascending: false })
          .limit(3);

      if (opponentDigimonError) throw opponentDigimonError;
      if (!opponentTeamData) throw new Error("Could not find your Digimon");

      // Add the opponent's Digimon to the discovered Digimon list
      for (const digimon of opponentTeamData) {
        await useDigimonStore
          .getState()
          .addDiscoveredDigimon(digimon.digimon_id);
      }

      function simulateTeamBattle(userTeamData: any, opponentTeamData: any) {
        function modifyStats(digimon: any) {
          return {
            hp: statModifier(
              digimon.current_level,
              digimon.digimon.hp_level1,
              digimon.digimon.hp,
              digimon.digimon.hp_level99
            ),
            atk: statModifier(
              digimon.current_level,
              digimon.digimon.atk_level1,
              digimon.digimon.atk,
              digimon.digimon.atk_level99
            ),
            def: statModifier(
              digimon.current_level,
              digimon.digimon.def_level1,
              digimon.digimon.def,
              digimon.digimon.def_level99
            ),
            sp: statModifier(
              digimon.current_level,
              digimon.digimon.sp_level1,
              digimon.digimon.sp,
              digimon.digimon.sp_level99
            ),
            int: statModifier(
              digimon.current_level,
              digimon.digimon.int_level1,
              digimon.digimon.int,
              digimon.digimon.int_level99
            ),
            spd: statModifier(
              digimon.current_level,
              digimon.digimon.spd_level1,
              digimon.digimon.spd,
              digimon.digimon.spd_level99
            ),
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

      await useDigimonStore.getState().feedAllDigimon(xpGain);

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

  clearCurrentTeamBattle: () => {
    set({ currentTeamBattle: null });
  },
}));
