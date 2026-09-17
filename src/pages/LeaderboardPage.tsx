import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

import { countDiscoveries, rankLeaderboard } from '../utils/leaderboard';
import type { LeaderboardProfile, LeaderboardType } from '../utils/leaderboard';

import { fetchAllRows } from '../utils/fetchAllRows';
import { getDigidexPercentage } from '../utils/digidexProgress';

const rankColors = [
  'text-accent-800 dark:text-accent-400',
  'text-gray-600 dark:text-gray-300',
  'text-accent-800 dark:text-accent-400',
];
const rankBg = [
  'bg-amber-400/10 border-amber-400/30',
  'bg-gray-400/10 border-gray-400/20',
  'bg-amber-600/10 border-amber-600/20',
];

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const LeaderboardPage = () => {
  const [allUsers, setAllUsers] = useState<LeaderboardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('wins');

  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAllLeaderboardData = async () => {
      setLoading(true);
      try {
        const [profilesData, streakData, discoveryData] = await Promise.all([
          fetchAllRows((from, to) =>
            supabase
              .from('profiles')
              .select('id, username, battles_won, battles_completed, avatar_url')
              .order('id')
              .range(from, to)
          ),
          fetchAllRows((from, to) =>
            supabase
              .from('daily_quotas')
              .select('longest_streak, current_streak, user_id')
              .order('user_id')
              .range(from, to)
          ),
          fetchAllRows((from, to) =>
            supabase
              .from('user_discovered_digimon')
              .select('user_id, digimon_id')
              .order('id')
              .range(from, to)
          ),
        ]);
        const discoveries = countDiscoveries(discoveryData);
        const streaks = new Map(streakData.map((entry) => [entry.user_id, entry]));

        const combinedData =
          profilesData?.map((profile) => {
            const streakEntry = streaks.get(profile.id);
            return {
              ...profile,
              discoveries: discoveries.get(profile.id) ?? 0,
              battles_won: profile.battles_won || 0,
              battles_completed: profile.battles_completed || 0,
              current_streak: streakEntry?.current_streak || 0,
              longest_streak: streakEntry?.longest_streak || 0,
            };
          }) || [];

        if (!cancelled) setAllUsers(combinedData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAllLeaderboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayUsers = useMemo(
    () => rankLeaderboard(allUsers, leaderboardType),
    [allUsers, leaderboardType]
  );

  const tabs = [
    { key: 'wins' as const, label: 'Most Wins' },
    { key: 'winrate' as const, label: 'Win Rate' },
    { key: 'streak' as const, label: 'Streaks' },
    { key: 'discoveries' as const, label: 'Digidex' },
  ];

  const getStatValue = (user: LeaderboardProfile) => {
    if (leaderboardType === 'discoveries') return `${user.discoveries} discovered`;
    if (leaderboardType === 'wins') return `${user.battles_won} W`;
    if (leaderboardType === 'winrate')
      return `${Math.round((user.battles_won / user.battles_completed || 0) * 100)}%`;
    return `${user.longest_streak ?? 0}d`;
  };

  const getSubValue = (user: LeaderboardProfile) => {
    if (leaderboardType === 'discoveries')
      return `${getDigidexPercentage(user.discoveries)}% of Digidex`;
    if (leaderboardType === 'winrate')
      return `${user.battles_won} wins / ${user.battles_completed} battles`;
    if (leaderboardType === 'streak') return `${user.current_streak ?? 0}d now`;
    return `${user.battles_completed || 0} battles`;
  };

  return (
    <div className="ui-page max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="ui-page-title">Leaderboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
          Top players ranked by performance
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 dark:bg-dark-200 rounded-xl w-fit max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLeaderboardType(tab.key)}
            aria-pressed={leaderboardType === tab.key}
            className={`ui-tab ${
              leaderboardType === tab.key
                ? 'ui-tab-active'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3" role="status">
          <span className="sr-only">Loading leaderboard…</span>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-dark-200 rounded-xl ui-skeleton-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="ui-empty" role="alert">
          Could not load the leaderboard. Please refresh to try again.
        </div>
      ) : displayUsers.length === 0 ? (
        <div className="ui-empty">No data yet.</div>
      ) : (
        <div className="space-y-2">
          {displayUsers.map((user, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={user.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  isTop3
                    ? rankBg[rank - 1]
                    : 'bg-white dark:bg-dark-300 border-gray-100 dark:border-dark-100 hover:border-gray-200 dark:hover:border-dark-200'
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-7 text-center font-heading font-bold text-sm flex-shrink-0 ${
                    isTop3 ? rankColors[rank - 1] : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {rank}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-dark-100">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-7 h-7 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <UserIcon />
                  )}
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Link
                    to={`/profile/name/${user.username}`}
                    className="font-body font-semibold text-gray-900 dark:text-gray-100 hover:text-accent-800 dark:hover:text-accent-400 transition-colors truncate text-sm"
                  >
                    {user.username}
                  </Link>
                  <ReportButton userId={user.id} username={user.username} variant="icon-only" />
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={`font-heading font-bold text-sm ${isTop3 ? rankColors[rank - 1] : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {getStatValue(user)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-body">
                    {getSubValue(user)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
