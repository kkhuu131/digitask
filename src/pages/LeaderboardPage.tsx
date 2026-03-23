import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

interface ProfileData {
  id: string;
  username: string;
  battles_won: number;
  battles_completed: number;
  current_streak?: number;
  longest_streak?: number;
  avatar_url?: string;
}

const rankColors = ['text-amber-400', 'text-gray-300', 'text-amber-600'];
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
  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'wins' | 'winrate' | 'streak'>('wins');

  useEffect(() => {
    const fetchAllLeaderboardData = async () => {
      setLoading(true);
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, battles_won, battles_completed, avatar_url')
          .limit(100);
        if (profilesError) throw profilesError;

        const { data: streakData, error: streakError } = await supabase
          .from('daily_quotas')
          .select('longest_streak, current_streak, user_id')
          .order('longest_streak', { ascending: false })
          .limit(100);
        if (streakError) throw streakError;

        const combinedData =
          profilesData?.map((profile) => {
            const streakEntry = streakData?.find((s) => s.user_id === profile.id);
            return {
              ...profile,
              battles_won: profile.battles_won || 0,
              battles_completed: profile.battles_completed || 0,
              current_streak: streakEntry?.current_streak || 0,
              longest_streak: streakEntry?.longest_streak || 0,
            };
          }) || [];

        setAllUsers(combinedData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLeaderboardData();
  }, []);

  const displayUsers = useMemo(() => {
    if (!allUsers.length) return [];
    const filteredUsers = [...allUsers];
    if (leaderboardType === 'wins') {
      return filteredUsers.sort((a, b) => b.battles_won - a.battles_won).slice(0, 50);
    } else if (leaderboardType === 'winrate') {
      return filteredUsers
        .sort((a, b) => {
          const aRate = a.battles_completed > 0 ? a.battles_won / a.battles_completed : -1;
          const bRate = b.battles_completed > 0 ? b.battles_won / b.battles_completed : -1;
          if (aRate === -1 && bRate === -1) return b.battles_won - a.battles_won;
          return bRate - aRate;
        })
        .filter((user) => user.battles_completed > 0)
        .slice(0, 50);
    } else {
      return filteredUsers
        .sort((a, b) => (b.longest_streak || 0) - (a.longest_streak || 0))
        .slice(0, 50);
    }
  }, [allUsers, leaderboardType]);

  const tabs = [
    { key: 'wins' as const, label: 'Most Wins' },
    { key: 'winrate' as const, label: 'Win Rate' },
    { key: 'streak' as const, label: 'Streaks' },
  ];

  const getStatValue = (user: ProfileData) => {
    if (leaderboardType === 'wins') return `${user.battles_won} W`;
    if (leaderboardType === 'winrate')
      return `${Math.round((user.battles_won / user.battles_completed || 0) * 100)}%`;
    return `${user.longest_streak ?? 0}d`;
  };

  const getSubValue = (user: ProfileData) => {
    if (leaderboardType === 'streak') return `${user.current_streak ?? 0}d now`;
    return `${user.battles_completed || 0} battles`;
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
          Top players ranked by performance
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-dark-200 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLeaderboardType(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-body font-semibold transition-all duration-150 ${
              leaderboardType === tab.key
                ? 'bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-dark-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : displayUsers.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-body">No data yet.</div>
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
                    className="font-body font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate text-sm"
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
