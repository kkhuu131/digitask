import { useThemeStore } from "../store/themeStore";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const Settings = () => {
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore();
  const { user, userProfile, updateProfile, error: profileError } = useAuthStore();
  const [success] = useState(false);
  const [username, setUsername] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || "");
    }
  }, [userProfile]);
  
  // Handle system theme preference
  const handleSystemPreference = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setProfileLoading(true);
    
    try {
      await updateProfile({
        username: username,
        // Also update display_name to match username for consistency
        display_name: username
      });
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Check if this is the demo account
  const isDemoAccount = userProfile?.username === "demo" || 
                      userProfile?.id === "digitaskdemo@gmail.com";
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* User Profile Settings */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Profile Settings</h2>
        
        {isDemoAccount ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Profile settings are disabled for the demo account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-dark-200 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-amber-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is how your name will appear to other users.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="text"
                id="email"
                value={user?.email}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-dark-300 rounded-md text-gray-500 dark:text-gray-400"
                disabled
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        )}
        
        {/* Show profile update success message */}
        {updateSuccess && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">Profile updated successfully!</p>
          </div>
        )}
        
        {/* Show profile error message */}
        {profileError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{profileError}</p>
          </div>
        )}
      </div>
      
      {/* Theme Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 dark:text-gray-100">App Settings</h2>
        
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Theme</h3>
          <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-gray-300">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-accent-600 rounded-full peer dark:bg-dark-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-300 peer-checked:bg-accent-600"></div>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleSystemPreference}
            className="btn-outline w-full"
          >
            Use System Preference
          </button>
        </section>
        
        {/* Battle Speed Settings
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Battle Speed</h3>
          <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Adjust the speed of battle animations
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">1x (Normal)</span>
                <button 
                  onClick={() => saveBattleSpeed(1)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 1 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">1.5x (Fast)</span>
                <button 
                  onClick={() => saveBattleSpeed(1.5)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 1.5 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2x (Very Fast)</span>
                <button 
                  onClick={() => saveBattleSpeed(2)}
                  className={`w-6 h-6 rounded-full ${battleSpeed === 2 ? 'bg-primary-500 dark:bg-accent-500' : 'bg-gray-300 dark:bg-dark-200'}`}
                ></button>
              </div>
            </div>
          </div>
        </section> */}
        
        {/* Settings saved message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700 dark:text-green-400">Settings saved successfully!</p>
          </div>
        )}
      </div>
      
      {/* About section with app info
      <div className="card mt-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">About Digitask</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>Version: 0.1.0</p>
          <p>Digitask is a productivity app where you raise a virtual Digimon pet by completing tasks.</p>
          <p className="mt-4 text-xs">
            This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Settings; 