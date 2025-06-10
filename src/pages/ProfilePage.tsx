import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDigimonStore, UserDigimon } from "../store/petStore";
import { supabase } from "../lib/supabase";
import { calculateFinalStats } from "../utils/digimonStatCalculation";
import DigimonDetailModal from "../components/DigimonDetailModal";
import AvatarSelectionModal from "../components/AvatarSelectionModal";
import ReportButton from '../components/ReportButton';
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { useTitleStore, UserTitle } from '../store/titleStore';
import UserTitles from '../components/UserTitles';
import DigimonSprite from '../components/DigimonSprite';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';

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
  const [userTitles, setUserTitles] = useState<UserTitle[]>([]);
  const { fetchUserTitles } = useTitleStore();
  
  // Determine if viewing own profile
  const isOwnProfile = Boolean(!id && !username || 
                      (id && id === user?.id) || 
                      (username && username === userProfile?.username));
  
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
          await fetchUserTitles();
          const { userTitles } = useTitleStore.getState();
          setUserTitles(userTitles);
        } else {
          // Fetch the user's Digimon
          const { data: digimonRawData, error: digimonError } = await supabase
            .from("user_digimon")
            .select("*")
            .eq("user_id", profileId)
            .order("current_level", { ascending: false });
            
          if (digimonError) throw digimonError;

          const digimonData = digimonRawData.map(digimon => ({
            ...digimon,
            digimon: DIGIMON_LOOKUP_TABLE[digimon.digimon_id]
          }));
          
          setUserDigimon(digimonData);
          const active = digimonData.find(d => d.is_active);
          if (active) setFavoriteDigimon(active);
          
          // Fetch titles for other user
          try {
            const { data: titlesData, error: titlesError } = await supabase
              .from('user_titles')
              .select(`
                id,
                title_id,
                is_displayed,
                earned_at
              `)
              .eq('user_id', profileId)
              .order('earned_at', { ascending: false });
              
            if (!titlesError && titlesData) {
              // Enrich with title details from constants
              const enrichedTitles = titlesData.map(userTitle => ({
                ...userTitle,
                title: useTitleStore.getState().availableTitles.find(t => t.id === userTitle.title_id)
              }));
              
              setUserTitles(enrichedTitles);
            }
          } catch (err) {
            console.error("Error fetching user titles:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, username, user?.id, userProfile?.username, isOwnProfile, allUserDigimon, navigate, fetchUserTitles]);
  
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
    }
  };

  const profilePageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to your profile page! Here you can view your Digimon, your titles, and your stats."
    },
    {
      speaker: 'neemon',
      text: "Ooh you can change your avatar here!"
    },
    {
      speaker: 'bokomon',
      text: "You can also change and set up to 3 titles to show off your achievements!"
    },
  ];
  
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-accent-400"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8">
          <h2 className="text-xl text-red-600 dark:text-red-400 font-bold mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-primary-500 dark:bg-accent-500 text-white rounded-md hover:bg-primary-600 dark:hover:bg-accent-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      ) : profileData ? (
        <>
          {/* Profile Header */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-200 p-6 mb-6">
            {/* Avatar and Username */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center overflow-hidden border-4 border-primary-100 dark:border-dark-100">
                  {profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt={profileData.username}
                      className="w-24 h-24 object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-2xl">
                      {profileData.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-primary-500 dark:bg-accent-500 text-white p-1.5 rounded-full hover:bg-primary-600 dark:hover:bg-accent-600 transition-colors"
                    aria-label="Change avatar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-center md:text-left dark:text-gray-100">{profileData.username}</h1>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
                <div className="text-primary-600 dark:text-primary-400 text-sm font-medium">Victories</div>
                <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">{profileData.battles_won}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-green-600 dark:text-green-400 text-sm font-medium">Win Rate</div>
                <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">
                  {profileData.battles_completed > 0 
                    ? `${Math.round((profileData.battles_won / profileData.battles_completed) * 100)}%` 
                    : '0%'}
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">Streak</div>
                <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">{profileData.current_streak} days</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">DigiDex</div>
                <div className="text-gray-900 dark:text-gray-100 text-lg font-bold">{discoveryPercentage()}%</div>
              </div>
            </div>
            
            {/* Titles */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <UserTitles 
                titles={userTitles} 
                isOwnProfile={isOwnProfile}
              />
            </div>
            
            {!isOwnProfile && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-200 flex justify-end">
                <ReportButton userId={profileData.id} username={profileData.username} />
              </div>
            )}
          </div>
          
          {/* Favorite Digimon */}
          {favoriteDigimon && (
            <div className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-200 p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                {isOwnProfile ? 'Active Digimon' : `${profileData.username}'s Active Digimon`}
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={favoriteDigimon.digimon?.name || ""}
                    fallbackSpriteUrl={favoriteDigimon.digimon?.sprite_url || ""}
                    size="lg"
                    showHappinessAnimations={true}
                    happiness={favoriteDigimon.happiness}
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-bold dark:text-gray-100">
                      {favoriteDigimon.name || favoriteDigimon.digimon?.name}
                      <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                        Lv. {favoriteDigimon.current_level}
                      </span>
                    </h3>
                    
                    <div className="mt-2 md:mt-0">
                      <button
                        onClick={() => handleDigimonClick(favoriteDigimon)}
                        className="text-sm px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-800/30"
                      >
                        View Details
                      </button>
                    </div>
                  </div>


                  {/* Stats */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">HP</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).hp}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">SP</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).sp}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">ATK</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).atk}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">DEF</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).def}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">INT</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).int}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-200 p-1.5 rounded text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">SPD</div>
                      <div className="font-medium dark:text-gray-200">
                        {calculateFinalStats(favoriteDigimon).spd}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Digimon Collection */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-sm border border-gray-200 dark:border-dark-200 p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
              {isOwnProfile ? 'My Digimon' : `${profileData.username}'s Digimon`}
            </h2>
            
            {userDigimon.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No Digimon yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userDigimon.map(digimon => (
                  <div 
                    key={digimon.id}
                    onClick={() => handleDigimonClick(digimon)}
                    className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg border border-gray-200 dark:border-dark-400 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ""}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || ""}
                        size="sm"
                        showHappinessAnimations={false}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="font-medium text-sm truncate max-w-full dark:text-gray-200">
                        {digimon.name || digimon.digimon?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Lv. {digimon.current_level}</div>
                    </div>
                    {/* {digimon.is_active && (
                      <div className="mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                        Active
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Modals */}
          {selectedDetailDigimon && (
            <DigimonDetailModal
              selectedDigimon={selectedDetailDigimon}
              onClose={() => setSelectedDetailDigimon(null)}
            />
          )}
          
          {isAvatarModalOpen && (
            <AvatarSelectionModal
              isOpen={isAvatarModalOpen}
              onClose={() => setIsAvatarModalOpen(false)}
              onSelect={handleAvatarUpdate}
            />
          )}
        </>
      ) : null}
      
      {isOwnProfile && (
        <PageTutorial 
          tutorialId="profile_intro" 
          steps={profilePageTutorialSteps} 
        />
      )}
    </div>
  );
};

export default ProfilePage; 