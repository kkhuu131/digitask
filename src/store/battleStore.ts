import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export {
  calculateUserPowerRating,
  generateTeamName,
  generateBattleOption,
  getStageForPower,
  findLevelForPower,
  STAGE_MIN_LEVEL,
  STAGE_MAX_LEVEL,
  STAGE_THRESHOLDS,
} from '../engine/arenaOpponents';

export {
  TypeAdvantageMap,
  AttributeAdvantageMap,
  calculateCritMultiplier,
  baseDamage,
  missChance,
  criticalHitChance,
  baseCritMultiplier,
} from '../engine/battleRules';
export type { DigimonType, DigimonAttribute } from '../engine/battleRules';
import { fetchArenaContext } from '../lib/arenaBattle';

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

export interface TeamBattle {
  id: string;
  created_at: string;
  user_team: {
    id: string;
    user_id: string;
    current_level: number;
    experience_points: number;
    digimon_id: number | string;
    name: string;
    sprite_url?: string;
    digimon_name?: string;
    profile?: {
      username: string;
      display_name?: string;
    };
    stats?: {
      hp: number;
    };
  }[];
  opponent_team: {
    id: string;
    user_id: string;
    current_level: number;
    experience_points: number;
    digimon_id: number | string;
    name: string;
    sprite_url?: string;
    digimon_name?: string;
    profile?: {
      username: string;
      display_name?: string;
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
  bitsReward: number;
  hint?: string;
  description?: string;
}

export interface BattleOption {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

interface BattleState {
  teamBattleHistory: TeamBattleHistory[];
  loading: boolean;
  error: string | null;
  fetchTeamBattleHistory: () => Promise<void>;
  battleOptions: BattleOption[];
  selectedBattleOption: BattleOption | null;
  getBattleOptions: (forceRefresh?: boolean) => Promise<void>;
  refreshBattleOptions: () => Promise<void>;
  lastOptionsRefresh: number | null;
  shouldRefreshOptions: boolean;
  setShouldRefreshOptions: (shouldRefresh: boolean) => void;
}

// Add these helper functions at the top of the file
const STORAGE_KEY_OPTIONS = 'battle_options';
const STORAGE_KEY_TIMESTAMP = 'battle_options_timestamp';
const STORAGE_KEY_SHOULD_REFRESH = 'battle_options_should_refresh';

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
    console.error('Failed to save battle options to localStorage:', e);
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
      shouldRefresh: shouldRefreshStr ? shouldRefreshStr === 'true' : true,
    };
  } catch (e) {
    console.error('Failed to load battle options from localStorage:', e);
    return { options: [], timestamp: null, shouldRefresh: true };
  }
};

export const useBattleStore = create<BattleState>((set, get) => {
  // Load initial state from localStorage
  const { options, timestamp, shouldRefresh } = loadBattleOptionsFromStorage();

  return {
    teamBattleHistory: [],
    loading: false,
    error: null,
    battleOptions: options,
    selectedBattleOption: null,
    lastOptionsRefresh: timestamp,
    shouldRefreshOptions: shouldRefresh,

    refreshBattleOptions: async () => {
      await get().getBattleOptions();
    },

    getBattleOptions: async (forceRefresh = false) => {
      try {
        const state = get();
        const currentTime = Date.now();

        // Skip regeneration if we have cached options that are still valid.
        // Two independent reasons force a refresh:
        //   1. shouldRefreshOptions — set to true by setShouldRefreshOptions() after
        //      a battle completes, so the next visit gets new opponents.
        //   2. isNewDay — daily rollover: even if the user hasn't battled, opponents
        //      should rotate at midnight so the list never feels stale.
        if (!forceRefresh && state.battleOptions.length > 0 && state.lastOptionsRefresh) {
          const lastRefreshDate = new Date(state.lastOptionsRefresh);
          const currentDate = new Date();
          const isNewDay =
            lastRefreshDate.getDate() !== currentDate.getDate() ||
            lastRefreshDate.getMonth() !== currentDate.getMonth() ||
            lastRefreshDate.getFullYear() !== currentDate.getFullYear();

          if (!state.shouldRefreshOptions && !isNewDay) {
            return;
          }
        }

        // Set loading state and clear any errors
        set({ loading: true, error: null });

        const context = await fetchArenaContext(forceRefresh);
        const battleOptions: BattleOption[] = context.offers.map((offer) => ({
          id: offer.id,
          difficulty: offer.difficulty,
          isWild: true,
          team: {
            user_id: '00000000-0000-0000-0000-000000000000',
            username: offer.opponent_name,
            digimon: offer.opponent_team,
          },
        }));

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
        console.error('Error getting battle options:', error);
        set({ error: (error as Error).message, loading: false });
      }
    },

    fetchTeamBattleHistory: async () => {
      try {
        set({ loading: true, error: null });

        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          set({ teamBattleHistory: [], loading: false });
          return;
        }

        // Fetch only battles where the user was the initiator.
        // team_battles has two FKs to profiles (user_id and opponent_id), so Supabase
        // can't infer which FK to use for a plain `profiles(username)` join.
        // The `!fkey_name` syntax explicitly names the constraint, giving each join
        // a unique alias ("user" / "opponent") that matches TeamBattleHistory.
        const { data, error } = await supabase
          .from('team_battles')
          .select(
            `
          id,
          user_id,
          opponent_id,
          winner_id,
          created_at,
          user_team,
          opponent_team,
          user:profiles!team_battles_user_id_fkey1(username),
          opponent:profiles!team_battles_opponent_id_fkey(username)
        `
          )
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Add a type assertion to tell TypeScript about the actual structure
        const transformedData =
          data?.map((battle) => ({
            ...battle,
            user: { username: (battle.user as any)?.username || 'You' },
            opponent: {
              username: (battle.opponent as any)?.username || 'Opponent',
            },
          })) || [];

        set({ teamBattleHistory: transformedData || [], loading: false });

        // No-op: daily battle limit removed
      } catch (error) {
        console.error('Error fetching team battle history:', error);
        set({ error: (error as Error).message, loading: false });
      }
    },

    setShouldRefreshOptions: (shouldRefresh: boolean) => {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY_SHOULD_REFRESH, shouldRefresh.toString());
      set({ shouldRefreshOptions: shouldRefresh });
    },
  };
});
