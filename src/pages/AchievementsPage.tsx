import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTitleStore, UserTitle } from '../store/titleStore';
import { Title, TITLES } from '../constants/titles';
import { useAuthStore } from '../store/authStore';
import DigiEggSelectionModal from '../components/DigiEggSelectionModal';
import { Lock, Medal, Clock, Bookmark, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterCategory = 'all' | Title['category'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, { badge: string; text: string }> = {
  bronze: {
    badge: 'bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-600/30',
    text: 'text-amber-800 dark:text-amber-400',
  },
  silver: {
    badge: 'bg-slate-400/10 text-slate-500 dark:text-slate-300 border border-slate-400/30',
    text: 'text-slate-600 dark:text-slate-300',
  },
  gold: {
    badge: 'bg-yellow-400/10 text-yellow-800 dark:text-yellow-300 border border-yellow-400/30',
    text: 'text-yellow-800 dark:text-yellow-300',
  },
  platinum: {
    badge: 'bg-purple-400/10 text-purple-600 dark:text-purple-300 border border-purple-400/30',
    text: 'text-purple-600 dark:text-purple-300',
  },
};

export { TIER_STYLES };

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: 'All',
  tasks: 'Tasks',
  streak: 'Streaks',
  battle: 'Battles',
  campaign: 'Legacy',
  tournament: 'Tournaments',
  collection: 'Collection',
  evolution: 'Evolution',
};

function formatRequirement(title: Title): string {
  const v = title.requirement_value;
  switch (title.requirement_type) {
    case 'tasks_completed':
      return `Complete ${v} task${Number(v) > 1 ? 's' : ''}`;
    case 'longest_streak':
      return `Reach a ${v}-day streak`;
    case 'battle_wins':
      return `Win ${v} arena battle${Number(v) > 1 ? 's' : ''}`;
    case 'tournament_round':
      return ['Reach the semifinals', 'Reach the Grand Final', 'Win a weekly tournament'][
        Number(v) - 1
      ];
    case 'campaign_stage':
      return `Clear Campaign Stage ${v}`;
    case 'digimon_count':
      return `Discover ${v} Digimon`;
    case 'digimon_stage':
      return `Evolve a Digimon to ${v} stage`;
    default:
      return String(v);
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface AchievementCardProps {
  title: Title;
  userTitle: UserTitle | null;
  onClaim: (userTitleId: number) => void;
  onToggleDisplay?: (userTitleId: number, isCurrentlyDisplayed: boolean) => void;
  claiming: boolean;
  claimDisabled: boolean;
  pinDisabled: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  userTitle,
  onClaim,
  onToggleDisplay,
  claiming,
  claimDisabled,
  pinDisabled,
}) => {
  const earned = !!userTitle;
  const claimed = earned && userTitle!.claimed_at !== null;
  const unclaimed = earned && userTitle!.claimed_at === null;
  const isPinned = claimed && !!userTitle!.is_displayed;
  const styles = TIER_STYLES[title.tier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col rounded-xl border overflow-hidden ${
        unclaimed
          ? 'border-accent-400 dark:border-accent-600 bg-white dark:bg-dark-300'
          : claimed
            ? 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300'
            : 'border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-400'
      }`}
    >
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Achievement name and actions */}
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`min-w-0 text-sm font-heading font-bold leading-tight ${styles.text}`}
            title={`${title.tier.charAt(0).toUpperCase() + title.tier.slice(1)} tier`}
          >
            {earned ? title.name : '???'}
            <span className="sr-only"> ({title.tier} tier)</span>
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Pin button — only for claimed titles when handler is provided */}
            {claimed && onToggleDisplay && (
              <button
                onClick={() => onToggleDisplay(userTitle!.id, isPinned)}
                disabled={pinDisabled}
                title={isPinned ? 'Unpin from profile' : 'Pin to profile'}
                aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${title.name}`}
                aria-pressed={isPinned}
                className={`ui-icon-button -my-3.5 -mr-3.5 ${
                  isPinned ? 'text-accent-800 dark:text-accent-400' : ''
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            )}
            {unclaimed && <Clock className={`h-4 w-4 ${styles.text} flex-shrink-0`} />}
            {!earned && <Lock className="h-4 w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />}
          </div>
        </div>

        {/* Description or unlock requirement */}
        <div>
          <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
            {earned ? title.description : formatRequirement(title)}
          </p>
        </div>

        {/* Rewards preview */}
        {earned && title.rewards && (
          <div className="flex flex-wrap gap-1 mt-1">
            {title.rewards.bits && (
              <span className="inline-flex items-center gap-1 text-xs font-body bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40 rounded-full px-2 py-0.5">
                <span className="font-semibold">{title.rewards.bits}</span> bits
              </span>
            )}
            {title.rewards.digiEggPool && (
              <span className="inline-flex items-center gap-1 text-xs font-body bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 rounded-full px-2 py-0.5">
                DigiEgg
              </span>
            )}
          </div>
        )}

        {/* Claimed date */}
        {claimed && userTitle!.earned_at && (
          <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-auto pt-1">
            Earned {formatDate(userTitle!.earned_at)}
          </p>
        )}
      </div>

      {/* Claim button */}
      {unclaimed && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onClaim(userTitle!.id)}
            disabled={claimDisabled}
            aria-busy={claiming}
            className="w-full btn-primary"
          >
            {claiming ? 'Claiming...' : 'Claim Reward'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AchievementsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    userTitles,
    fetchUserTitles,
    checkForNewTitles,
    claimAchievement,
    updateDisplayedTitle,
    unclaimedCount,
  } = useTitleStore();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [eggModal, setEggModal] = useState<{
    userTitleId: number;
    pool: number[];
    seed: string;
  } | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!user || initialCheckDone) return;
    const init = async () => {
      await fetchUserTitles();
      await checkForNewTitles();
      setInitialCheckDone(true);
    };
    init();
  }, [user]);

  // Build a map of earned titles for quick lookup
  const earnedMap = new Map<number, UserTitle>();
  userTitles.forEach((ut) => earnedMap.set(ut.title_id, ut));

  // Pinned titles (displayed on profile), sorted newest first
  const pinnedTitles = userTitles
    .filter((ut) => ut.is_displayed && ut.claimed_at !== null)
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 3);

  // Filter + sort achievements
  const activeTitles = TITLES.filter((title) => title.category !== 'campaign');
  const legacyTitles = TITLES.filter(
    (title) => title.category === 'campaign' && earnedMap.has(title.id)
  );
  const filtered =
    activeFilter === 'campaign'
      ? legacyTitles
      : activeTitles.filter((title) => activeFilter === 'all' || title.category === activeFilter);
  const sorted = [...filtered].sort((a, b) => {
    const utA = earnedMap.get(a.id);
    const utB = earnedMap.get(b.id);
    const scoreA = !utA ? 2 : utA.claimed_at ? 1 : 0;
    const scoreB = !utB ? 2 : utB.claimed_at ? 1 : 0;
    return scoreA - scoreB;
  });

  const handleClaim = async (userTitleId: number) => {
    const ut = userTitles.find((u) => u.id === userTitleId);
    if (!ut) return;
    const title = TITLES.find((t) => t.id === ut.title_id);
    if (!title) return;

    if (title.rewards?.digiEggPool && title.rewards.digiEggPool.length > 0) {
      const seed = `${user?.id ?? ''}:${userTitleId}`;
      setEggModal({ userTitleId, pool: title.rewards.digiEggPool, seed });
    } else {
      setClaimingId(userTitleId);
      await claimAchievement(userTitleId);
      setClaimingId(null);
    }
  };

  const handleEggSelect = async (digimonId: number) => {
    if (!eggModal) return;
    const { userTitleId } = eggModal;
    if (claimingId !== null) return;
    setClaimingId(userTitleId);
    const success = await claimAchievement(userTitleId, digimonId);
    if (success) setEggModal(null);
    setClaimingId(null);
  };

  const handleToggleDisplay = async (userTitleId: number, isCurrentlyDisplayed: boolean) => {
    if (togglingId !== null) return;
    setTogglingId(userTitleId);
    await updateDisplayedTitle(userTitleId, !isCurrentlyDisplayed);
    setTogglingId(null);
  };

  const pending = unclaimedCount();

  return (
    <div className="ui-page">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <Medal className="h-6 w-6 text-accent-700 dark:text-accent-400" />
          <h1 className="ui-page-title">Achievements</h1>
          {pending > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-50 dark:bg-accent-900/20 text-accent-800 dark:text-accent-400 border border-accent-200 dark:border-accent-800/40">
              {pending} to claim
            </span>
          )}
        </div>
        <p className="ui-description">
          Complete challenges to unlock titles, bits, and new Digimon.
          {!initialCheckDone && (
            <span className="ml-2 text-accent-700 dark:text-accent-400 animate-pulse">
              Checking for new achievements…
            </span>
          )}
        </p>
      </div>

      {/* Pinned to Profile */}
      <div className="mb-6 ui-panel p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Bookmark className="h-4 w-4 text-accent-700 dark:text-accent-400 fill-current" />
          <span className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">
            Pinned to Profile
          </span>
          <span className="text-xs font-body text-gray-500 dark:text-gray-400">
            · up to 3, shown publicly
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => {
            const ut = pinnedTitles[i];
            const title = ut ? TITLES.find((t) => t.id === ut.title_id) : null;
            const s = title ? TIER_STYLES[title.tier] : null;

            if (ut && title && s) {
              return (
                <div
                  key={ut.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200"
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-heading font-bold truncate ${s.text}`}
                      title={`${title.tier} tier`}
                    >
                      {title.name}
                      <span className="sr-only"> ({title.tier} tier)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleDisplay(ut.id, true)}
                    disabled={togglingId !== null}
                    title="Unpin from profile"
                    aria-label={`Unpin ${title.name}`}
                    className="ui-icon-button hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={i}
                className="flex min-h-16 items-center justify-center px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-dark-100"
              >
                <span className="text-xs font-body text-gray-500 dark:text-gray-400">
                  Empty slot
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-3">
          Click the{' '}
          <Bookmark className="inline h-3 w-3 fill-current text-accent-700 dark:text-accent-400" />{' '}
          icon on any claimed title below to pin it here.
          {pinnedTitles.length >= 3 && ' Adding a 4th will replace the oldest.'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {(Object.entries(CATEGORY_LABELS) as [FilterCategory, string][])
          .filter(([key]) => key !== 'campaign' || legacyTitles.length > 0)
          .map(([key, label]) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={isActive}
                className={`ui-tab ${isActive ? 'ui-tab-active' : ''}`}
              >
                {label}
              </button>
            );
          })}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => {
          const total = activeTitles.filter((t) => t.tier === tier).length;
          const earned = userTitles.filter(
            (ut) => activeTitles.find((t) => t.id === ut.title_id)?.tier === tier
          ).length;
          const s = TIER_STYLES[tier];
          return (
            <div
              key={tier}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300"
            >
              <span className={`text-xs font-heading font-bold uppercase ${s.text}`}>{tier}</span>
              <span className="text-xs font-body text-gray-600 dark:text-gray-400">
                {earned}/{total}
              </span>
            </div>
          );
        })}
      </div>

      {activeFilter === 'campaign' && (
        <p className="ui-description mb-4">
          Legacy achievements were earned in the retired campaign. Your titles, pinned titles and
          unclaimed rewards are preserved. They do not count toward active achievement completion.
        </p>
      )}
      {/* Achievement grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((title) => (
            <AchievementCard
              key={title.id}
              title={title}
              userTitle={earnedMap.get(title.id) ?? null}
              onClaim={handleClaim}
              claiming={claimingId === (earnedMap.get(title.id)?.id ?? null) && claimingId !== null}
              claimDisabled={claimingId !== null}
              onToggleDisplay={handleToggleDisplay}
              pinDisabled={togglingId !== null}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* DigiEgg picker modal */}
      {eggModal && (
        <DigiEggSelectionModal
          pool={eggModal.pool}
          seed={eggModal.seed}
          onSelect={handleEggSelect}
          onClose={() => setEggModal(null)}
        />
      )}
    </div>
  );
};

export default AchievementsPage;
