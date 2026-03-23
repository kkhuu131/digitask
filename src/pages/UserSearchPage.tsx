import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, battles_won, battles_completed')
        .ilike('username', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
          Find Players
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
          Search for other Digitask trainers
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-body text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {hasSearched ? (
        loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-dark-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/name/${user.username}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-dark-100 bg-white dark:bg-dark-300 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all duration-150 cursor-pointer"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-dark-100">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <UserIcon />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-body">
                    {user.battles_completed || 0} battles · {user.battles_won || 0} wins
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 font-body text-gray-400 dark:text-gray-500">
            No players found matching "{searchQuery}"
          </div>
        )
      ) : (
        <div className="text-center py-16 font-body text-gray-400 dark:text-gray-500">
          Enter a username above to find other trainers
        </div>
      )}
    </div>
  );
};

export default UserSearchPage;
