import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Egg } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTitleStore } from '../store/titleStore';
import { supabase } from '../lib/supabase';
import { nextPartnerReward, type PartnerProgress } from '../utils/nextPartnerReward';

export default function NextPartnerReward({
  onClaim,
  busy = false,
  compact = false,
}: {
  onClaim?: (id: number) => void;
  busy?: boolean;
  compact?: boolean;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const earned = useTitleStore((state) => state.userTitles);
  const [progress, setProgress] = useState<PartnerProgress | null>(null);
  const [failed, setFailed] = useState(false);
  const titlesLoading = useTitleStore((state) => state.loading);
  const [hasShownProgress, setHasShownProgress] = useState(false);
  useEffect(() => {
    if (progress && !titlesLoading) setHasShownProgress(true);
  }, [progress, titlesLoading]);
  useEffect(() => {
    let active = true;
    setProgress(null);
    setFailed(false);
    setHasShownProgress(false);
    const refresh = async () => {
      if (!userId) return;
      try {
        const [tasks, streak, battles] = await Promise.all([
          supabase
            .from('user_milestones')
            .select('tasks_completed_count')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('daily_quotas')
            .select('longest_streak')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase.from('profiles').select('battles_won').eq('id', userId).single(),
        ]);
        if (tasks.error || streak.error || battles.error) throw new Error('Progress unavailable');
        if (active) {
          setProgress({
            tasks: tasks.data?.tasks_completed_count ?? 0,
            streak: streak.data?.longest_streak ?? 0,
            battles: battles.data?.battles_won ?? 0,
          });
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    };
    void refresh();
    window.addEventListener('task-completed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.removeEventListener('task-completed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [userId]);
  if (!failed && (!progress || (!hasShownProgress && titlesLoading))) {
    return compact ? (
      <div
        className="border-t border-gray-200 dark:border-dark-100 px-4 py-3 space-y-3"
        aria-label="DigiEgg reward paths"
        aria-busy="true"
        role="status"
      >
        <span className="sr-only">Loading partner progress…</span>
        <div className="space-y-3 ui-skeleton-pulse" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <div className="flex items-center gap-2 h-4">
                <div className="w-4 h-4 shrink-0 rounded bg-gray-200 dark:bg-dark-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-dark-200" />
                <div className="h-3 w-10 ml-auto rounded bg-gray-200 dark:bg-dark-200" />
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-dark-200" />
            </div>
          ))}
        </div>
      </div>
    ) : (
      <section
        id="partner-reward"
        className="card mb-6"
        aria-label="Next partner reward"
        aria-busy="true"
        role="status"
      >
        <span className="sr-only">Loading partner progress…</span>
        <div className="flex items-start gap-3 ui-skeleton-pulse" aria-hidden="true">
          <div className="w-5 h-5 mt-0.5 shrink-0 rounded bg-gray-200 dark:bg-dark-200" />
          <div className="flex-1 min-w-0">
            <div className="h-7 w-48 max-w-full rounded bg-gray-200 dark:bg-dark-200" />
            <div className="h-5 mt-1 w-full rounded bg-gray-200 dark:bg-dark-200" />
            <div className="mt-3 h-4 w-24 rounded bg-gray-200 dark:bg-dark-200" />
            <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-dark-200" />
          </div>
        </div>
      </section>
    );
  }
  const next = nextPartnerReward(earned, progress);
  const requirement =
    next?.title.requirement_type === 'tasks_completed'
      ? `Complete ${next.title.requirement_value} tasks`
      : next?.title.requirement_type === 'longest_streak'
        ? `Reach a ${next.title.requirement_value}-day streak`
        : next?.title.requirement_type === 'battle_wins'
          ? `Win ${next.title.requirement_value} battles`
          : `Evolve a Digimon to ${next?.title.requirement_value}`;
  if (compact) {
    const routes = [
      { type: 'tasks_completed', label: 'Lifetime tasks', unit: 'tasks' },
      { type: 'longest_streak', label: 'Best streak', unit: 'days' },
      { type: 'battle_wins', label: 'Battle wins', unit: 'wins' },
      { type: 'digimon_stage', label: 'Evolution', unit: '' },
    ];
    return (
      <div
        className="border-t border-gray-200 dark:border-dark-100 px-4 py-3 space-y-3"
        aria-label="DigiEgg reward paths"
      >
        {routes.map((route) => {
          const reward = nextPartnerReward(earned, progress, route.type);
          if (!reward) return null;
          const evolution = route.type === 'digimon_stage';
          const current = evolution
            ? reward && !reward.ready
              ? 0
              : 1
            : route.type === 'tasks_completed'
              ? (progress?.tasks ?? reward?.current)
              : reward?.current;
          const target = evolution ? 1 : reward?.target;
          const showProgress =
            evolution || (!!reward && !reward.ready && current != null && target != null);
          return (
            <div key={route.type}>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Egg
                  className="w-4 h-4 shrink-0 text-accent-600 dark:text-accent-400"
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0">
                  {route.label}:{' '}
                  {reward?.ready
                    ? 'DigiEgg ready'
                    : !reward
                      ? 'Complete'
                      : route.type === 'digimon_stage'
                        ? `Reach ${reward.title.requirement_value}`
                        : `${reward.target ?? reward.title.requirement_value} ${route.unit} for a DigiEgg`}
                </span>
                {showProgress && (
                  <span className="shrink-0 tabular-nums">
                    {current}/{target}
                  </span>
                )}
                {route.type === 'tasks_completed' && reward.ready && progress && (
                  <span className="shrink-0 tabular-nums">{progress.tasks} total</span>
                )}
              </div>
              {showProgress && (
                <div
                  role="progressbar"
                  aria-label={
                    evolution
                      ? `Reach ${reward?.title.requirement_value ?? 'Ultra'}`
                      : `${route.label}: ${target} ${route.unit} for a DigiEgg`
                  }
                  aria-valuenow={Math.min(current ?? 0, target ?? 1)}
                  aria-valuemin={0}
                  aria-valuemax={target ?? 1}
                  className="mt-2 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-100"
                >
                  <div
                    className="h-full bg-accent-600 dark:bg-accent-500"
                    style={{ width: `${Math.min(100, (100 * (current ?? 0)) / (target ?? 1))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {!progress && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Progress unavailable.</p>
        )}
      </div>
    );
  }
  return (
    <section id="partner-reward" className="card mb-6" aria-label="Next partner reward">
      <div className="flex items-start gap-3">
        <Egg
          className="w-5 h-5 mt-0.5 shrink-0 text-accent-600 dark:text-accent-400"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h2 className="ui-section-title">
            {next?.ready ? 'Your next partner is ready' : 'Next partner reward'}
          </h2>
          <p className="ui-description mt-1">
            {!next
              ? 'All current partner achievements earned.'
              : next.ready
                ? `${next.title.name}: choose one partner from three DigiEgg options.`
                : `${requirement} to earn a DigiEgg and choose one new partner.`}
          </p>
          {!next?.ready && next?.target !== null && next?.current !== null && next && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {next.title.requirement_type === 'longest_streak' && 'Best streak: '}
                {next.current} / {next.target}{' '}
                {next.title.requirement_type === 'tasks_completed'
                  ? 'tasks'
                  : next.title.requirement_type === 'longest_streak'
                    ? 'days'
                    : 'wins'}
              </div>
              <div
                role="progressbar"
                className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-100"
                aria-valuenow={next.current}
                aria-valuemin={0}
                aria-valuemax={next.target}
                aria-label={requirement}
              >
                <div
                  className="h-full bg-accent-600 dark:bg-accent-500"
                  style={{ width: `${(100 * next.current) / next.target}%` }}
                />
              </div>
            </div>
          )}
          {next && !next.ready && !progress && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Progress unavailable. Revisit this page to retry.
            </p>
          )}
          {next?.ready && onClaim && (
            <button
              className="btn-primary mt-3"
              disabled={busy}
              onClick={() => onClaim(next.userTitleId!)}
            >
              Choose your partner
            </button>
          )}
          {!onClaim && next?.ready && (
            <Link
              className="ui-link inline-flex min-h-11 items-center"
              to="/achievements#partner-reward"
            >
              Choose your partner
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
