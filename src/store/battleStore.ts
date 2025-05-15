import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "./petStore";
import { useTaskStore } from "./taskStore";
import { calculateFinalStats } from "../utils/digimonStatCalculation";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { useTitleStore } from "./titleStore";

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

  const usedIds = new Set();
  for (const digimon of [...userTeamData, ...opponentTeamData]) {
    if (usedIds.has(digimon.id)) {
      console.error("Duplicate Digimon ID detected:", digimon.id);
      throw new Error("Duplicate Digimon ID detected");
    }
    usedIds.add(digimon.id);
  }

  for (const digimon of [...userTeamData, ...opponentTeamData]) {
    const stats = calculateFinalStats(digimon);
    Object.assign(digimon.digimon, {
      final_hp: stats.hp,
      final_atk: stats.atk,
      final_int: stats.int,
      final_spd: stats.spd,
      final_def: stats.def,
      final_sp: stats.sp,
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

  allCombatants.sort((a, b) => b.digimon.final_spd - a.digimon.final_spd);

  const digimonHPMap: Record<string, number> = {};
  for (const digimon of [...userTeamData, ...opponentTeamData]) {
    digimonHPMap[digimon.id] = digimon.digimon.final_hp;
  }

  const isTeamAlive = (team: any[], hpMap: Record<string, number>) => {
    return team.some((digimon) => hpMap[digimon.id] > 0);
  };

  battleLoop: while (true) {
    // Use labeled loop for clean break
    // Check if either team is defeated before starting the round
    if (
      !isTeamAlive(userTeamData, digimonHPMap) ||
      !isTeamAlive(opponentTeamData, digimonHPMap)
    ) {
      break;
    }

    for (const combatant of allCombatants) {
      // Check if either team is defeated before each attack
      if (
        !isTeamAlive(userTeamData, digimonHPMap) ||
        !isTeamAlive(opponentTeamData, digimonHPMap)
      ) {
        break battleLoop;
      }

      // Use current HP map to check if attacker is alive
      if (digimonHPMap[combatant.id] <= 0) continue;

      const targetTeam =
        combatant.team === "user" ? opponentTeamData : userTeamData;
      // Use current HP map to get alive targets
      const targets = targetTeam.filter((d: any) => digimonHPMap[d.id] > 0);

      if (targets.length === 0) break battleLoop;

      const target = targets[Math.floor(Math.random() * targets.length)];

      let attackPower = 1;

      if (combatant.digimon.final_atk >= combatant.digimon.final_int) {
        attackPower = combatant.digimon.final_atk / target.digimon.final_def;
      } else {
        attackPower = combatant.digimon.final_int / target.digimon.final_int;
      }

      const sp = target.digimon.final_sp;

      const damageMultiplier = 0.8 + Math.random() * 0.4;
      const isCriticalHit = Math.random() < criticalHitChance;

      const typeMultiplier = getTypeDamageMultiplier(
        combatant.digimon.type,
        target.digimon.type
      );
      const attributeMultiplier = getAttributeDamageMultiplier(
        combatant.digimon.attribute,
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

  // Use final HP map to determine winner
  const userAlive = isTeamAlive(userTeamData, digimonHPMap);

  return {
    winnerId: userAlive ? userTeamData[0].user_id : opponentTeamData[0].user_id,
    turns,
  };
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
  hint?: string;
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
  simulateCampaignBattle: (
    userTeamData: any,
    opponentTeamData: any,
    hint?: string,
    description?: string
  ) => Promise<TeamBattle>;
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
        const { data: userTeamRawData, error: userDigimonError } =
          await supabase
            .from("user_digimon")
            .select("*")
            .eq("user_id", userData.user.id)
            .eq("is_on_team", true)
            .limit(3);

        if (userDigimonError) throw userDigimonError;
        if (!userTeamRawData) throw new Error("Could not find your Digimon");

        const userTeamData = userTeamRawData.map((digimon) => ({
          ...digimon,
          digimon: DIGIMON_LOOKUP_TABLE[digimon.digimon_id],
        }));

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
              const { data: digimonRawData } = await supabase
                .from("user_digimon")
                .select("*")
                .eq("id", d.id)
                .single();

              if (!digimonRawData) throw new Error("Could not find Digimon");

              const digimonId = Number(digimonRawData.digimon_id);
              const digimonData = DIGIMON_LOOKUP_TABLE[digimonId];

              return {
                ...digimonRawData,
                digimon: digimonData,
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
              const digimonId = Number(d.id);
              const digimonData = DIGIMON_LOOKUP_TABLE[digimonId];

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
              hp: d.digimon.final_hp,
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
              hp: d.digimon.final_hp,
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

        // If battle was won, update stats and check for titles
        if (winnerId === userTeamData[0].user_id) {
          // Update battle stats in profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("battles_won, battles_completed")
            .eq("id", userData.user.id)
            .single();

          if (!profileError && profile) {
            const newBattlesWon = (profile.battles_won || 0) + 1;
            const newBattlesCompleted = (profile.battles_completed || 0) + 1;

            await supabase
              .from("profiles")
              .update({
                battles_won: newBattlesWon,
                battles_completed: newBattlesCompleted,
              })
              .eq("id", userData.user.id);

            // Check for battle titles
            await useTitleStore.getState().checkBattleTitles(newBattlesWon);
          }
        }

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
        const { data: userTeamRawData } = await supabase
          .from("user_digimon")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("is_on_team", true);

        if (!userTeamRawData || userTeamRawData.length < 1) {
          set({
            error: "You need at least one Digimon on your team",
            loading: false,
          });
          return;
        }

        const userTeam = userTeamRawData.map((d) => ({
          ...d,
          digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id],
        }));

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
              const { data: opponentTeamRawData } = await supabase
                .from("user_digimon")
                .select("*")
                .eq("user_id", opponent.id)
                .eq("is_on_team", true)
                .order("current_level", { ascending: false })
                .limit(3);

              if (opponentTeamRawData && opponentTeamRawData.length > 0) {
                const opponentTeam = opponentTeamRawData.map((d) => ({
                  ...d,
                  digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id],
                }));

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
                        current_level: Math.max(d.level, 1),
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

    simulateCampaignBattle: async (
      userTeamData: any,
      opponentTeamData: any,
      hint?: string,
      description?: string
    ) => {
      try {
        // Determine winner using the existing battle simulation
        const { winnerId, turns } = simulateTeamBattle(
          userTeamData,
          opponentTeamData
        );

        // If campaign battle was won, update stats and check for titles
        // if (winnerId === userTeamData[0].user_id) {
        //   const { data: profile, error: profileError } = await supabase
        //     .from("profiles")
        //     .select("highest_stage_cleared")
        //     .eq("id", userTeamData[0].user_id)
        //     .single();

        //   if (!profileError && profile) {
        //     const newHighestStageCleared = Math.max(
        //       profile.highest_stage_cleared,
        //       stageNumber || 0
        //     );

        //     if ((stageNumber || 0) > profile.highest_stage_cleared) {
        //       await supabase
        //         .from("profiles")
        //         .update({ highest_stage_cleared: newHighestStageCleared })
        //         .eq("id", userTeamData[0].user_id);
        //     }

        //     await useTitleStore
        //       .getState()
        //       .checkCampaignTitles(newHighestStageCleared);
        //   }
        // }

        return {
          id: crypto.randomUUID ? crypto.randomUUID() : "temp-id-" + Date.now(),
          created_at: new Date().toISOString(),
          user_team: userTeamData.map((d: any) => ({
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
              username: "You",
              display_name: "You",
            },
            stats: {
              hp: d.digimon.final_hp,
            },
          })),
          opponent_team: opponentTeamData.map((d: any) => ({
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
              username: "Opponent",
              display_name: "Opponent",
            },
            stats: {
              hp: d.digimon.final_hp,
            },
          })),
          turns,
          winner_id: winnerId,
          xpGain: 0,
          hint: hint || "You're not ready for this battle. Try again later.",
          description: description || "",
        } as TeamBattle;
      } catch (error) {
        console.error("Error in campaign battle:", error);
        throw error;
      }
    },
  };
});
