import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

// Add this interface at the top of the file
interface ProfileData {
  id: string;
  username: string;
  battles_won: number;
  battles_completed: number;
  current_streak?: number;
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
          .select("current_streak, user_id")
          .order('current_streak', { ascending: false })
          .limit(100);
        
        if (streakError) throw streakError;
        
        // Combine the data
        const combinedData = profilesData?.map(profile => {
          const streakEntry = streakData?.find(s => s.user_id === profile.id);
          return {
            ...profile,
            battles_won: profile.battles_won || 0,
            battles_completed: profile.battles_completed || 0,
            current_streak: streakEntry?.current_streak || 0
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
        .filter(user => user.battles_completed > 0)
        .sort((a, b) => {
          const aRate = a.battles_completed ? a.battles_won / a.battles_completed : 0;
          const bRate = b.battles_completed ? b.battles_won / b.battles_completed : 0;
          return bRate - aRate;
        })
        .slice(0, 50);
    } 
    else { // streak
      return filteredUsers
        .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
        .slice(0, 50);
    }
  }, [allUsers, leaderboardType]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setLeaderboardType('wins')}
          className={`px-4 py-2 rounded ${leaderboardType === 'wins' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Most Wins
        </button>
        <button 
          onClick={() => setLeaderboardType('winrate')}
          className={`px-4 py-2 rounded ${leaderboardType === 'winrate' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Best Win Rate
        </button>
        <button 
          onClick={() => setLeaderboardType('streak')}
          className={`px-4 py-2 rounded ${leaderboardType === 'streak' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
        >
          Longest Streaks
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-8">Loading leaderboard...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {leaderboardType === 'wins' ? 'Wins' : 
                   leaderboardType === 'winrate' ? 'Win Rate' : 'Streak'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.username}
                            className="w-8 h-8 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <span className="text-gray-500">👤</span>
                        )}
                      </div>
                      <Link to={`/profile/name/${user.username}`} className="text-primary-600 hover:underline">
                        {user.username}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leaderboardType === 'wins' ? user.battles_won : 
                     leaderboardType === 'winrate' ? 
                      `${Math.round(((user.battles_won / user.battles_completed) || 0) * 100)}%` : 
                      user.current_streak}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.battles_completed || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 