import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useDigimonStore, UserDigimon } from "./petStore";
// useBattleStore not needed in this file
import { useNotificationStore } from "./notificationStore";
import { useCurrencyStore } from "./currencyStore";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { calculateFinalStats } from "../utils/digimonStatCalculation";

// Types
export interface PresetBossConfig {
  id: number;
  name: string;
  description: string;
  boss_digimon_id: number;
  rotation_order: number;
  stat_multiplier: number;
  special_abilities: string[];
  reward_multiplier: number;
  created_at: string;
}

export interface WeeklyBossEvent {
  id: string;
  week_start_date: string;
  preset_boss_id: number;
  phase: number; // 1 = weakening, 2 = battle, 3 = completed
  global_progress: number;
  target_progress: number;
  total_damage_dealt: number;
  boss_max_hp: number;
  boss_current_hp: number;
  participants_count: number;
  is_defeated: boolean;
  phase_1_end_date: string;
  phase_2_end_date: string;
  created_at: string;
  // Joined data
  boss_name?: string;
  boss_description?: string;
  boss_config?: PresetBossConfig;
}

export interface BossParticipation {
  id: string;
  user_id: string;
  event_id: string;
  tasks_contributed: number;
  battle_attempts: number;
  total_damage_dealt: number;
  best_single_damage: number;
  participation_tier: number; // 0=none, 1=participant, 2=battler, 3=victor
  rewards_claimed: boolean;
  last_battle_at: string | null;
  created_at: string;
}

export interface BossBattleResult {
  id: string;
  event_id: string;
  user_id: string;
  damage_dealt: number;
  battle_duration: number;
  user_team: any[];
  boss_hp_before: number;
  boss_hp_after: number;
  battle_turns: any[];
  created_at: string;
}

export interface BossRewards {
  bits: number;
  experience: number;
  title?: string;
  special_item?: string;
}

export interface WeeklyBossState {
  // Current event data
  currentEvent: WeeklyBossEvent | null;
  userParticipation: BossParticipation | null;
  recentBattles: BossBattleResult[];

  // Loading states
  loading: boolean;
  battleLoading: boolean;
  error: string | null;

  // Boss battle state
  currentBossBattle: any | null;
  dailyBossBattlesRemaining: number;

  // Actions
  fetchCurrentEvent: () => Promise<void>;
  fetchUserParticipation: () => Promise<void>;
  fetchRecentBattles: () => Promise<void>;
  startBossBattle: () => Promise<void>;
  simulateBossBattle: (userTeam: UserDigimon[], boss: any) => Promise<any>;
  claimRewards: () => Promise<void>;
  clearCurrentBattle: () => void;
  debugContribution: () => Promise<void>;
  checkDailyBossBattleLimit: () => Promise<number>;

  // Real-time updates
  subscribeToEventUpdates: () => Promise<() => void>;

  // Helper functions
  getPhaseDescription: () => string;
  getDaysRemaining: () => number;
  getProgressPercentage: () => number;
  getBossHealthPercentage: () => number;
  canBattle: () => boolean;
  getRewardTier: () => number;
  calculateRewards: () => BossRewards | null;
}

// Helper function to create boss Digimon with boosted stats
const createBossDigimon = (config: PresetBossConfig) => {
  const baseDigimon = DIGIMON_LOOKUP_TABLE[config.boss_digimon_id];
  if (!baseDigimon) return null;

  const multiplier = config.stat_multiplier;

  return {
    id: `boss-${config.id}`,
    user_id: "boss",
    digimon_id: config.boss_digimon_id,
    name: config.name,
    current_level: 99,
    experience_points: 999999,
    happiness: 100,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    last_fed_tasks_at: new Date().toISOString(),
    is_active: false,
    is_on_team: true,
    hp_bonus: Math.round(baseDigimon.hp_level99 * (multiplier - 1)),
    sp_bonus: Math.round(baseDigimon.sp_level99 * (multiplier - 1)),
    atk_bonus: Math.round(baseDigimon.atk_level99 * (multiplier - 1)),
    def_bonus: Math.round(baseDigimon.def_level99 * (multiplier - 1)),
    int_bonus: Math.round(baseDigimon.int_level99 * (multiplier - 1)),
    spd_bonus: Math.round(baseDigimon.spd_level99 * (multiplier - 1)),
    abi: 200,
    daily_stat_gains: 0,
    last_stat_reset: new Date().toISOString(),
    personality: "Fighter",
    digimon: baseDigimon,
    is_in_storage: false,
    has_x_antibody: false,
  };
};

// Boss-specific battle simulation that returns TeamBattle-compatible format
const simulateBossBattle = (
  userTeamData: UserDigimon[],
  bossDigimon: UserDigimon,
  specialAbilities: string[]
) => {
  // Convert user team to match the expected format
  const convertedUserTeam = userTeamData.map((digimon) => ({
    ...digimon,
    user_id: digimon.user_id || "",
    id: digimon.id,
    name: digimon.name || digimon.digimon?.name || "",
    level: digimon.current_level,
    digimon_id: digimon.digimon_id,
    sprite_url: digimon.digimon?.sprite_url || "",
    digimon_name: digimon.digimon?.name || "",
    profile: {
      username: "Player",
      display_name: "Player",
    },
    stats: {
      hp: calculateFinalStats(digimon).hp,
    },
    current_level: digimon.current_level,
    experience_points: digimon.experience_points,
    digimon: {
      ...digimon.digimon,
      final_hp: calculateFinalStats(digimon).hp,
      final_atk: calculateFinalStats(digimon).atk,
      final_int: calculateFinalStats(digimon).int,
      final_spd: calculateFinalStats(digimon).spd,
      final_def: calculateFinalStats(digimon).def,
      final_sp: calculateFinalStats(digimon).sp,
      current_hp: calculateFinalStats(digimon).hp,
    },
  }));

  // Convert boss to opponent team format
  const bossStats = calculateFinalStats(bossDigimon);
  const convertedBossTeam = [
    {
      ...bossDigimon,
      user_id: "boss",
      id: bossDigimon.id,
      name: bossDigimon.name || bossDigimon.digimon?.name || "",
      level: bossDigimon.current_level,
      digimon_id: bossDigimon.digimon_id,
      sprite_url: bossDigimon.digimon?.sprite_url || "",
      digimon_name: bossDigimon.digimon?.name || "",
      profile: {
        username: "Boss",
        display_name: bossDigimon.name || "Boss",
      },
      stats: {
        hp: bossStats.hp,
      },
      current_level: bossDigimon.current_level,
      experience_points: bossDigimon.experience_points,
      digimon: {
        ...bossDigimon.digimon,
        final_hp: bossStats.hp,
        final_atk: bossStats.atk,
        final_int: bossStats.int,
        final_spd: bossStats.spd,
        final_def: bossStats.def,
        final_sp: bossStats.sp,
        current_hp: bossStats.hp,
      },
    },
  ];

  // Use the same simulation function as regular battles but with boss modifications
  const simulateBossTeamBattle = (userTeam: any[], bossTeam: any[]) => {
    // Enhanced simulation with boss special abilities
    const MAX_TURNS = 100;
    const turns = [];
    let turnCount = 0;

    // Initialize HP for all combatants
    const digimonHPMap: Record<string, number> = {};
    for (const digimon of [...userTeam, ...bossTeam]) {
      digimonHPMap[digimon.id] = digimon.digimon.final_hp;
      digimon.digimon.current_hp = digimon.digimon.final_hp;
    }

    const getAliveDigimon = (team: any[]) => {
      return team.filter((digimon: any) => digimonHPMap[digimon.id] > 0);
    };

    const isTeamAlive = (team: any[]) => {
      return team.some((digimon) => digimonHPMap[digimon.id] > 0);
    };

    // Combat loop
    while (
      turnCount < MAX_TURNS &&
      isTeamAlive(userTeam) &&
      isTeamAlive(bossTeam)
    ) {
      // Get all alive combatants and sort by speed
      const allCombatants = [
        ...getAliveDigimon(userTeam).map((d: any) => ({ ...d, team: "user" })),
        ...getAliveDigimon(bossTeam).map((d: any) => ({
          ...d,
          team: "opponent",
        })),
      ];

      allCombatants.sort((a, b) => b.digimon.final_spd - a.digimon.final_spd);

      for (const combatant of allCombatants) {
        if (digimonHPMap[combatant.id] <= 0) continue;
        if (!isTeamAlive(userTeam) || !isTeamAlive(bossTeam)) break;

        const targetTeam = combatant.team === "user" ? bossTeam : userTeam;
        const targets = targetTeam.filter((d: any) => digimonHPMap[d.id] > 0);

        if (targets.length === 0) break;

        const target = targets[Math.floor(Math.random() * targets.length)];

        // Calculate damage (same as regular battles)
        const attackerStats = combatant.digimon;
        const targetStats = target.digimon;

        let attackPower = 1;
        if (attackerStats.final_atk >= attackerStats.final_int) {
          attackPower = attackerStats.final_atk / targetStats.final_def;
        } else {
          attackPower = attackerStats.final_int / targetStats.final_int;
        }

        const baseDamage = 150;
        const damageMultiplier = 0.8 + Math.random() * 0.4;
        const isCriticalHit = Math.random() < 0.125;
        const critMultiplier = isCriticalHit
          ? 1.25 + attackerStats.final_sp / 1000
          : 1;
        const didMiss = Math.random() < 0.07;

        // Boss special ability every 5 turns
        let isSpecialAttack = false;
        let specialAbility = null;
        if (
          combatant.team === "opponent" &&
          turnCount % 5 === 0 &&
          specialAbilities.length > 0
        ) {
          isSpecialAttack = true;
          specialAbility =
            specialAbilities[turnCount % specialAbilities.length];
        }

        const specialMultiplier = isSpecialAttack ? 1.5 : 1;

        const damage = didMiss
          ? 0
          : Math.max(
              1,
              Math.round(
                attackPower *
                  baseDamage *
                  damageMultiplier *
                  critMultiplier *
                  specialMultiplier
              )
            );

        // Apply damage
        target.digimon.current_hp = Math.max(
          0,
          target.digimon.current_hp - damage
        );
        digimonHPMap[target.id] = Math.max(0, digimonHPMap[target.id] - damage);

        // Create turn data compatible with TeamBattleAnimation
        turns.push({
          attacker: {
            id: combatant.id,
            team: combatant.team,
            name: combatant.name,
          },
          target: {
            id: target.id,
            team: target.team === "user" ? "user" : "opponent",
            name: target.name,
          },
          damage,
          isCriticalHit,
          didMiss,
          isSpecialAttack,
          specialAbility,
          remainingHP: { ...digimonHPMap },
        });

        turnCount++;
      }
    }

    const userWon = isTeamAlive(userTeam);
    const totalDamageDealt = turns
      .filter((turn) => turn.attacker.team === "user")
      .reduce((total, turn) => total + turn.damage, 0);

    return {
      winnerId: userWon ? userTeam[0].user_id : "boss",
      turns,
      totalDamageDealt,
      battleDuration: turnCount,
    };
  };

  return simulateBossTeamBattle(convertedUserTeam, convertedBossTeam);
};

export const useWeeklyBossStore = create<WeeklyBossState>((set, get) => ({
  // Initial state
  currentEvent: null,
  userParticipation: null,
  recentBattles: [],
  loading: false,
  battleLoading: false,
  error: null,
  currentBossBattle: null,
  dailyBossBattlesRemaining: 5,

  fetchCurrentEvent: async () => {
    try {
      set({ loading: true, error: null });

      // First check if the tables exist by trying to query preset_boss_configs
      const { error: tableError } = await supabase
        .from("preset_boss_configs")
        .select("id")
        .limit(1);

      if (tableError) {
        console.log(
          "Weekly boss tables not found, migration may not be applied:",
          tableError
        );
        set({
          error:
            "Weekly boss system not available yet. Please contact an administrator.",
          loading: false,
          currentEvent: null,
        });
        return;
      }

      const { data, error } = await supabase.rpc(
        "get_current_weekly_boss_event"
      );

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const eventData = data[0];

        // Check if preset_boss_id exists
        if (!eventData.preset_boss_id) {
          // RPC function doesn't return preset_boss_id properly, use direct table query
          console.log("Using direct table query for boss event data...");
          try {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("weekly_boss_events")
              .select(
                `
                *,
                preset_boss_configs(*)
              `
              )
              .order("week_start_date", { ascending: false })
              .limit(1)
              .single();

            if (fallbackError) {
              console.error("Error loading boss event:", fallbackError);
              throw fallbackError;
            }

            if (fallbackData && fallbackData.preset_boss_id) {
              const event: WeeklyBossEvent = {
                id: fallbackData.id,
                week_start_date: fallbackData.week_start_date,
                preset_boss_id: fallbackData.preset_boss_id,
                phase: fallbackData.phase,
                global_progress: fallbackData.global_progress,
                target_progress: fallbackData.target_progress,
                total_damage_dealt: fallbackData.total_damage_dealt || 0,
                boss_max_hp: fallbackData.boss_max_hp,
                boss_current_hp: fallbackData.boss_current_hp,
                participants_count: fallbackData.participants_count,
                is_defeated: fallbackData.boss_current_hp <= 0,
                phase_1_end_date: new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000
                ).toISOString(),
                phase_2_end_date: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
                created_at: fallbackData.created_at,
                boss_name:
                  fallbackData.preset_boss_configs?.name || "Unknown Boss",
                boss_description:
                  fallbackData.preset_boss_configs?.description ||
                  "A powerful boss appears...",
                boss_config: fallbackData.preset_boss_configs,
              };

              set({ currentEvent: event, loading: false });
              return;
            } else {
              throw new Error("No boss event data found");
            }
          } catch (fallbackErr) {
            console.error("Failed to load boss event data:", fallbackErr);
            set({ error: "Unable to load boss event data", loading: false });
            return;
          }
        }

        // Fetch the preset boss config for additional details
        const { data: configData, error: configError } = await supabase
          .from("preset_boss_configs")
          .select("*")
          .eq("id", eventData.preset_boss_id)
          .single();

        if (configError) {
          console.error("Config Error:", configError);
          throw configError;
        }

        const event: WeeklyBossEvent = {
          id: eventData.event_id,
          week_start_date: eventData.week_start_date,
          preset_boss_id: eventData.preset_boss_id,
          phase: eventData.phase,
          global_progress: eventData.global_progress,
          target_progress: eventData.target_progress,
          total_damage_dealt: eventData.total_damage_dealt || 0,
          boss_max_hp: eventData.boss_max_hp,
          boss_current_hp: eventData.boss_current_hp,
          participants_count: eventData.participants_count,
          is_defeated: eventData.boss_current_hp <= 0,
          phase_1_end_date: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          phase_2_end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          boss_name: eventData.boss_name,
          boss_description: eventData.boss_description,
          boss_config: configData,
        };

        set({ currentEvent: event });
      } else {
        console.log("No boss event data returned");
        set({ currentEvent: null });
      }

      set({ loading: false });
    } catch (error) {
      console.error("Error fetching current boss event:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchUserParticipation: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { currentEvent } = get();
      if (!currentEvent) return;

      const { data, error } = await supabase
        .from("weekly_boss_participation")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("event_id", currentEvent.id)
        .single();

      if (error) {
        // If we get a 406 or other RLS error, or if no participation exists yet
        if (
          error.code === "PGRST116" ||
          error.message.includes("Not Acceptable")
        ) {
          console.log(
            "No participation record found yet - user hasn't contributed"
          );
          set({ userParticipation: null });
          return;
        }
        throw error;
      }

      set({ userParticipation: data });

      // Also check daily boss battle limit when fetching participation
      get().checkDailyBossBattleLimit();
    } catch (error) {
      console.error("Error fetching user participation:", error);
      // Don't set error state for participation issues - just log them
      set({ userParticipation: null });
    }
  },

  fetchRecentBattles: async () => {
    try {
      const { currentEvent } = get();
      if (!currentEvent) return;

      const { data, error } = await supabase
        .from("weekly_boss_battles")
        .select("*")
        .eq("event_id", currentEvent.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      set({ recentBattles: data || [] });
    } catch (error) {
      console.error("Error fetching recent battles:", error);
    }
  },

  startBossBattle: async () => {
    const { battleLoading } = get();

    // Prevent multiple simultaneous battle starts
    if (battleLoading) {
      console.log("Battle already in progress, ignoring duplicate request");
      return;
    }

    try {
      set({ battleLoading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const { currentEvent } = get();
      if (!currentEvent || currentEvent.phase !== 2) {
        throw new Error("Boss battle is not available");
      }

      // Check daily boss battle limit
      const { data: limitCheck, error: limitError } = await supabase.rpc(
        "check_and_increment_boss_battle_limit"
      );

      if (limitError) {
        console.error("Error checking boss battle limit:", limitError);
        throw new Error("Error checking boss battle limit");
      }

      if (!limitCheck) {
        throw new Error(
          "You've reached your daily boss battle limit of 5 battles. Try again tomorrow!"
        );
      }

      // Get user's team Digimon
      const { allUserDigimon } = useDigimonStore.getState();
      const userTeam = allUserDigimon.filter((d) => d.is_on_team);

      if (userTeam.length === 0) {
        throw new Error("You need at least one Digimon on your team");
      }

      // Create boss Digimon
      const bossDigimon = createBossDigimon(currentEvent.boss_config!);
      if (!bossDigimon) {
        throw new Error("Could not create boss Digimon");
      }

      // Simulate battle
      const battleResult = simulateBossBattle(
        userTeam,
        bossDigimon,
        currentEvent.boss_config!.special_abilities
      );

      // Update boss HP
      const newBossHp = Math.max(
        0,
        currentEvent.boss_current_hp - battleResult.totalDamageDealt
      );

      // Create TeamBattle object compatible with TeamBattleAnimation
      const teamBattle = {
        id: `boss-battle-${Date.now()}`,
        user_team: userTeam.map((digimon) => ({
          current_level: digimon.current_level,
          experience_points: digimon.experience_points,
          user_id: digimon.user_id || userData.user.id,
          id: digimon.id,
          name: digimon.name || digimon.digimon?.name || "",
          level: digimon.current_level,
          digimon_id: digimon.digimon_id,
          sprite_url: digimon.digimon?.sprite_url || "",
          digimon_name: digimon.digimon?.name || "",
          profile: {
            username: "Player",
            display_name: "Player",
          },
          stats: {
            hp: calculateFinalStats(digimon).hp,
          },
        })),
        opponent_team: [
          {
            current_level: bossDigimon.current_level,
            experience_points: bossDigimon.experience_points,
            user_id: "boss",
            id: bossDigimon.id,
            name: bossDigimon.name || bossDigimon.digimon?.name || "",
            level: bossDigimon.current_level,
            digimon_id: bossDigimon.digimon_id,
            sprite_url: bossDigimon.digimon?.sprite_url || "",
            digimon_name: bossDigimon.digimon?.name || "",
            profile: {
              username: "Boss",
              display_name: bossDigimon.name || "Boss",
            },
            stats: {
              hp: calculateFinalStats(bossDigimon).hp,
            },
          },
        ],
        turns: battleResult.turns,
        winner_id: battleResult.winnerId,
        xpGain: 0, // Boss battles don't award XP directly
        created_at: new Date().toISOString(),
        bitsReward: 0, // Rewards are handled separately
        // Boss-specific data
        totalDamageDealt: battleResult.totalDamageDealt,
        boss_hp_before: currentEvent.boss_current_hp,
        boss_hp_after: newBossHp,
        boss_defeated: newBossHp <= 0,
      };

      // Save battle result to database in the background
      supabase.from("weekly_boss_battles").insert({
        event_id: currentEvent.id,
        user_id: userData.user.id,
        damage_dealt: battleResult.totalDamageDealt,
        battle_duration: battleResult.battleDuration,
        user_team: userTeam,
        boss_hp_before: currentEvent.boss_current_hp,
        boss_hp_after: newBossHp,
        battle_turns: battleResult.turns,
      });

      // Update user participation in the background
      supabase.from("weekly_boss_participation").upsert({
        user_id: userData.user.id,
        event_id: currentEvent.id,
        battle_attempts: (get().userParticipation?.battle_attempts || 0) + 1,
        total_damage_dealt:
          (get().userParticipation?.total_damage_dealt || 0) +
          battleResult.totalDamageDealt,
        best_single_damage: Math.max(
          get().userParticipation?.best_single_damage || 0,
          battleResult.totalDamageDealt
        ),
        participation_tier: Math.max(
          get().userParticipation?.participation_tier || 0,
          2
        ),
        last_battle_at: new Date().toISOString(),
      });

      // Update event boss HP in the background
      supabase
        .from("weekly_boss_events")
        .update({
          boss_current_hp: newBossHp,
          total_damage_dealt:
            currentEvent.total_damage_dealt + battleResult.totalDamageDealt,
          is_defeated: newBossHp <= 0,
        })
        .eq("id", currentEvent.id);

      // Set the battle for animation
      set({ currentBossBattle: teamBattle, battleLoading: false });

      // Note: Data refresh is handled by the component after animation completes
    } catch (error) {
      console.error("Error starting boss battle:", error);
      set({ error: (error as Error).message, battleLoading: false });
    }
  },

  simulateBossBattle: async (userTeam: UserDigimon[], boss: any) => {
    // This is a placeholder - the actual simulation happens in startBossBattle
    return simulateBossBattle(userTeam, boss, boss.special_abilities || []);
  },

  claimRewards: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { userParticipation, currentEvent } = get();
      if (
        !userParticipation ||
        !currentEvent ||
        userParticipation.rewards_claimed
      ) {
        return;
      }

      const rewards = get().calculateRewards();
      if (!rewards) return;

      // Award bits
      if (rewards.bits > 0) {
        await useCurrencyStore.getState().addCurrency("bits", rewards.bits);
      }

      // Award experience to team
      if (rewards.experience > 0) {
        await useDigimonStore.getState().feedAllDigimon(rewards.experience);
      }

      // Mark rewards as claimed
      await supabase
        .from("weekly_boss_participation")
        .update({ rewards_claimed: true })
        .eq("user_id", userData.user.id)
        .eq("event_id", currentEvent.id);

      // Refresh participation data
      await get().fetchUserParticipation();

      useNotificationStore.getState().addNotification({
        message: `Boss raid rewards claimed: ${rewards.bits} bits, ${rewards.experience} EXP!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      set({ error: (error as Error).message });
    }
  },

  subscribeToEventUpdates: async () => {
    const { currentEvent } = get();
    if (!currentEvent) return () => {};

    const subscription = supabase
      .channel("weekly_boss_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "weekly_boss_events",
          filter: `id=eq.${currentEvent.id}`,
        },
        () => {
          get().fetchCurrentEvent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Helper functions
  getPhaseDescription: () => {
    const { currentEvent } = get();
    if (!currentEvent) return "No active event";

    switch (currentEvent.phase) {
      case 1:
        return "Weakening Phase - Complete tasks to weaken the boss!";
      case 2:
        return "Battle Phase - Fight the boss with your team!";
      case 3:
        return "Event Complete - Rewards available!";
      default:
        return "Unknown phase";
    }
  },

  getDaysRemaining: () => {
    const { currentEvent } = get();
    if (!currentEvent) return 0;

    const now = new Date();
    const endDate =
      currentEvent.phase === 1
        ? new Date(currentEvent.phase_1_end_date)
        : new Date(currentEvent.phase_2_end_date);

    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  },

  getProgressPercentage: () => {
    const { currentEvent } = get();
    if (!currentEvent) return 0;
    return Math.min(
      100,
      (currentEvent.global_progress / currentEvent.target_progress) * 100
    );
  },

  getBossHealthPercentage: () => {
    const { currentEvent } = get();
    if (!currentEvent) return 100;
    return Math.max(
      0,
      (currentEvent.boss_current_hp / currentEvent.boss_max_hp) * 100
    );
  },

  canBattle: () => {
    const { currentEvent, userParticipation, dailyBossBattlesRemaining } =
      get();

    // Must be in Phase 2
    if (currentEvent?.phase !== 2) return false;

    // Boss must not be defeated
    if (currentEvent?.is_defeated) return false;

    // User must have participated in Phase 1 (contributed tasks)
    if (!userParticipation || userParticipation.tasks_contributed <= 0)
      return false;

    // Must have daily boss battles remaining
    if (dailyBossBattlesRemaining <= 0) return false;

    return true;
  },

  getRewardTier: () => {
    const { userParticipation } = get();
    return userParticipation?.participation_tier || 0;
  },

  calculateRewards: () => {
    const { userParticipation, currentEvent } = get();
    if (!userParticipation || !currentEvent) return null;

    const tier = userParticipation.participation_tier;
    const rewardMultiplier = currentEvent.boss_config?.reward_multiplier || 1.0;

    const baseRewards = {
      0: { bits: 0, experience: 0 },
      1: { bits: 500, experience: 200 }, // Participant
      2: { bits: 1000, experience: 500 }, // Battler
      3: { bits: 2000, experience: 1000 }, // Victor
    };

    const rewards =
      baseRewards[tier as keyof typeof baseRewards] || baseRewards[0];

    return {
      bits: Math.round(rewards.bits * rewardMultiplier),
      experience: Math.round(rewards.experience * rewardMultiplier),
      title:
        tier >= 3
          ? "Digital Champion"
          : tier >= 2
          ? "Raid Warrior"
          : tier >= 1
          ? "Digital Defender"
          : undefined,
      special_item: tier >= 3 ? "Boss Essence" : undefined,
    };
  },

  clearCurrentBattle: () => {
    set({ currentBossBattle: null });
  },

  checkDailyBossBattleLimit: async () => {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No user found, can't check boss battle limit");
        set({ dailyBossBattlesRemaining: 0 });
        return 0;
      }

      // Get remaining boss battles from database function
      const { data: remaining, error } = await supabase.rpc(
        "get_remaining_boss_battles"
      );

      if (error) {
        console.error("Error checking boss battle limit:", error);
        set({ dailyBossBattlesRemaining: 0 });
        return 0;
      }

      const remainingBattles = remaining || 0;
      set({ dailyBossBattlesRemaining: remainingBattles });
      return remainingBattles;
    } catch (error) {
      console.error("Error checking daily boss battle limit:", error);
      set({ dailyBossBattlesRemaining: 0 });
      return 0;
    }
  },

  debugContribution: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("Debug: No user logged in");
        return;
      }

      console.log("🔍 Debug: Testing boss progress contribution...");

      // First, check current progress
      await get().fetchCurrentEvent();
      const initialProgress = get().currentEvent?.global_progress || 0;
      console.log("📊 Initial progress:", initialProgress);

      // Test 1: Direct contribute_boss_progress function call
      console.log("🧪 Test 1: Direct contribute_boss_progress call...");
      const { data: directResult, error: directError } = await supabase.rpc(
        "contribute_boss_progress",
        {
          p_user_id: userData.user.id,
          p_task_points: 1,
          p_is_daily_quota: false,
        }
      );

      if (directError) {
        console.error("❌ Direct contribute_boss_progress error:", directError);
      } else {
        console.log("✅ Direct contribute_boss_progress result:", directResult);
      }

      // Check progress after direct call
      await get().fetchCurrentEvent();
      const afterDirectProgress = get().currentEvent?.global_progress || 0;
      console.log(
        "📊 Progress after direct call:",
        afterDirectProgress,
        "(+" + (afterDirectProgress - initialProgress) + ")"
      );

      // Test 2: Check if complete_task_all_triggers exists and what it does
      console.log(
        "\n🧪 Test 2: Checking complete_task_all_triggers function..."
      );

      // Try to call it with dummy data to see if it exists
      const { data: taskFuncResult, error: taskFuncError } = await supabase.rpc(
        "complete_task_all_triggers",
        {
          p_task_id: "00000000-0000-0000-0000-000000000000", // Dummy ID
          p_user_id: userData.user.id,
          p_auto_allocate: false,
        }
      );

      if (taskFuncError) {
        console.error(
          "❌ complete_task_all_triggers error (expected for dummy data):",
          taskFuncError.message
        );

        // Check if function exists by examining the error
        if (
          taskFuncError.message.includes("function") &&
          taskFuncError.message.includes("does not exist")
        ) {
          console.error(
            "💥 PROBLEM: complete_task_all_triggers function does not exist!"
          );
          console.log(
            "🔧 SOLUTION: Run the update_complete_task_function.sql script in Supabase"
          );
        } else if (taskFuncError.message.includes("Task not found")) {
          console.log(
            '✅ complete_task_all_triggers function exists (got expected "Task not found" error)'
          );
        } else {
          console.log(
            "⚠️ complete_task_all_triggers function exists but had unexpected error"
          );
        }
      } else {
        console.log(
          "🤔 Unexpected: complete_task_all_triggers succeeded with dummy data:",
          taskFuncResult
        );
      }

      // Refresh final state
      await get().fetchCurrentEvent();
      await get().fetchUserParticipation();

      const finalProgress = get().currentEvent?.global_progress || 0;
      console.log("\n📊 Final progress:", finalProgress);
      console.log("📈 Total change:", finalProgress - initialProgress);

      console.log("\n📋 SUMMARY:");
      console.log(
        "- Direct contribution test:",
        directError ? "❌ Failed" : "✅ Passed"
      );
      console.log(
        "- Function exists test:",
        taskFuncError?.message.includes("Task not found")
          ? "✅ Passed"
          : "❌ Failed"
      );
      console.log("- Progress increased by:", finalProgress - initialProgress);
    } catch (error) {
      console.error("💥 Debug: Exception in debugContribution:", error);
    }
  },
}));
