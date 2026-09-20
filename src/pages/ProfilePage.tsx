import { getDigidexProgress, getDigidexPercentage } from '../utils/digidexProgress';
import { fetchAllRows } from '../utils/fetchAllRows';
import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
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
import DigimonCardIdentity from '../components/DigimonCardIdentity';
import DigimonStatRow from '../components/DigimonStatRow';

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
  const reducedMotion = useReducedMotion();
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
  const profileKey = `${id ?? ''}:${username ?? ''}:${user?.id ?? ''}`;
  const [loadedProfileKey, setLoadedProfileKey] = useState<string | null>(null);
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
    let cancelled = false;
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
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
            discoveredCount = getDigidexProgress(discoveredDigimon).count;
          } else {
            const discoveries = await fetchAllRows((from, to) =>
              supabase
                .from('user_discovered_digimon')
                .select('digimon_id')
                .eq('user_id', profileId)
                .order('id')
                .range(from, to)
            );
            discoveredCount = getDigidexProgress(discoveries.map((row) => row.digimon_id)).count;
          }
        } catch (err) {
          console.error('No streak data found:', err);
        }

        if (cancelled) return;
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
          if (cancelled) return;
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

          if (cancelled) return;
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

              if (cancelled) return;
              setUserTitles(enrichedTitles);
            }
          } catch (err) {
            console.error('Error fetching user titles:', err);
          }
        }
        if (!cancelled) setLoadedProfileKey(profileKey);
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      cancelled = true;
    };
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

  const discoveryPercentage = isOwnProfile
    ? getDigidexProgress(discoveredDigimon).percentage
    : getDigidexPercentage(profileData?.discovered_count ?? 0);

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
      text: 'Your profile shows your collection, achievements and progress. Use the profile controls to change your avatar.',
    },
    {
      speaker: 'neemon',
      text: 'Choose up to 3 earned titles to show off. You can come back to customize these later!',
    },
  ];

  if ((loading && !profileData) || (!error && loadedProfileKey !== profileKey)) {
    return (
      <div className="ui-page max-w-4xl" role="status" aria-busy="true">
        <span className="sr-only">Loading profile…</span>
        <div className="space-y-4">
          <div className="h-40 bg-gray-100 dark:bg-dark-200 rounded-2xl ui-skeleton-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-dark-200 rounded-xl ui-skeleton-pulse"
              />
            ))}
          </div>
          <div className="h-32 bg-gray-100 dark:bg-dark-200 rounded-2xl ui-skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="font-body text-red-500 mb-4">{error || 'Profile not found'}</p>
        <Link
          to="/"
          className="font-body text-accent-800 dark:text-accent-400 hover:underline transition-colors"
        >
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
      color: 'text-accent-800 dark:text-accent-400',
      bg: 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800/40',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      color: 'text-teal-700 dark:text-teal-400',
      bg: 'bg-green-400/10 border-green-400/20',
    },
    {
      label: 'Streak',
      value: `${profileData.current_streak}d`,
      color: 'text-accent-800 dark:text-accent-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      label: 'DigiDex',
      value: `${discoveryPercentage}%`,
      color: 'text-primary-700 dark:text-primary-400',
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

  const favoriteStatReferences: Record<string, number> = {
    HP: favoriteDigimon?.digimon?.hp_level99 ?? 2000,
    SP: favoriteDigimon?.digimon?.sp_level99 ?? 600,
    ATK: favoriteDigimon?.digimon?.atk_level99 ?? 600,
    DEF: favoriteDigimon?.digimon?.def_level99 ?? 600,
    INT: favoriteDigimon?.digimon?.int_level99 ?? 600,
    SPD: favoriteDigimon?.digimon?.spd_level99 ?? 600,
  };

  return (
    <div className="ui-page max-w-4xl space-y-6">
      {isOwnProfile && <PageTutorial tutorialId="profile_intro" steps={profilePageTutorialSteps} />}
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-200 flex items-center justify-center overflow-hidden border-2 border-accent-500/50">
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
                className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-accent-600 hover:bg-accent-500 text-gray-950 dark:bg-accent-500 dark:hover:bg-accent-400 flex items-center justify-center transition-colors shadow-md cursor-pointer"
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
              <h1 className="ui-page-title">{profileData.username}</h1>
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
            className={`flex-1 ui-tab ${
              activeTab === 'overview'
                ? 'ui-tab-active'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`relative flex-1 ui-tab ${
              activeTab === 'achievements'
                ? 'ui-tab-active'
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
            <section className="card" aria-label="Active Digimon">
              <h2 className="ui-section-title mb-4">
                {isOwnProfile ? 'Active Digimon' : `${profileData.username}'s Active Digimon`}
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => handleDigimonClick(favoriteDigimon)}
                  aria-label={`View ${favoriteDigimon.name || favoriteDigimon.digimon?.name} details`}
                  className="sm:w-2/5 min-w-0 rounded-xl border border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/10 flex flex-col items-center p-4 hover:border-accent-500 transition-colors"
                >
                  <div className="h-40 w-full flex items-center justify-center">
                    <DigimonSprite
                      digimonName={favoriteDigimon.digimon?.name || ''}
                      fallbackSpriteUrl={favoriteDigimon.digimon?.sprite_url || ''}
                      size="lg"
                      happiness={favoriteDigimon.happiness}
                      showHappinessAnimations={!reducedMotion}
                    />
                  </div>
                  <DigimonCardIdentity
                    name={favoriteDigimon.name || favoriteDigimon.digimon?.name || 'Digimon'}
                    level={favoriteDigimon.current_level}
                    type={favoriteDigimon.digimon?.type}
                    attribute={favoriteDigimon.digimon?.attribute}
                  />
                  {favoriteDigimon.digimon?.stage && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {favoriteDigimon.digimon.stage}
                    </p>
                  )}
                </button>
                <div className="sm:w-3/5 min-w-0 flex flex-col">
                  <h3 className="ui-section-title mb-3">Stats</h3>
                  <div className="space-y-3">
                    {favoriteStatEntries.map(({ key, val }) => (
                      <DigimonStatRow
                        key={key}
                        label={key}
                        value={val}
                        maxReference={favoriteStatReferences[key]}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDigimonClick(favoriteDigimon)}
                      className="btn-outline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Digimon Collection */}
          <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 p-4 sm:p-6">
            <h2 className="ui-section-title mb-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {userDigimon.map((digimon) => (
                  <button
                    key={digimon.id}
                    onClick={() => handleDigimonClick(digimon)}
                    aria-label={`View ${digimon.name || digimon.digimon?.name}, level ${digimon.current_level}`}
                    className={`w-full min-w-0 min-h-48 aspect-square rounded-xl border p-2 pb-4 flex flex-col items-center justify-center transition-colors ${digimon.is_active ? 'border-accent-300 dark:border-accent-700 bg-accent-50/50 dark:bg-accent-900/10' : 'border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200'} hover:border-accent-500`}
                  >
                    <div
                      className="h-28 sm:h-32 w-full flex items-center justify-center overflow-hidden"
                      aria-hidden="true"
                    >
                      <div className="scale-75 sm:scale-100">
                        <DigimonSprite
                          digimonName={digimon.digimon?.name || ''}
                          fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                          size="md"
                          happiness={digimon.happiness}
                          showHappinessAnimations={!reducedMotion}
                        />
                      </div>
                    </div>
                    <DigimonCardIdentity
                      name={digimon.name || digimon.digimon?.name || 'Digimon'}
                      level={digimon.current_level}
                      type={digimon.digimon?.type}
                      attribute={digimon.digimon?.attribute}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Activity Heatmap — own profile only */}
          {isOwnProfile && (
            <div className="bg-white dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-dark-100 p-4 sm:p-6">
              <h2 className="ui-section-title mb-4">Task activity</h2>
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
    </div>
  );
};

export default ProfilePage;
