import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
        .from("profiles")
        .select("id, username, avatar_url, battles_won, battles_completed")
        .ilike("username", `%${searchQuery}%`)
        .limit(20);
        
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Find Players</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 p-2 border rounded dark:border-gray-600 dark:bg-dark-200 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-amber-500"
          />
          <button 
            type="submit" 
            className="bg-primary-600 dark:bg-amber-600 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-amber-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
      
      {hasSearched ? (
        users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(user => (
              <Link 
                key={user.id}
                to={`/profile/name/${user.username}`}
                className="border dark:border-gray-600 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username} 
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <div className="font-medium dark:text-gray-200">{user.username}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Battles: {user.battles_completed || 0} | Wins: {user.battles_won || 0}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No users found matching "{searchQuery}"</p>
        )
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Enter a username and click Search to find players</p>
      )}
    </div>
  );
};

export default UserSearchPage; 