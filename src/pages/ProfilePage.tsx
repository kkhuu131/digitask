import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDigimonStore, UserDigimon } from "../store/petStore";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import calculateBaseStat from "../utils/digimonStatCalculation";
import DigimonDetailModal from "../components/DigimonDetailModal";
import AvatarSelectionModal from "../components/AvatarSelectionModal";
import ReportButton from '../components/ReportButton';

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  battles_won: number;
  current_streak: number;
  battles_completed: number;
  discovered_count: number;
}

const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();
  const { username } = useParams<{ username?: string }>();
  const { user, userProfile } = useAuthStore();
  const { discoveredDigimon, allUserDigimon } = useDigimonStore();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userDigimon, setUserDigimon] = useState<UserDigimon[]>([]);
  const [favoriteDigimon, setFavoriteDigimon] = useState<UserDigimon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetailDigimon, setSelectedDetailDigimon] = useState<UserDigimon | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  
  // Determine if viewing own profile
  const isOwnProfile = !id && !username || 
                      (id && id === user?.id) || 
                      (username && username === userProfile?.username);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        let profileId = id || user?.id;
        
        // If username is provided, look up the user ID
        if (username) {
          const { data: userByUsername, error: usernameError } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .single();
            
          if (usernameError) {
            throw new Error("User not found");
          }
          
          profileId = userByUsername.id;
        }
        
        if (!profileId) {
          throw new Error("No profile ID available");
        }
        
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            avatar_url,
            created_at,
            battles_won,
            battles_completed
          `)
          .eq("id", profileId)
          .single();
          
        if (profileError) throw profileError;
        
        // Fetch streak data separately
        let currentStreak = 0;
        let discoveredCount = 0;
        try {
          const { data: quotaData, error: quotaError } = await supabase
            .from("daily_quotas")
            .select("current_streak")
            .eq("user_id", profileId)
            .single();
            
          if (!quotaError && quotaData) {
            currentStreak = quotaData.current_streak || 0;
          }

          if (isOwnProfile) {
            discoveredCount = discoveredDigimon.length || 0;
          } else {
            const { count: discoveredCountData, error: discoveredCountError } = await supabase
              .from("user_discovered_digimon")
              .select("*", { count: "exact", head: true })
              .eq("user_id", profileId);

            if (!discoveredCountError && discoveredCountData !== null) {
              discoveredCount = discoveredCountData || 0;
            }
          }

        } catch (err) {
          // If no streak data, just continue with 0
          console.log("No streak data found:", err);
        }
        
        setProfileData({
          ...profile,
          battles_won: profile.battles_won || 0,
          current_streak: currentStreak,
          discovered_count: discoveredCount
        });
        
        // If viewing own profile, use the store data
        if (isOwnProfile) {
          setUserDigimon(allUserDigimon);
          const active = allUserDigimon.find(d => d.is_active);
          if (active) setFavoriteDigimon(active);
        } else {
          // Fetch the user's Digimon
          const { data: digimonData, error: digimonError } = await supabase
            .from("user_digimon")
            .select(`
              *,
              digimon (*)
            `)
            .eq("user_id", profileId)
            .order("current_level", { ascending: false });
            
          if (digimonError) throw digimonError;
          
          setUserDigimon(digimonData);
          const active = digimonData.find(d => d.is_active);
          if (active) setFavoriteDigimon(active);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, username, user?.id, userProfile?.username, isOwnProfile, allUserDigimon, navigate]);
  
  // Calculate Digimon discovery percentage
  const discoveryPercentage = () => {
    const totalDigimon = 341; 
    return profileData?.discovered_count ? Math.round((profileData.discovered_count / totalDigimon) * 100) : 0;
  };
  
  // Add a function to handle clicking on a Digimon card
  const handleDigimonClick = (digimon: UserDigimon) => {
    setSelectedDetailDigimon(digimon);
  };
  
  const handleAvatarUpdate = async (spriteUrl: string) => {
    if (!user || user.id !== profileData?.id) return;
    
    setIsUpdatingAvatar(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: spriteUrl })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update the profile data in state
      setProfileData(prev => prev ? { ...prev, avatar_url: spriteUrl } : null);
      
    } catch (err) {
      console.error("Error updating avatar:", err);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error || !profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Profile not found"}</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12">
          <p>Loading profile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2"
                  onClick={isOwnProfile ? () => setIsAvatarModalOpen(true) : undefined}
                  style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
                >
                  {isUpdatingAvatar ? (
                    <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                  ) : profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt={profileData.username}
                      className="w-24 h-24 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : favoriteDigimon ? (
                    <img 
                      src={favoriteDigimon.digimon?.sprite_url} 
                      alt={favoriteDigimon.name}
                      className="w-24 h-24 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">👤</span>
                  )}
                </div>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Change Avatar
                  </button>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h1 className="text-2xl font-bold">{profileData.username}</h1>
                  <div className="text-sm text-gray-500">
                    Joined {new Date(profileData.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-primary-600">{discoveryPercentage()}%</div>
                    <div className="text-xs text-gray-500">DigiDex</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-primary-600">{profileData.battles_won}</div>
                    <div className="text-xs text-gray-500">Battles Won</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-primary-600">{profileData.battles_completed || 0}</div>
                    <div className="text-xs text-gray-500">Battles Completed</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-primary-600">
                      {profileData.battles_completed ? 
                        Math.round((profileData.battles_won / profileData.battles_completed) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-primary-600">{profileData.current_streak}</div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Move report button to bottom of card */}
            {user?.id !== profileData.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <ReportButton 
                  userId={profileData.id} 
                  username={profileData.username} 
                  variant="icon" 
                />
              </div>
            )}
          </div>
          
          {/* Favorite Digimon */}
          {favoriteDigimon && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-4">Partner Digimon</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <img 
                        src={favoriteDigimon.digimon?.sprite_url} 
                        alt={favoriteDigimon.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{favoriteDigimon.name}</h3>
                    <p className="text-gray-600">Level {favoriteDigimon.current_level}</p>
                    <p className="text-sm text-gray-500">
                      {favoriteDigimon.digimon?.type}/{favoriteDigimon.digimon?.attribute}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stage: {favoriteDigimon.digimon?.stage}
                    </p>
                  </div>
                </div>
                
                {/* Stats Display */}
                <div className="flex-1 mt-4 md:mt-0">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-red-700">HP</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.hp_level1 ?? 0,
                          favoriteDigimon.digimon?.hp ?? 0,
                          favoriteDigimon.digimon?.hp_level99 ?? 0
                        ))}
                        {favoriteDigimon.hp_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.hp_bonus})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-yellow-600">SP</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.sp_level1 ?? 0,
                          favoriteDigimon.digimon?.sp ?? 0,
                          favoriteDigimon.digimon?.sp_level99 ?? 0
                        ))}
                        {favoriteDigimon.sp_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.sp_bonus})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-orange-600">ATK</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.atk_level1 ?? 0,
                          favoriteDigimon.digimon?.atk ?? 0,
                          favoriteDigimon.digimon?.atk_level99 ?? 0
                        ))}
                        {favoriteDigimon.atk_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.atk_bonus})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600">DEF</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.def_level1 ?? 0,
                          favoriteDigimon.digimon?.def ?? 0,
                          favoriteDigimon.digimon?.def_level99 ?? 0
                        ))}
                        {favoriteDigimon.def_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.def_bonus})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-purple-600">INT</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.int_level1 ?? 0,
                          favoriteDigimon.digimon?.int ?? 0,
                          favoriteDigimon.digimon?.int_level99 ?? 0
                        ))}
                        {favoriteDigimon.int_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.int_bonus})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-green-600">SPD</span>
                      <span>
                        {Math.round(calculateBaseStat(
                          favoriteDigimon.current_level,
                          favoriteDigimon.digimon?.spd_level1 ?? 0,
                          favoriteDigimon.digimon?.spd ?? 0,
                          favoriteDigimon.digimon?.spd_level99 ?? 0
                        ))}
                        {favoriteDigimon.spd_bonus > 0 && (
                          <span className="text-green-600 ml-1">(+{favoriteDigimon.spd_bonus})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Digimon Collection */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Digimon Collection</h2>
            
            {userDigimon.length === 0 ? (
              <p className="text-gray-500">No Digimon in collection yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {userDigimon.map(digimon => (
                  <div 
                    key={digimon.id} 
                    className="border rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleDigimonClick(digimon)}
                  >
                    <div className="w-16 h-16 mx-auto mb-2">
                      <img 
                        src={digimon.digimon?.sprite_url} 
                        alt={digimon.name || digimon.digimon?.name}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="font-medium">{digimon.name || digimon.digimon?.name}</div>
                    <div className="text-xs text-gray-500">Lv. {digimon.current_level}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Detail Modal */}
          {selectedDetailDigimon && (
            <DigimonDetailModal
              selectedDigimon={selectedDetailDigimon}
              onClose={() => setSelectedDetailDigimon(null)}
              // Only pass these props if it's the user's own profile
              {...(isOwnProfile ? {
                onSetActive: async (digimonId) => {
                  await useDigimonStore.getState().setActiveDigimon(digimonId);
                  // Refresh the data after setting active
                  const active = allUserDigimon.find(d => d.id === digimonId);
                  if (active) setFavoriteDigimon(active);
                },
                onShowEvolution: (digimonId) => {
                  // You could implement this if needed
                  console.log("Show evolution for", digimonId);
                },
                onRelease: (digimonId) => {
                  // You could implement this if needed
                  console.log("Release digimon", digimonId);
                }
              } : {})}
            />
          )}
          
          <AvatarSelectionModal 
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            onSelect={handleAvatarUpdate}
          />
        </>
      )}
    </div>
  );
};

export default ProfilePage; 