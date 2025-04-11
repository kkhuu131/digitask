import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

const ProfileSettings = () => {
  const { userProfile, updateProfile, error, loading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || "");
    }
  }, [userProfile]);
  
  useEffect(() => {
    const createProfileIfNeeded = async () => {
      const { user } = useAuthStore.getState();
      if (!user) return;
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      // If no profile, create one
      if (!profile) {
        const defaultUsername = user.email?.split('@')[0] || 
                               `user_${Math.floor(Math.random() * 10000)}`;
        
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: defaultUsername,
            display_name: defaultUsername,
          });
        
        // Refresh the profile in the store
        await useAuthStore.getState().checkSession();
      }
    };
    
    createProfileIfNeeded();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    
    await updateProfile({
      username: username,
      // We'll also update display_name to match username for consistency
      display_name: username
    });
    
    if (!useAuthStore.getState().error) {
      setUpdateSuccess(true);
    }
  };
  
  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p>Loading profile...</p>
      </div>
    );
  }

  const { user } = useAuthStore.getState();

  if (user?.email === "digitaskdemo@gmail.com") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Profile settings are disabled for the demo account.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how your name will appear to other users.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={user?.email}
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-500"
              disabled
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {updateSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-sm text-green-700">Profile updated successfully!</p>
            </div>
          )}
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 