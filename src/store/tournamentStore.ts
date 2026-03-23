import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useDigimonStore } from './petStore';
import { useCurrencyStore } from './currencyStore';
import { useNotificationStore } from './notificationStore';
import {
  calculateUserPowerRating,
  getStageForPower,
  findLevelForPower,
  STAGE_MIN_LEVEL,
  STAGE_MAX_LEVEL,
} from './battleStore';
import { TOURNAMENT_TEAM_POOL, TemplateDigimon } from '../constants/tournamentBossTeams';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import {
  UserTournament,
  TournamentBracket,
  TournamentOpponentDigimon,
  RoundDifficulty,
} from '../types/tournament';

// Returns "YYYY-MM-DD" for the Monday of the current week (local time).
// Used as the primary key that groups a user's tournament entry with the correct week.
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Sunday (0) is 6 days after Monday; Mon–Sat map to dayOfWeek-1 days after Monday.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  return monday.toISOString().split('T')[0];
}

// Exported so the Tournament UI can show expected rewards before the user commits to a round.
export const PLACEMENT_BITS: Record<string, number> = {
  qf_loss: 100,
  sf_loss: 300,
  gf_loss: 600,
  champion: 1500,
};

const WEEKLY_TASK_THRESHOLD = 10;

const STAGE_ORDER = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];

const DIFFICULTY_MULTIPLIER: Record<string, number> = { easy: 0.85, medium: 1.0, hard: 1.2 };

/**
 * Picks a stage-compatible team template for the given player power + difficulty,
 * then binary-searches each member's level so the team matches `userPower * multiplier`.
 * Falls back to `generateBattleOption` if no templates match.
 */
function pickTournamentOpponent(
  userPower: number,
  difficulty: 'easy' | 'medium' | 'hard'
): { display_name: string; team: TournamentOpponentDigimon[] } {
  const mult = DIFFICULTY_MULTIPLIER[difficulty] ?? 1.0;
  const teamTargetPower = userPower * mult;
  const perMemberTarget = teamTargetPower / 3;
  const targetStage = getStageForPower(perMemberTarget);
  const targetIdx = STAGE_ORDER.indexOf(targetStage);

  // Keep templates where at least 2 of 3 members are within ±1 stage of the target.
  // "Majority" (not all) gives flexibility for thematic teams that mix adjacent stages.
  // If no templates pass (e.g. power is very high/low), fall back to the entire pool
  // so the function always returns something rather than crashing.
  const compatible = TOURNAMENT_TEAM_POOL.filter((t) => {
    const withinRange = t.digimon.filter((d) => {
      const s = DIGIMON_LOOKUP_TABLE[d.digimon_id];
      return s && Math.abs(STAGE_ORDER.indexOf(s.stage) - targetIdx) <= 1;
    });
    return withinRange.length >= 2;
  });
  const pool = compatible.length > 0 ? compatible : TOURNAMENT_TEAM_POOL;
  const template = pool[Math.floor(Math.random() * pool.length)];

  const team: TournamentOpponentDigimon[] = template.digimon.map(
    (d: TemplateDigimon, i: number) => {
      const species = DIGIMON_LOOKUP_TABLE[d.digimon_id];
      const stage = species?.stage ?? 'Rookie';
      const minLvl = STAGE_MIN_LEVEL[stage] ?? 1;
      const maxLvl = STAGE_MAX_LEVEL[stage] ?? 99;
      const level = species ? findLevelForPower(species, perMemberTarget, minLvl, maxLvl) : minLvl;
      return {
        id: `${d.digimon_id}-${i}`,
        digimon_id: d.digimon_id,
        name: species?.name ?? `Digimon #${d.digimon_id}`,
        current_level: level,
        sprite_url: species?.sprite_url ?? '',
        type: species?.type ?? 'Free',
        attribute: species?.attribute ?? 'Neutral',
      };
    }
  );

  return { display_name: template.name, team };
}

interface TournamentStore {
  currentTournament: UserTournament | null;
  weeklyTaskCount: number;
  loading: boolean;
  error: string | null;

  fetchTournament(): Promise<void>;
  enterTournament(): Promise<void>;
  recordRoundResult(round: number, result: 'win' | 'loss'): Promise<void>;
  refreshWeeklyTaskCount(): Promise<number>;
  setWeeklyTaskCount(count: number): void;
  isUnlocked(): boolean;
  isActive(): boolean;
  isCompleted(): boolean;
  getCurrentRoundOpponent(): UserTournament['bracket']['rounds']['1']['opponent'] | null;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  currentTournament: null,
  weeklyTaskCount: 0,
  loading: false,
  error: null,

  setWeeklyTaskCount(count: number) {
    set({ weeklyTaskCount: count });
  },

  async refreshWeeklyTaskCount(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return 0;
    const userId = userData.user.id;

    const weekStart = getCurrentWeekStart();
    const today = new Date().toISOString().split('T')[0];

    // Weekly count requires two sources because they cover different time windows:
    //   task_history — rows written by the server-side `process_daily_quotas` cron at midnight.
    //                  Contains completed_count for Mon through *yesterday* (already processed).
    //   daily_quotas.completed_today — today's in-progress count, not yet archived by the cron.
    // Combining both gives the true weekly total without waiting for the cron to run.
    const { data: history } = await supabase
      .from('task_history')
      .select('completed_count')
      .eq('user_id', userId)
      .gte('created_at', weekStart)
      .lt('created_at', today);

    const historicalCount = (history ?? []).reduce(
      (sum: number, row: any) => sum + (row.completed_count ?? 0),
      0
    );

    const { data: quota } = await supabase
      .from('daily_quotas')
      .select('completed_today')
      .eq('user_id', userId)
      .single();

    const total = historicalCount + (quota?.completed_today ?? 0);
    set({ weeklyTaskCount: total });
    return total;
  },

  async fetchTournament() {
    set({ loading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      const weekStart = getCurrentWeekStart();

      // Expire tournaments from prior weeks that were never completed.
      // There's no server-side cron for this, so the client handles it on fetch.
      // Only 'active' rows are targeted — already-completed ones are left unchanged.
      await supabase
        .from('user_tournaments')
        .update({ status: 'expired' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .lt('week_start', weekStart);

      // Fetch this week's tournament
      const { data: tournament, error } = await supabase
        .from('user_tournaments')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (error) throw error;

      set({ currentTournament: tournament ?? null });

      // Also refresh weekly task count
      await get().refreshWeeklyTaskCount();
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  async enterTournament() {
    const { weeklyTaskCount, currentTournament } = get();

    if (weeklyTaskCount < WEEKLY_TASK_THRESHOLD) {
      throw new Error(`Complete ${WEEKLY_TASK_THRESHOLD} tasks this week to enter the tournament.`);
    }
    if (currentTournament !== null) {
      throw new Error("You have already entered this week's tournament.");
    }

    const allDigimon = useDigimonStore.getState().allUserDigimon;
    const teamDigimon = allDigimon.filter((d) => d.is_on_team && !d.is_in_storage);
    if (teamDigimon.length === 0) {
      throw new Error('Add at least one Digimon to your battle team first.');
    }

    set({ loading: true, error: null });
    try {
      const userPower = calculateUserPowerRating(teamDigimon);

      // Only 3 opponents are actually fought (rounds 1–3).
      // The remaining 4 (fillerA–D) exist purely to fill out the 8-slot visual bracket
      // so it looks like a real double-elimination draw. They are never battled.
      const round1 = pickTournamentOpponent(userPower, 'easy');
      const round2 = pickTournamentOpponent(userPower, 'medium');
      const round3 = pickTournamentOpponent(userPower, 'hard');

      const fillerA = pickTournamentOpponent(userPower, 'easy');
      const fillerB = pickTournamentOpponent(userPower, 'medium');
      const fillerC = pickTournamentOpponent(userPower, 'easy');
      const fillerD = pickTournamentOpponent(userPower, 'medium');

      const bracket: TournamentBracket = {
        rounds: {
          '1': {
            round_name: 'Quarterfinal',
            difficulty: 'easy' as RoundDifficulty,
            opponent: { display_name: round1.display_name, team: round1.team },
          },
          '2': {
            round_name: 'Semifinal',
            difficulty: 'medium' as RoundDifficulty,
            opponent: { display_name: round2.display_name, team: round2.team },
          },
          '3': {
            round_name: 'Grand Final',
            difficulty: 'hard' as RoundDifficulty,
            opponent: { display_name: round3.display_name, team: round3.team },
          },
        },
        visual_bracket: {
          // Slot layout: Left QF: 1=User, 2=QF opp, 3=FillerA, 4=SF opp  |  Right QF: 5=FillerB, 6=FillerC, 7=FillerD, 8=Boss
          slots: [
            { slot: 1, name: 'You', is_user: true, team: [] },
            { slot: 2, name: round1.display_name, team: round1.team },
            { slot: 3, name: fillerA.display_name, team: fillerA.team },
            { slot: 4, name: round2.display_name, team: round2.team },
            { slot: 5, name: fillerB.display_name, team: fillerB.team },
            { slot: 6, name: fillerC.display_name, team: fillerC.team },
            { slot: 7, name: fillerD.display_name, team: fillerD.team },
            { slot: 8, name: round3.display_name, is_boss: true, team: round3.team },
          ],
        },
      };

      const weekStart = getCurrentWeekStart();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: inserted, error } = await supabase
        .from('user_tournaments')
        .insert({
          user_id: userData.user.id,
          week_start: weekStart,
          status: 'active',
          current_round: 1,
          bracket,
          round_results: [],
          final_placement: null,
        })
        .select()
        .single();

      if (error) throw error;
      set({ currentTournament: inserted });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  async recordRoundResult(round: number, result: 'win' | 'loss') {
    const { currentTournament } = get();
    if (!currentTournament) return;

    const isWin = result === 'win';
    const isChampion = isWin && round === 3;
    const isEliminated = !isWin;

    let newPlacement: string | null = null;
    let newStatus = 'active';
    let placementBits = 0;

    if (isChampion) {
      newPlacement = 'champion';
      newStatus = 'completed';
      placementBits = PLACEMENT_BITS.champion;
    } else if (isEliminated) {
      const roundKey = ['qf_loss', 'sf_loss', 'gf_loss'][round - 1];
      newPlacement = roundKey;
      newStatus = 'completed';
      placementBits = PLACEMENT_BITS[roundKey];
    }

    const newRoundResult = { round, result, placement_bits: placementBits };
    const newRoundResults = [...currentTournament.round_results, newRoundResult];

    // Optimistic concurrency lock: the WHERE conditions `.eq('current_round', round)`
    // and `.eq('status', 'active')` ensure the UPDATE is a no-op if another tab or
    // request has already advanced the round. If it returns no rows, we re-fetch
    // to reconcile rather than blindly overwriting the server state.
    const updatePayload: Record<string, any> = {
      round_results: newRoundResults,
    };
    if (newStatus === 'completed') {
      updatePayload.status = 'completed';
      updatePayload.final_placement = newPlacement;
    } else {
      // Win and not champion: advance round
      updatePayload.current_round = round + 1;
    }

    const { data: updated, error } = await supabase
      .from('user_tournaments')
      .update(updatePayload)
      .eq('id', currentTournament.id)
      .eq('current_round', round) // optimistic lock
      .eq('status', 'active')
      .select()
      .single();

    if (error || !updated) {
      // Stale state — re-fetch
      await get().fetchTournament();
      return;
    }

    set({ currentTournament: updated });

    // Award placement bits
    if (placementBits > 0) {
      useCurrencyStore.getState().addCurrency('bits', placementBits);
      const label = isChampion
        ? 'Champion!'
        : `${newPlacement?.replace('_', ' ').replace('qf', 'QF').replace('sf', 'SF').replace('gf', 'GF')} reward`;
      useNotificationStore.getState().addNotification({
        type: isChampion ? 'success' : 'info',
        message: `🏆 Tournament ${label}: +${placementBits.toLocaleString()} bits`,
        duration: 6000,
      });
    }
  },

  isUnlocked() {
    return get().weeklyTaskCount >= WEEKLY_TASK_THRESHOLD;
  },

  isActive() {
    return get().currentTournament?.status === 'active';
  },

  isCompleted() {
    const t = get().currentTournament;
    // Both statuses mean the user can't fight any more rounds this week.
    // 'expired' means the week ended before they finished; 'completed' means they did finish.
    return t?.status === 'completed' || t?.status === 'expired';
  },

  getCurrentRoundOpponent() {
    const { currentTournament } = get();
    if (!currentTournament) return null;
    // current_round is stored as a number in the DB but bracket.rounds uses string keys
    // ('1' | '2' | '3'). The cast is required to satisfy TypeScript's string literal union.
    const roundKey = String(currentTournament.current_round) as '1' | '2' | '3';
    return currentTournament.bracket.rounds[roundKey]?.opponent ?? null;
  },
}));
