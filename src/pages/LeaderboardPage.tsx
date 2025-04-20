import { useState, useEffect } from "react";
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

interface StreakLeaderboardRow {
  current_streak: number;
  profiles: {
    id: string;
    username: string;
    battles_won: number;
    battles_completed: number;
    avatar_url?: string;
  };
}

const LeaderboardPage = () => {
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<'wins'|'winrate'|'streak'>('wins');
  
  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType]);
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (leaderboardType === 'streak') {
        const { data, error } = await supabase
        .from("daily_quotas")
        .select(`
          current_streak,
          profiles!daily_quotas_user_id_fkey (
            id, 
            username, 
            battles_won, 
            battles_completed,
            avatar_url
          )
        `)
        .order('current_streak', { ascending: false })
        .limit(50) as unknown as { data: StreakLeaderboardRow[]; error: any };
        
        if (error) throw error;
        
        // Transform the data to match our expected format
        const transformedData = data?.map(item => ({
          id: item.profiles.id,
          username: item.profiles.username,
          battles_won: item.profiles.battles_won,
          battles_completed: item.profiles.battles_completed,
          current_streak: item.current_streak,
          avatar_url: item.profiles.avatar_url
        })) as ProfileData[] || [];
        
        setUsers(transformedData);
      } else {
        // For wins and winrate leaderboards, we can query profiles directly
        let query = supabase
          .from("profiles")
          .select("id, username, battles_won, battles_completed, avatar_url");
        
        if (leaderboardType === 'wins') {
          query = query.order('battles_won', { ascending: false });
        } else if (leaderboardType === 'winrate') {
          // For winrate, we'll get all users with at least 1 battle
          query = query.gt('battles_completed', 0);
        }
        
        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        
        // Sort by win rate
        if (leaderboardType === 'winrate' && data) {
          data.sort((a, b) => {
            const aRate = a.battles_completed ? a.battles_won / a.battles_completed : 0;
            const bRate = b.battles_completed ? b.battles_won / b.battles_completed : 0;
            return bRate - aRate;
          });
        }
        
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };
  
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
              {users.map((user, index) => (
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