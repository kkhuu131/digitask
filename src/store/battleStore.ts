import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { useTaskStore } from "./taskStore";

export function modifyStats(digimon: any) {
  const baseStats = {
    hp:
      statModifier(
        digimon.current_level,
        digimon.digimon.hp_level1 ?? 0,
        digimon.digimon.hp ?? 0,
        digimon.digimon.hp_level99 ?? 0
      ) + (digimon.hp_bonus || 0),
    atk:
      statModifier(
        digimon.current_level,
        digimon.digimon.atk_level1 ?? 0,
        digimon.digimon.atk ?? 0,
        digimon.digimon.atk_level99 ?? 0
      ) + (digimon.atk_bonus || 0),
    def:
      statModifier(
        digimon.current_level,
        digimon.digimon.def_level1 ?? 0,
        digimon.digimon.def ?? 0,
        digimon.digimon.def_level99 ?? 0
      ) + (digimon.def_bonus || 0),
    sp:
      statModifier(
        digimon.current_level,
        digimon.digimon.sp_level1 ?? 0,
        digimon.digimon.sp ?? 0,
        digimon.digimon.sp_level99 ?? 0
      ) + (digimon.sp_bonus || 0),
    int:
      statModifier(
        digimon.current_level,
        digimon.digimon.int_level1 ?? 0,
        digimon.digimon.int ?? 0,
        digimon.digimon.int_level99 ?? 0
      ) + (digimon.int_bonus || 0),
    spd:
      statModifier(
        digimon.current_level,
        digimon.digimon.spd_level1 ?? 0,
        digimon.digimon.spd ?? 0,
        digimon.digimon.spd_level99 ?? 0
      ) + (digimon.spd_bonus || 0),
  };

  // Mapping of personality to stat key
  const personalityBoosts: Record<string, keyof typeof baseStats> = {
    Durable: "hp",
    Lively: "sp",
    Fighter: "atk",
    Defender: "def",
    Brainy: "int",
    Nimble: "spd",
  };

  const boostedStats = { ...baseStats };

  const boostKey = personalityBoosts[digimon.personality];
  if (boostKey) {
    boostedStats[boostKey] = Math.floor(boostedStats[boostKey] * 1.05);
  }

  return boostedStats;
}

function simulateTeamBattle(userTeamData: any, opponentTeamData: any) {
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

      let attackPower = 1;

      if (attacker.atk >= attacker.int) {
        attackPower = attacker.atk / target.digimon.def;
      } else {
        attackPower = attacker.int / target.digimon.int;
      }

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
              attackPower *
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

      digimonHPMap[target.id] = Math.max(0, digimonHPMap[target.id] - damage);

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

export type DigimonType = "Vaccine" | "Virus" | "Data" | "Free";

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

export type DigimonAttribute =
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

const baseDamage = 150;
const missChance = 0.07;
const criticalHitChance = 0.125;
const baseCritMultiplier = 1.25;

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
  xpGain: number;
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

interface BattleOption {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  team: {
    user_id: string;
    username: string;
    display_name?: string;
    digimon: {
      id: string;
      name: string;
      current_level: number;
      sprite_url: string;
      type?: string;
      attribute?: string;
    }[];
  };
  isWild: boolean;
}

interface OpponentWithTeam {
  id: string;
  username: string;
  display_name?: string;
  team: any[]; // You can define a more specific type if needed
  avgLevel: number;
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
  battleOptions: BattleOption[];
  selectedBattleOption: BattleOption | null;
  getBattleOptions: (forceRefresh?: boolean) => Promise<void>;
  refreshBattleOptions: () => Promise<void>;
  selectAndStartBattle: (optionId: string) => Promise<void>;
  lastOptionsRefresh: number | null;
  shouldRefreshOptions: boolean;
  setShouldRefreshOptions: (shouldRefresh: boolean) => void;
  isBattleInProgress: boolean;
}

// Add these helper functions at the top of the file
const STORAGE_KEY_OPTIONS = "battle_options";
const STORAGE_KEY_TIMESTAMP = "battle_options_timestamp";
const STORAGE_KEY_SHOULD_REFRESH = "battle_options_should_refresh";

// Helper to save battle options to localStorage
const saveBattleOptionsToStorage = (
  options: BattleOption[],
  timestamp: number,
  shouldRefresh: boolean
) => {
  try {
    localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(options));
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp.toString());
    localStorage.setItem(STORAGE_KEY_SHOULD_REFRESH, shouldRefresh.toString());
  } catch (e) {
    console.error("Failed to save battle options to localStorage:", e);
  }
};

// Helper to load battle options from localStorage
const loadBattleOptionsFromStorage = (): {
  options: BattleOption[];
  timestamp: number | null;
  shouldRefresh: boolean;
} => {
  try {
    const optionsStr = localStorage.getItem(STORAGE_KEY_OPTIONS);
    const timestampStr = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    const shouldRefreshStr = localStorage.getItem(STORAGE_KEY_SHOULD_REFRESH);

    return {
      options: optionsStr ? JSON.parse(optionsStr) : [],
      timestamp: timestampStr ? parseInt(timestampStr, 10) : null,
      shouldRefresh: shouldRefreshStr ? shouldRefreshStr === "true" : true,
    };
  } catch (e) {
    console.error("Failed to load battle options from localStorage:", e);
    return { options: [], timestamp: null, shouldRefresh: true };
  }
};

export const useBattleStore = create<BattleState>((set, get) => {
  // Load initial state from localStorage
  const { options, timestamp, shouldRefresh } = loadBattleOptionsFromStorage();

  return {
    teamBattleHistory: [],
    currentTeamBattle: null,
    loading: false,
    error: null,
    dailyBattlesRemaining: 5,
    battleOptions: options,
    selectedBattleOption: null,
    lastOptionsRefresh: timestamp,
    shouldRefreshOptions: shouldRefresh,
    isBattleInProgress: false,

    selectAndStartBattle: async (optionId: string) => {
      const state = get();

      // If a battle is already in progress, don't start another one
      if (state.loading || state.isBattleInProgress) {
        return;
      }

      // Set both loading and isBattleInProgress flags
      set({ loading: true, isBattleInProgress: true, error: null });

      try {
        const option = state.battleOptions.find((o) => o.id === optionId);

        if (!option) {
          set({
            error: "Invalid battle option",
            loading: false,
            isBattleInProgress: false,
          });
          return;
        }

        // Get user data
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          set({
            error: "User not authenticated",
            loading: false,
            isBattleInProgress: false,
          });
          return;
        }

        // Start a transaction to handle the battle limit check and update atomically
        const { data: limitCheck, error: limitError } = await supabase.rpc(
          "check_and_increment_battle_limit"
        );

        if (limitError) {
          console.error("Error checking battle limit:", limitError);
          set({
            error: "Error checking battle limit",
            loading: false,
            isBattleInProgress: false,
          });
          return;
        }

        // If the function returns false, the user has reached their limit
        if (!limitCheck) {
          set({
            error:
              "You've reached your daily battle limit of 5 battles. Try again tomorrow!",
            loading: false,
            isBattleInProgress: false,
          });
          return;
        }

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

        if (!userProfile) throw new Error("Could not find your profile");

        // Prepare opponent team data
        let opponentTeamData;
        let opponentProfile;

        if (!option.isWild) {
          opponentTeamData = await Promise.all(
            option.team.digimon.map(async (d) => {
              // Get the full Digimon data
              const { data: digimonData } = await supabase
                .from("user_digimon")
                .select(
                  `
              *,
              digimon:digimon_id (name, sprite_url, hp, sp, atk, def, int, spd, type, attribute, hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1, hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99)
            `
                )
                .eq("id", d.id)
                .single();

              return {
                ...digimonData,
              };
            })
          );

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", option.team.user_id)
            .single();

          opponentProfile = profile;
        } else {
          // Create wild Digimon team
          opponentTeamData = await Promise.all(
            option.team.digimon.map(async (d) => {
              // Get the full Digimon data
              const { data: digimonData } = await supabase
                .from("digimon")
                .select("*")
                .eq("id", d.id)
                .single();

              return {
                id: crypto.randomUUID
                  ? crypto.randomUUID()
                  : "00000000-0000-0000-0000-000000000001",
                user_id: "00000000-0000-0000-0000-000000000000",
                digimon_id: d.id,
                name: d.name,
                current_level: d.current_level,
                experience_points: 0,
                happiness: 100,
                digimon: digimonData,
              };
            })
          );

          opponentProfile = {
            id: "wild",
            username: "Wild Digimon",
            display_name: "Wild Digimon",
          };
        }

        // Determine winner
        const { winnerId, turns } = simulateTeamBattle(
          userTeamData,
          opponentTeamData
        );

        const BASE_XP_GAIN = {
          easy: 30,
          medium: 50,
          hard: 70,
        };

        const expModifier = 0.025;

        const opponentTeamAverageLevel =
          opponentTeamData.reduce((sum, d) => sum + d.current_level, 0) /
          opponentTeamData.length;

        const userTeamAverageLevel =
          userTeamData.reduce((sum, d) => sum + d.current_level, 0) /
          userTeamData.length;

        let xpGain =
          BASE_XP_GAIN[option.difficulty] *
          (1 + expModifier * (opponentTeamAverageLevel - userTeamAverageLevel));

        if (winnerId !== userTeamData[0].user_id) xpGain *= 0.12;

        xpGain = Math.max(xpGain, 20);
        xpGain = Math.floor(xpGain);

        // Get the XP multiplier from taskStore
        const expMultiplier = useTaskStore.getState().getExpMultiplier();
        xpGain = Math.round(xpGain * expMultiplier);

        // console.log("xpGain", xpGain);

        // Apply the XP gain to all Digimon
        await useDigimonStore.getState().feedAllDigimon(xpGain);

        const simulatedTeamBattle = {
          id: crypto.randomUUID ? crypto.randomUUID() : "temp-id-" + Date.now(),
          created_at: new Date().toISOString(),
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
          xpGain: xpGain,
        };

        const { error: TeamBattleError } = await supabase
          .from("team_battles")
          .insert({
            user_id: userData.user.id,
            ...(option.isWild ? {} : { opponent_id: option.team.user_id }),
            winner_id: winnerId,
            user_team: userTeamData,
            opponent_team: opponentTeamData,
            created_at: new Date().toISOString(),
            turns: turns,
          });

        if (TeamBattleError) throw TeamBattleError;

        set({
          currentTeamBattle: simulatedTeamBattle as TeamBattle,
          loading: false,
          isBattleInProgress: false,
        });

        // After battle is complete, mark options for refresh
        saveBattleOptionsToStorage(
          get().battleOptions,
          get().lastOptionsRefresh || Date.now(),
          true
        );
        set({ shouldRefreshOptions: true });

        return;
      } catch (error) {
        console.error("Error in battle:", error);
        set({
          error: "An error occurred during battle",
          loading: false,
          isBattleInProgress: false,
        });
      }
    },

    refreshBattleOptions: async () => {
      await get().getBattleOptions();
    },

    getBattleOptions: async (forceRefresh = false) => {
      try {
        const state = get();
        const currentTime = Date.now();

        // Check if we need to refresh options
        if (
          !forceRefresh &&
          state.battleOptions.length > 0 &&
          state.lastOptionsRefresh
        ) {
          // Only refresh if:
          // 1. It's been explicitly marked for refresh (after battle)
          // 2. It's a new day since last refresh
          const lastRefreshDate = new Date(state.lastOptionsRefresh);
          const currentDate = new Date();
          const isNewDay =
            lastRefreshDate.getDate() !== currentDate.getDate() ||
            lastRefreshDate.getMonth() !== currentDate.getMonth() ||
            lastRefreshDate.getFullYear() !== currentDate.getFullYear();

          if (!state.shouldRefreshOptions && !isNewDay) {
            // Use cached options
            return;
          }
        }

        // Set loading state and clear any errors
        set({ loading: true, error: null });

        // Get user's team data
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          set({ error: "User not authenticated", loading: false });
          return;
        }

        // Get user's team
        const { data: userTeam } = await supabase
          .from("user_digimon")
          .select(
            `
          *,
          digimon:digimon_id (id, name, stage, sprite_url, type, attribute)
        `
          )
          .eq("user_id", userData.user.id)
          .eq("is_on_team", true);

        if (!userTeam || userTeam.length < 1) {
          set({
            error: "You need at least one Digimon on your team",
            loading: false,
          });
          return;
        }

        // Calculate level range for difficulty tiers
        const teamLevels = userTeam.map((d) => d.current_level);
        const avgLevel = Math.floor(
          teamLevels.reduce((sum, level) => sum + level, 0) / teamLevels.length
        );

        // Create a new array for battle options
        const battleOptions: BattleOption[] = [];

        // PERFORMANCE IMPROVEMENT: Get all potential opponents and their teams in one go
        const { data: potentialOpponents } = await supabase.rpc(
          "get_random_users",
          { exclude_user_id: userData.user.id }
        );

        // Prepare all opponent teams in parallel instead of sequentially
        let opponentsWithTeams: OpponentWithTeam[] = [];
        if (potentialOpponents && potentialOpponents.length > 0) {
          const opponentPromises = potentialOpponents.map(
            async (opponent: any) => {
              const { data: opponentTeam } = await supabase
                .from("user_digimon")
                .select(
                  `
              *,
              digimon:digimon_id (id, name, stage, sprite_url, type, attribute)
            `
                )
                .eq("user_id", opponent.id)
                .eq("is_on_team", true)
                .order("current_level", { ascending: false })
                .limit(3);

              if (opponentTeam && opponentTeam.length > 0) {
                const avgLevel =
                  opponentTeam.reduce((sum, d) => sum + d.current_level, 0) /
                  opponentTeam.length;

                return {
                  ...opponent,
                  team: opponentTeam,
                  avgLevel,
                };
              }
              return null;
            }
          );

          // Wait for all opponent data to be fetched
          const results = await Promise.all(opponentPromises);
          opponentsWithTeams = results.filter(Boolean) as OpponentWithTeam[];
        }

        // Generate one option for each difficulty level
        const difficulties = ["easy", "medium", "hard"] as const;

        const difficultyMultipliers = {
          easy: { min: 0.5, max: 0.8 },
          medium: { min: 0.8, max: 1.1 },
          hard: { min: 1.1, max: 1.3 },
        };

        const usedOpponentIds = new Set();

        // Process all difficulties in parallel
        await Promise.all(
          difficulties.map(async (difficulty) => {
            let foundRealOpponent = false;

            // Find matching opponent for this difficulty
            let matchingOpponent = null;

            const { min, max } = difficultyMultipliers[difficulty];
            const lower = Math.floor(avgLevel * min);
            const upper = Math.floor(avgLevel * max);

            const possibleOpponents = opponentsWithTeams.filter(
              (o) =>
                o.avgLevel >= lower &&
                o.avgLevel <= upper &&
                !usedOpponentIds.has(o.id)
            );

            if (possibleOpponents.length > 0) {
              matchingOpponent =
                possibleOpponents[
                  Math.floor(Math.random() * possibleOpponents.length)
                ];
            }

            // Add a 50% chance to force a wild encounter even if we found a real opponent
            const forceWildEncounter = Math.random() < 0.5;

            if (opponentsWithTeams.length > 0 && !forceWildEncounter) {
              if (matchingOpponent) {
                usedOpponentIds.add(matchingOpponent.id);
                battleOptions.push({
                  id: `${difficulty}-${matchingOpponent.id}`,
                  difficulty: difficulty,
                  team: {
                    user_id: matchingOpponent.id,
                    username: matchingOpponent.username,
                    display_name: matchingOpponent.display_name,
                    digimon: matchingOpponent.team.map((d: any) => ({
                      id: d.id,
                      name: d.name === "" ? d.digimon.name : d.name,
                      current_level: d.current_level,
                      sprite_url: d.digimon.sprite_url,
                      type: d.digimon.type,
                      attribute: d.digimon.attribute,
                    })),
                  },
                  isWild: false,
                });

                foundRealOpponent = true;
              }
            }

            // If no real opponent found or we're forcing a wild encounter, create a wild encounter
            if (!foundRealOpponent || forceWildEncounter) {
              // Calculate random wild level based on difficulty
              const wildLevelDifficulties = {
                easy: 0.7,
                medium: 0.9,
                hard: 1.2,
              };

              const minCap = avgLevel - 8;
              const maxCap = avgLevel + 8;

              const wildLevel = Math.floor(
                Math.max(
                  minCap,
                  Math.min(maxCap, avgLevel * wildLevelDifficulties[difficulty])
                )
              );

              const teamSize = Math.min(
                3,
                useDigimonStore.getState().allUserDigimon.length
              );

              const { data: wildDigimon } = await supabase.rpc(
                "generate_enemy_team",
                { avg_level: wildLevel }
              );

              console.log("wildDigimon", wildDigimon);

              if (wildDigimon && wildDigimon.length > 0) {
                const randomDigimon =
                  wildDigimon.length > teamSize
                    ? wildDigimon
                        .sort(() => Math.random() - 0.5)
                        .slice(0, teamSize)
                    : wildDigimon;

                battleOptions.push({
                  id: `${difficulty}-wild-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 9)}`,
                  difficulty: difficulty,
                  team: {
                    user_id: "00000000-0000-0000-0000-000000000000",
                    username: "Wild Digimon",
                    digimon: randomDigimon.map((d: any) => {
                      return {
                        id: d.digimon_id,
                        name: d.name,
                        current_level: d.level,
                        sprite_url: d.sprite_url,
                        type: d.type,
                        attribute: d.attribute,
                      };
                    }),
                  },
                  isWild: true,
                });
              }
            }
          })
        );

        // Sort battle options by difficulty (easy, medium, hard)
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        battleOptions.sort(
          (a, b) =>
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
        );

        // At the end, update localStorage along with the state
        saveBattleOptionsToStorage(battleOptions, currentTime, false);
        set({
          battleOptions,
          loading: false,
          lastOptionsRefresh: currentTime,
          shouldRefreshOptions: false,
        });
      } catch (error) {
        console.error("Error getting battle options:", error);
        set({ error: (error as Error).message, loading: false });
      }
    },

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
          .limit(20);

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
            id: crypto.randomUUID
              ? crypto.randomUUID()
              : "temp-id-" + Date.now(),
            created_at: new Date().toISOString(),
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
            xpGain: 0,
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
        const opponent =
          opponents[Math.floor(Math.random() * opponents.length)];

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

        // Determine winner
        const { winnerId, turns } = simulateTeamBattle(
          userTeamData,
          opponentTeamData
        );

        const simulatedTeamBattle = {
          id: crypto.randomUUID ? crypto.randomUUID() : "temp-id-" + Date.now(),
          created_at: new Date().toISOString(),
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
          xpGain: 0,
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
      set({
        currentTeamBattle: null,
        isBattleInProgress: false, // Reset the flag when battle is cleared
      });
    },

    setShouldRefreshOptions: (shouldRefresh: boolean) => {
      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY_SHOULD_REFRESH,
        shouldRefresh.toString()
      );
      set({ shouldRefreshOptions: shouldRefresh });
    },
  };
});
