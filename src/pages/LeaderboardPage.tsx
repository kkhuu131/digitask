import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ReportButton from '../components/ReportButton';

// Add this interface at the top of the file
interface ProfileData {
  id: string;
  username: string;
  battles_won: number;
  battles_completed: number;
  current_streak?: number;
  longest_streak?: number;
  avatar_url?: string;
}

const LeaderboardPage = () => {
  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'wins'|'winrate'|'streak'>('wins');
  
  // Fetch all data once on component mount
  useEffect(() => {
    const fetchAllLeaderboardData = async () => {
      setLoading(true);
      try {
        // Fetch profiles for wins and winrate
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, battles_won, battles_completed, avatar_url")
          .limit(100); // Get more data to ensure we have enough for all tabs
        
        if (profilesError) throw profilesError;
        
        // Fetch streak data
        const { data: streakData, error: streakError } = await supabase
          .from("daily_quotas")
          .select("longest_streak, current_streak, user_id")
          .order('longest_streak', { ascending: false })
          .limit(100);
        
        if (streakError) throw streakError;
        
        // Combine the data
        const combinedData = profilesData?.map(profile => {
          const streakEntry = streakData?.find(s => s.user_id === profile.id);
          return {
            ...profile,
            battles_won: profile.battles_won || 0,
            battles_completed: profile.battles_completed || 0,
            current_streak: streakEntry?.current_streak || 0,
            longest_streak: streakEntry?.longest_streak || 0
          };
        }) || [];
        
        setAllUsers(combinedData);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllLeaderboardData();
  }, []);
  
  // Filter and sort the data based on the selected leaderboard type
  const displayUsers = useMemo(() => {
    if (!allUsers.length) return [];
    
    let filteredUsers = [...allUsers];
    
    if (leaderboardType === 'wins') {
      return filteredUsers
        .sort((a, b) => b.battles_won - a.battles_won)
        .slice(0, 50);
    } 
    else if (leaderboardType === 'winrate') {
      return filteredUsers
        .sort((a, b) => {
          const aRate = a.battles_completed > 0 ? a.battles_won / a.battles_completed : -1;
          const bRate = b.battles_completed > 0 ? b.battles_won / b.battles_completed : -1;
          
          if (aRate === -1 && bRate === -1) {
             return b.battles_won - a.battles_won;
          }
          
          return bRate - aRate;
        })
        .filter(user => user.battles_completed > 0)
        .slice(0, 50);
    } 
    else { // streak
      return filteredUsers
        .sort((a, b) => (b.longest_streak || 0) - (a.longest_streak || 0))
        .slice(0, 50);
    }
  }, [allUsers, leaderboardType]);
  
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setLeaderboardType('wins')}
          className={`px-3 py-2 rounded ${leaderboardType === 'wins' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Most Wins
        </button>
        <button 
          onClick={() => setLeaderboardType('winrate')}
          className={`px-3 py-2 rounded ${leaderboardType === 'winrate' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Best Win Rate
        </button>
        <button 
          onClick={() => setLeaderboardType('streak')}
          className={`px-3 py-2 rounded ${leaderboardType === 'streak' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Longest Streaks
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-8">Loading leaderboard...</p>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  {leaderboardType === 'streak' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Best Streak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Streak
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {leaderboardType === 'wins' ? 'Wins' : 'Win Rate'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Battles
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.username}
                              className="w-8 h-8 object-contain"
                              style={{ imageRendering: "pixelated" }}
                            />
                          ) : (
                            <span className="text-gray-500 text-xl">👤</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Link to={`/profile/name/${user.username}`} className="text-primary-600 hover:underline mr-2 font-medium">
                            {user.username}
                          </Link>
                          <ReportButton userId={user.id} username={user.username} variant="icon-only" />
                        </div>
                      </div>
                    </td>
                    
                    {leaderboardType === 'streak' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.longest_streak} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.current_streak} days
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {leaderboardType === 'wins' ? user.battles_won : 
                           `${Math.round(((user.battles_won / user.battles_completed) || 0) * 100)}%`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.battles_completed || 0}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-3">
            {displayUsers.map((user, index) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-3 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-500 w-6 text-center flex-shrink-0">{index + 1}</span>
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-8 h-8 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <span className="text-gray-500 text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 flex items-center justify-between">
                     <Link to={`/profile/name/${user.username}`} className="text-primary-600 hover:underline truncate font-medium text-sm">
                       {user.username}
                     </Link>
                     <ReportButton userId={user.id} username={user.username} variant="icon-only" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600 pl-9">
                  {leaderboardType === 'streak' ? (
                    <>
                      <div><span className="font-medium text-gray-800">Best Streak:</span> {user.longest_streak}</div>
                      <div><span className="font-medium text-gray-800">Current:</span> {user.current_streak}</div>
                    </>
                  ) : leaderboardType === 'wins' ? (
                    <>
                      <div><span className="font-medium text-gray-800">Wins:</span> {user.battles_won}</div>
                      <div><span className="font-medium text-gray-800">Battles:</span> {user.battles_completed || 0}</div>
                    </>
                  ) : (
                    <>
                      <div><span className="font-medium text-gray-800">Win Rate:</span> {Math.round(((user.battles_won / user.battles_completed) || 0) * 100)}%</div>
                      <div><span className="font-medium text-gray-800">Battles:</span> {user.battles_completed || 0}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage; 