import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { getCurrentWeekStart, useTournamentStore } from '../store/tournamentStore';
import type { UserTournament } from '../types/tournament';

interface BattleReminders {
  tickets: { current: number; max: number } | null;
  tournament: Pick<UserTournament, 'status' | 'current_round'> | null;
  tournamentLoaded: boolean;
}

const emptyReminders: BattleReminders = {
  tickets: null,
  tournament: null,
  tournamentLoaded: false,
};

export const BattleRemindersContext = createContext<BattleReminders>(emptyReminders);

export const useBattleReminders = () => useContext(BattleRemindersContext);

// The shell owns these read-only reminders so the dashboard and navigation agree.
export function useBattleReminderData(): BattleReminders {
  const userId = useAuthStore((state) => state.user?.id);
  const currentTournament = useTournamentStore((state) => state.currentTournament);
  const { pathname } = useLocation();
  const [snapshot, setSnapshot] = useState<BattleReminders & { userId?: string; week?: string }>(
    emptyReminders
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let request = 0;
    let week = getCurrentWeekStart();
    const refresh = async () => {
      const requestId = ++request;
      week = getCurrentWeekStart();
      const [profile, tournament] = await Promise.all([
        supabase
          .from('profiles')
          .select('battle_energy, max_battle_energy')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_tournaments')
          .select('status, current_round')
          .eq('user_id', userId)
          .eq('week_start', week)
          .maybeSingle(),
      ]);
      if (cancelled || requestId !== request) return;
      setSnapshot({
        userId,
        week,
        tickets:
          !profile.error && profile.data
            ? {
                current: profile.data.battle_energy ?? 0,
                max: profile.data.max_battle_energy ?? 10,
              }
            : null,
        tournament: tournament.error ? null : tournament.data,
        tournamentLoaded: !tournament.error,
      });
    };
    const onRefresh = () =>
      void refresh().catch(() => {
        if (!cancelled) setSnapshot(emptyReminders);
      });
    const onVisible = () => {
      if (document.visibilityState === 'visible') onRefresh();
    };
    onRefresh();
    window.addEventListener('task-completed', onRefresh);
    window.addEventListener('energy-updated', onRefresh);
    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(() => {
      if (week !== getCurrentWeekStart()) {
        setSnapshot(emptyReminders);
        onRefresh();
      }
    }, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener('task-completed', onRefresh);
      window.removeEventListener('energy-updated', onRefresh);
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [userId, pathname, currentTournament]);

  const reminders =
    userId && snapshot.userId === userId && snapshot.week === getCurrentWeekStart()
      ? snapshot
      : emptyReminders;
  return reminders;
}
