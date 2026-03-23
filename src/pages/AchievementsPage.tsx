import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTitleStore, UserTitle } from '../store/titleStore';
import { Title, TITLES } from '../constants/titles';
import { useAuthStore } from '../store/authStore';
import DigiEggSelectionModal from '../components/DigiEggSelectionModal';
import { Lock, Medal, CheckCircle2, Clock, Bookmark, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterCategory = 'all' | Title['category'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, { border: string; glow: string; badge: string; text: string }> = {
  bronze: {
    border: 'border-amber-600/60',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-700/20 text-amber-600 dark:text-amber-400 border border-amber-600/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  silver: {
    border: 'border-slate-400/60',
    glow: 'shadow-slate-400/20',
    badge: 'bg-slate-400/10 text-slate-500 dark:text-slate-300 border border-slate-400/30',
    text: 'text-slate-500 dark:text-slate-300',
  },
  gold: {
    border: 'border-yellow-400/60',
    glow: 'shadow-yellow-400/30',
    badge: 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-300 border border-yellow-400/30',
    text: 'text-yellow-600 dark:text-yellow-300',
  },
  platinum: {
    border: 'border-purple-400/60',
    glow: 'shadow-purple-400/30',
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
  campaign: 'Campaign',
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
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  userTitle,
  onClaim,
  onToggleDisplay,
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
      className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-shadow duration-300 ${
        unclaimed
          ? `${styles.border} shadow-lg ${styles.glow} bg-white dark:bg-dark-300`
          : claimed
            ? 'border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300'
            : 'border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-400 opacity-70'
      }`}
    >
      {/* Unclaimed glow pulse */}
      {unclaimed && (
        <div
          className={`absolute inset-0 rounded-xl ${styles.border} border-2 animate-pulse pointer-events-none`}
        />
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Top row: tier badge + actions */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-heading font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${styles.badge}`}
          >
            {title.tier}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Pin button — only for claimed titles when handler is provided */}
            {claimed && onToggleDisplay && (
              <button
                onClick={() => onToggleDisplay(userTitle!.id, isPinned)}
                title={isPinned ? 'Unpin from profile' : 'Pin to profile'}
                className={`transition-colors ${
                  isPinned
                    ? 'text-purple-500 hover:text-purple-400'
                    : 'text-gray-300 dark:text-gray-600 hover:text-purple-400'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            )}
            {claimed && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
            {unclaimed && <Clock className={`h-4 w-4 ${styles.text} flex-shrink-0`} />}
            {!earned && <Lock className="h-4 w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />}
          </div>
        </div>

        {/* Title name */}
        <div>
          {earned ? (
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {title.name}
            </h3>
          ) : (
            <h3 className="text-sm font-heading font-bold text-gray-400 dark:text-gray-600 leading-tight">
              ???
            </h3>
          )}
          <p className="text-xs font-body text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
            {earned ? title.description : formatRequirement(title)}
          </p>
        </div>

        {/* Rewards preview */}
        {earned && title.rewards && (
          <div className="flex flex-wrap gap-1 mt-1">
            {title.rewards.bits && (
              <span className="inline-flex items-center gap-1 text-[10px] font-body bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40 rounded-full px-2 py-0.5">
                <span className="font-semibold">{title.rewards.bits}</span> bits
              </span>
            )}
            {title.rewards.digiEggPool && (
              <span className="inline-flex items-center gap-1 text-[10px] font-body bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 rounded-full px-2 py-0.5">
                DigiEgg
              </span>
            )}
          </div>
        )}

        {/* Claimed date */}
        {claimed && userTitle!.earned_at && (
          <p className="text-[10px] font-body text-gray-400 dark:text-gray-600 mt-auto pt-1">
            Earned {formatDate(userTitle!.earned_at)}
          </p>
        )}
      </div>

      {/* Claim button */}
      {unclaimed && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onClaim(userTitle!.id)}
            className="w-full py-2 px-3 rounded-lg text-sm font-heading font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-sm transition-all duration-150"
          >
            Claim Reward
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
  const filtered = TITLES.filter((t) => activeFilter === 'all' || t.category === activeFilter);
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
    setEggModal(null);
    setClaimingId(userTitleId);
    await claimAchievement(userTitleId, digimonId);
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
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Medal className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Achievements
          </h1>
          {pending > 0 && (
            <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-body bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
              {pending} to claim
            </span>
          )}
        </div>
        <p className="text-sm font-body text-gray-500 dark:text-gray-400">
          Complete challenges to unlock titles, bits, and new Digimon.
          {!initialCheckDone && (
            <span className="ml-2 text-purple-500 animate-pulse">
              Checking for new achievements…
            </span>
          )}
        </p>
      </div>

      {/* Pinned to Profile */}
      <div className="mb-6 bg-white dark:bg-dark-300 rounded-xl border border-gray-100 dark:border-dark-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="h-4 w-4 text-purple-500 fill-current" />
          <span className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">
            Pinned to Profile
          </span>
          <span className="text-xs font-body text-gray-400 dark:text-gray-500">
            · up to 3, shown publicly
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => {
            const ut = pinnedTitles[i];
            const title = ut ? TITLES.find((t) => t.id === ut.title_id) : null;
            const s = title ? TIER_STYLES[title.tier] : null;

            if (ut && title && s) {
              return (
                <div
                  key={ut.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 ${s.border} bg-white dark:bg-dark-400`}
                >
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-heading font-bold truncate ${s.text}`}>
                      {title.name}
                    </div>
                    <div
                      className={`text-[10px] font-body uppercase tracking-wide opacity-70 ${s.text}`}
                    >
                      {title.tier}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleDisplay(ut.id, true)}
                    disabled={togglingId !== null}
                    title="Unpin from profile"
                    className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={i}
                className="flex items-center justify-center px-3 py-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-dark-100"
              >
                <span className="text-xs font-body text-gray-300 dark:text-gray-600">
                  Empty slot
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] font-body text-gray-400 dark:text-gray-500 mt-2.5">
          Click the <Bookmark className="inline h-3 w-3 fill-current text-purple-400" /> icon on any
          claimed title below to pin it here.
          {pinnedTitles.length >= 3 && ' Adding a 4th will replace the oldest.'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {(Object.entries(CATEGORY_LABELS) as [FilterCategory, string][]).map(([key, label]) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => {
          const total = TITLES.filter((t) => t.tier === tier).length;
          const earned = userTitles.filter(
            (ut) => TITLES.find((t) => t.id === ut.title_id)?.tier === tier
          ).length;
          const s = TIER_STYLES[tier];
          return (
            <div
              key={tier}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.border} bg-white dark:bg-dark-300`}
            >
              <span className={`text-xs font-heading font-bold uppercase ${s.text}`}>{tier}</span>
              <span className="text-xs font-body text-gray-600 dark:text-gray-400">
                {earned}/{total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Achievement grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((title) => (
            <AchievementCard
              key={title.id}
              title={title}
              userTitle={earnedMap.get(title.id) ?? null}
              onClaim={claimingId === null ? handleClaim : () => {}}
              onToggleDisplay={togglingId === null ? handleToggleDisplay : undefined}
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
