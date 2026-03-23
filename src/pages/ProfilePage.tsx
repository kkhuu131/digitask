import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AchievementsPage from './AchievementsPage';
import { useAuthStore } from '../store/authStore';
import { useDigimonStore, UserDigimon } from '../store/petStore';
import { supabase } from '../lib/supabase';
import { calculateFinalStats } from '../utils/digimonStatCalculation';
import DigimonDetailModal from '../components/DigimonDetailModal';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import ReportButton from '../components/ReportButton';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { useTitleStore, UserTitle } from '../store/titleStore';
import { TIER_STYLES } from './AchievementsPage';
import DigimonSprite from '../components/DigimonSprite';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import TaskHeatmap from '../components/TaskHeatmap';

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

const statColors: Record<string, string> = {
  HP: 'text-red-400',
  SP: 'text-cyan-400',
  ATK: 'text-orange-400',
  DEF: 'text-blue-400',
  INT: 'text-purple-400',
  SPD: 'text-green-400',
};

const ProfilePage = () => {
  const { id } = useParams<{ id?: string }>();
  const { username } = useParams<{ username?: string }>();
  const { user, userProfile } = useAuthStore();
  const { discoveredDigimon, allUserDigimon } = useDigimonStore();
  const navigate = useNavigate();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>(
    location.hash === '#achievements' ? 'achievements' : 'overview'
  );
  const { unclaimedCount } = useTitleStore();
  const pendingAchievements = unclaimedCount();

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
  const isOwnProfile = Boolean(
    (!id && !username) ||
    (id && id === user?.id) ||
    (username && username === userProfile?.username)
  );

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        let profileId = id || user?.id;

        // If username is provided, look up the user ID
        if (username) {
          const { data: userByUsername, error: usernameError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (usernameError) {
            throw new Error('User not found');
          }

          profileId = userByUsername.id;
        }

        if (!profileId) {
          throw new Error('No profile ID available');
        }

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
            id,
            username,
            avatar_url,
            created_at,
            battles_won,
            battles_completed
          `
          )
          .eq('id', profileId)
          .single();

        if (profileError) throw profileError;

        // Fetch streak data separately
        let currentStreak = 0;
        let discoveredCount = 0;
        try {
          const { data: quotaData, error: quotaError } = await supabase
            .from('daily_quotas')
            .select('current_streak')
            .eq('user_id', profileId)
            .single();

          if (!quotaError && quotaData) {
            currentStreak = quotaData.current_streak || 0;
          }

          if (isOwnProfile) {
            discoveredCount = discoveredDigimon.length || 0;
          } else {
            const { count: discoveredCountData, error: discoveredCountError } = await supabase
              .from('user_discovered_digimon')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profileId);

            if (!discoveredCountError && discoveredCountData !== null) {
              discoveredCount = discoveredCountData || 0;
            }
          }
        } catch (err) {
          console.log('No streak data found:', err);
        }

        setProfileData({
          ...profile,
          battles_won: profile.battles_won || 0,
          current_streak: currentStreak,
          discovered_count: discoveredCount,
        });

        // If viewing own profile, use the store data
        if (isOwnProfile) {
          setUserDigimon(allUserDigimon);
          const active = allUserDigimon.find((d) => d.is_active);
          if (active) setFavoriteDigimon(active);
          await fetchUserTitles();
          const { userTitles } = useTitleStore.getState();
          setUserTitles(userTitles);
        } else {
          // Fetch the user's Digimon
          const { data: digimonRawData, error: digimonError } = await supabase
            .from('user_digimon')
            .select('*')
            .eq('user_id', profileId)
            .order('current_level', { ascending: false });

          if (digimonError) throw digimonError;

          const digimonData = digimonRawData.map((digimon) => ({
            ...digimon,
            digimon: DIGIMON_LOOKUP_TABLE[digimon.digimon_id],
          }));

          setUserDigimon(digimonData);
          const active = digimonData.find((d) => d.is_active);
          if (active) setFavoriteDigimon(active);

          // Fetch titles for other user
          try {
            const { data: titlesData, error: titlesError } = await supabase
              .from('user_titles')
              .select(
                `
                id,
                title_id,
                is_displayed,
                earned_at
              `
              )
              .eq('user_id', profileId)
              .order('earned_at', { ascending: false });

            if (!titlesError && titlesData) {
              const enrichedTitles = titlesData.map((userTitle) => ({
                ...userTitle,
                title: useTitleStore
                  .getState()
                  .availableTitles.find((t) => t.id === userTitle.title_id),
              }));

              setUserTitles(enrichedTitles);
            }
          } catch (err) {
            console.error('Error fetching user titles:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [
    id,
    username,
    user?.id,
    userProfile?.username,
    isOwnProfile,
    allUserDigimon,
    navigate,
    fetchUserTitles,
  ]);

  // Calculate Digimon discovery percentage
  const discoveryPercentage = () => {
    const totalDigimon = 341;
    return profileData?.discovered_count
      ? Math.round((profileData.discovered_count / totalDigimon) * 100)
      : 0;
  };

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

      setProfileData((prev) => (prev ? { ...prev, avatar_url: spriteUrl } : null));
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const profilePageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: 'Welcome to your profile page! Here you can view your Digimon, your titles, and your stats.',
    },
    {
      speaker: 'neemon',
      text: 'Ooh you can change your avatar here!',
    },
    {
      speaker: 'bokomon',
      text: 'You can also change and set up to 3 titles to show off your achievements!',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-40 bg-gray-100 dark:bg-dark-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-dark-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-32 bg-gray-100 dark:bg-dark-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="font-body text-red-500 mb-4">{error || 'Profile not found'}</p>
        <Link to="/" className="font-body text-purple-500 hover:text-purple-400 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const winRate =
    profileData.battles_completed > 0
      ? Math.round((profileData.battles_won / profileData.battles_completed) * 100)
      : 0;

  const statCards = [
    {
      label: 'Victories',
      value: profileData.battles_won,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 border-purple-400/20',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      color: 'text-green-400',
      bg: 'bg-green-400/10 border-green-400/20',
    },
    {
      label: 'Streak',
      value: `${profileData.current_streak}d`,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      label: 'DigiDex',
      value: `${discoveryPercentage()}%`,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20',
    },
  ];

  const favoriteStats = favoriteDigimon ? calculateFinalStats(favoriteDigimon) : null;
  const favoriteStatEntries = favoriteStats
    ? [
        { key: 'HP', val: favoriteStats.hp },
        { key: 'SP', val: favoriteStats.sp },
        { key: 'ATK', val: favoriteStats.atk },
        { key: 'DEF', val: favoriteStats.def },
        { key: 'INT', val: favoriteStats.int },
        { key: 'SPD', val: favoriteStats.spd },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-100 dark:border-dark-100 p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center overflow-hidden border-4 border-purple-500/40 shadow-lg shadow-purple-900/20">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.username}
                  className="w-16 h-16 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="font-heading text-3xl font-bold text-gray-400 dark:text-gray-500">
                  {profileData.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                aria-label="Change avatar"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          {/* Username + Titles */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profileData.username}
              </h1>
              {!isOwnProfile && (
                <ReportButton
                  userId={profileData.id}
                  username={profileData.username}
                  variant="icon-only"
                />
              )}
            </div>
            {/* Displayed titles — read-only chips; edit via Achievements tab */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {userTitles
                .filter((ut) => ut.is_displayed && ut.claimed_at !== null)
                .slice(0, 3)
                .map((ut) => {
                  const s = TIER_STYLES[ut.title?.tier || 'bronze'];
                  return (
                    <span
                      key={ut.id}
                      className={`text-xs font-heading font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}
                      title={ut.title?.description}
                    >
                      {ut.title?.name}
                    </span>
                  );
                })}
              {userTitles.filter((ut) => ut.is_displayed && ut.claimed_at !== null).length ===
                0 && (
                <span className="text-xs font-body text-gray-400 dark:text-gray-500 italic">
                  {isOwnProfile ? 'No titles pinned yet' : 'No titles displayed'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {statCards.map((card) => (
            <div key={card.label} className={`rounded-xl border p-3 text-center ${card.bg}`}>
              <div
                className={`font-body text-xs font-semibold uppercase tracking-wide mb-1 ${card.color}`}
              >
                {card.label}
              </div>
              <div className={`font-heading text-xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs — only shown on own profile */}
      {isOwnProfile && (
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-heading font-semibold transition-all duration-150 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-heading font-semibold transition-all duration-150 ${
              activeTab === 'achievements'
                ? 'bg-white dark:bg-dark-300 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Achievements
            {pendingAchievements > 0 && (
              <span className="min-w-[18px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                {pendingAchievements}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Achievements tab content */}
      {isOwnProfile && activeTab === 'achievements' && <AchievementsPage />}

      {/* Overview content — hidden when Achievements tab is active */}
      {(!isOwnProfile || activeTab === 'overview') && (
        <>
          {/* Active Digimon */}
          {favoriteDigimon && (
            <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-100 dark:border-dark-100 p-6">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {isOwnProfile ? 'Active Digimon' : `${profileData.username}'s Active Digimon`}
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Sprite */}
                <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100">
                  <DigimonSprite
                    digimonName={favoriteDigimon.digimon?.name || ''}
                    fallbackSpriteUrl={favoriteDigimon.digimon?.sprite_url || ''}
                    size="lg"
                    showHappinessAnimations={true}
                    happiness={favoriteDigimon.happiness}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 dark:text-gray-100">
                        {favoriteDigimon.name || favoriteDigimon.digimon?.name}
                      </h3>
                      <p className="font-body text-xs text-gray-400 dark:text-gray-500">
                        Lv. {favoriteDigimon.current_level} · {favoriteDigimon.digimon?.stage || ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDigimonClick(favoriteDigimon)}
                      className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-body font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {favoriteStatEntries.map(({ key, val }) => (
                      <div
                        key={key}
                        className="bg-gray-50 dark:bg-dark-200 rounded-lg py-2 text-center border border-gray-100 dark:border-dark-100"
                      >
                        <div
                          className={`font-body text-xs font-semibold mb-0.5 ${statColors[key]}`}
                        >
                          {key}
                        </div>
                        <div className="font-heading font-bold text-sm text-gray-900 dark:text-gray-100">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Digimon Collection */}
          <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-100 dark:border-dark-100 p-6">
            <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {isOwnProfile ? 'My Digimon' : `${profileData.username}'s Digimon`}
              <span className="ml-2 font-body font-normal text-sm text-gray-400 dark:text-gray-500">
                ({userDigimon.length})
              </span>
            </h2>

            {userDigimon.length === 0 ? (
              <div className="text-center py-10 font-body text-gray-400 dark:text-gray-500">
                No Digimon yet
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {userDigimon.map((digimon) => (
                  <div
                    key={digimon.id}
                    onClick={() => handleDigimonClick(digimon)}
                    className="bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-100 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all duration-150 hover:shadow-sm p-3 flex flex-col items-center gap-1"
                  >
                    <div className="w-14 h-14 flex items-center justify-center">
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ''}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                        size="sm"
                        showHappinessAnimations={false}
                      />
                    </div>
                    <div className="font-body font-semibold text-xs text-gray-800 dark:text-gray-200 truncate max-w-full text-center">
                      {digimon.name || digimon.digimon?.name}
                    </div>
                    <div className="font-body text-xs text-gray-400 dark:text-gray-500">
                      Lv. {digimon.current_level}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Heatmap — own profile only */}
          {isOwnProfile && (
            <div className="bg-white dark:bg-dark-300 rounded-2xl border border-gray-100 dark:border-dark-100 p-6">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Activity
              </h2>
              <TaskHeatmap />
            </div>
          )}
        </>
      )}

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

      {isOwnProfile && <PageTutorial tutorialId="profile_intro" steps={profilePageTutorialSteps} />}
    </div>
  );
};

export default ProfilePage;
