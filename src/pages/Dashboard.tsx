import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDigimonStore } from '../store/petStore';
import { useTaskStore, DAILY_QUOTA_AMOUNT } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Digimon from '../components/Digimon';
import PartyMembersGrid from '../components/PartyMembersGrid';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useNavigate, Link } from 'react-router-dom';
import { useTitleStore } from '../store/titleStore';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';
import { Award, Plus, ChevronRight } from 'lucide-react';

const AchievementsCallout: React.FC = () => {
  const { unclaimedCount } = useTitleStore();
  const pending = unclaimedCount();
  return (
    <Link
      to="/achievements"
      className={`card border-l-4 flex items-center gap-3 py-3 px-4 transition-all duration-150 hover:shadow-md ${
        pending > 0
          ? 'border-l-accent-500 bg-accent-50 dark:bg-accent-900/20'
          : 'border-l-gray-300 dark:border-l-gray-600'
      }`}
    >
      <div
        className={`p-2 rounded-lg shrink-0 ${pending > 0 ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-gray-100 dark:bg-dark-200'}`}
      >
        <Award
          className={`w-4 h-4 ${pending > 0 ? 'text-accent-800 dark:text-accent-400' : 'text-gray-500 dark:text-gray-400'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">
          Achievements
        </p>
        <p className="text-xs font-body text-gray-500 dark:text-gray-400 truncate">
          {pending > 0
            ? `${pending} reward${pending > 1 ? 's' : ''} ready to claim`
            : 'Track your progress and earn rewards'}
        </p>
      </div>
      {pending > 0 ? (
        <span className="flex-shrink-0 min-w-[22px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1.5">
          {pending}
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
      )}
    </Link>
  );
};

const Dashboard: React.FC = () => {
  const { userDigimon, digimonData, evolutionOptions, fetchUserDigimon, fetchAllUserDigimon } =
    useDigimonStore();
  const { fetchTasks, error: taskError, dailyQuota } = useTaskStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { checkForNewTitles } = useTitleStore();

  // Add state to force re-render when tasks are completed
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [weekActivity, setWeekActivity] = useState<number[]>([]);

  // Phase 3 — banner dismissal persists across sessions via localStorage
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('beta-banner-dismissed') === 'true'
  );

  // Phase 3 — quota strip data (safe defaults when dailyQuota is null on first load)
  const completedToday = dailyQuota?.completed_today ?? 0;
  const streak = dailyQuota?.current_streak ?? 0;

  // Fetch last 7 days of task completion counts for the activity strip
  useEffect(() => {
    if (!user) return;
    const fetchWeekActivity = async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      const startDateStr = startDate.toLocaleDateString('en-CA');

      const { data } = await supabase
        .from('task_history')
        .select('date, tasks_completed')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      const historyMap: Record<string, number> = {};
      (data || []).forEach((entry) => {
        historyMap[entry.date] = entry.tasks_completed;
      });

      const days: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-CA');
        days.push(i === 0 ? completedToday : (historyMap[dateStr] ?? 0));
      }
      setWeekActivity(days);
    };
    fetchWeekActivity();
  }, [user?.id, completedToday]);

  useEffect(() => {
    fetchUserDigimon();
    fetchAllUserDigimon();
    fetchTasks();
  }, [fetchUserDigimon, fetchAllUserDigimon, fetchTasks]);

  // Add listener for task completion to refresh Digimon data
  useEffect(() => {
    const handleTaskComplete = () => {
      fetchUserDigimon();
      fetchAllUserDigimon();
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener('task-completed', handleTaskComplete);

    return () => {
      window.removeEventListener('task-completed', handleTaskComplete);
    };
  }, [fetchUserDigimon, fetchAllUserDigimon]);

  useEffect(() => {
    const checkUserDigimon = async () => {
      try {
        // If no Digimon, redirect to create-pet
        if (!userDigimon) {
          // navigate("/create-pet");
        }
      } catch (error) {
        console.error('Error checking user Digimon:', error);
      }
    };

    checkUserDigimon();
  }, [userDigimon, navigate]);

  useEffect(() => {
    // Check for any new titles based on current stats
    checkForNewTitles();
  }, [checkForNewTitles]);

  // Quota requirement is handled within TaskHeatmap

  // Quota display moved into TaskHeatmap; keep requirement for copy text

  const dashboardTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to your Digitask dashboard! This is where you'll manage your tasks and watch your Digimon grow.",
    },
    {
      speaker: 'neemon',
      text: "Ooh, look at your Digimon! That's your digital partner. It gets stronger when you complete tasks!",
    },
    {
      speaker: 'bokomon',
      text: "Indeed! Your Digimon's happiness will decrease if you miss tasks, so be diligent in completing them.",
    },
    {
      speaker: 'neemon',
      text: 'And you can create new tasks over there! Just click the button and fill in what you need to do.',
    },
    {
      speaker: 'bokomon',
      text: 'Completing tasks earns you experience points and stat points. Daily tasks and recurring tasks will reset at 8:00 UTC each day or specific days, respectively. One-time tasks have a specific due date and time.',
    },
    {
      speaker: 'neemon',
      text: "What are these meters? 'Daily Quota' and 'Stats Gained Today'?",
    },
    {
      speaker: 'bokomon',
      text: "The 'Daily Quota' meter shows how many tasks you've completed today. You'll want to complete at least 3 tasks daily to maintain a streak and earn extra XP.",
    },
    {
      speaker: 'bokomon',
      text: "The 'Stats Gained Today' meter shows how many stat points you've gained today from tasks. These will increase with your Digimon collection.",
    },
    {
      speaker: 'neemon',
      text: 'Oh, and in your tasks, you can see an option to auto allocate the stat points from completed tasks to your active Digimon or to save to add later.',
    },
    {
      speaker: 'both',
      text: "We're excited to see how you and your Digimon grow together. Good luck on your journey!",
    },
  ];

  if (!userDigimon || !digimonData) {
    return (
      <div role="status">
        <span className="sr-only">Loading dashboard…</span>
        <h1 className="ui-page-title mb-6">Dashboard</h1>
        <div
          className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 ui-skeleton-pulse"
          aria-hidden="true"
        >
          {/* Digimon panel skeleton */}
          <div className="card flex flex-col items-center gap-4 py-8">
            <div className="w-36 h-5 bg-gray-200 dark:bg-dark-200 rounded-full" />
            <div className="w-40 h-40 bg-gray-200 dark:bg-dark-200 rounded-full" />
            <div className="w-full space-y-2 mt-2">
              <div className="h-2.5 bg-gray-200 dark:bg-dark-200 rounded-full" />
              <div className="h-2.5 bg-gray-200 dark:bg-dark-200 rounded-full" />
            </div>
          </div>
          {/* Task panel skeleton */}
          <div className="card space-y-4">
            <div className="w-28 h-5 bg-gray-200 dark:bg-dark-200 rounded-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-200 dark:bg-dark-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="ui-page-title mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* ── Left column: Digimon panel + Party + Milestone ── */}
        <div className="space-y-4">
          <Digimon
            userDigimon={userDigimon}
            digimonData={digimonData}
            evolutionOptions={evolutionOptions}
            key={`digimon-${refreshTrigger}`}
          />

          <PartyMembersGrid />

          <AchievementsCallout />
        </div>

        {/* ── Right column: task list ── */}
        <div>
          {taskError && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-200">{taskError}</p>
            </div>
          )}

          <div className="card">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-xl font-heading font-semibold text-center sm:text-left dark:text-gray-100">
                Your Tasks
              </h2>

              {/* Keep creation available without covering row actions on phones. */}
              <button onClick={() => setShowTaskForm(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {/* Activity strip — 7 day dots + quota bar */}
            <div className="mb-3 space-y-2">
              {/* 7-day dots */}
              {weekActivity.length === 7 && (
                <div className="flex items-end gap-1.5">
                  {weekActivity.map((count, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const isToday = i === 6;
                    const daySummary = `${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}: ${count} ${count === 1 ? 'task' : 'tasks'}${isToday ? ' (today)' : ''}`;
                    return (
                      <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                        <div
                          className={`flex h-8 w-full items-center justify-center rounded-lg border text-xs font-semibold ${
                            count > 0
                              ? 'bg-accent-50 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300'
                              : 'bg-gray-50 text-gray-500 dark:bg-dark-200 dark:text-gray-400'
                          } ${isToday ? 'border-accent-500' : 'border-transparent'}`}
                          title={daySummary}
                          role="img"
                          aria-label={daySummary}
                        >
                          <span aria-hidden="true">{count}</span>
                        </div>
                        <span
                          className={`text-xs font-body ${isToday ? 'text-accent-800 dark:text-accent-300 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                  {streak > 0 && (
                    <div className="flex flex-col items-center gap-0.5 ml-1 pl-1.5 border-l border-gray-200 dark:border-dark-100">
                      <span className="text-sm leading-none">🔥</span>
                      <span className="text-xs font-body font-semibold text-accent-800 dark:text-accent-300 whitespace-nowrap">
                        {streak}d
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* Quota bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-dark-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-accent-500 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (completedToday / DAILY_QUOTA_AMOUNT) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {completedToday}/{DAILY_QUOTA_AMOUNT} today
                </span>
              </div>
            </div>

            <TaskList />
          </div>
        </div>
      </div>

      {/* Phase 3 — beta banner demoted below the main grid and made dismissible.
          Dismissed state persists across sessions via localStorage. */}
      {!bannerDismissed && (
        <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 dark:border-indigo-600 p-3 rounded-r-md flex items-center justify-between">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            Check out the latest updates in the patch notes page.
          </p>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <a
              href="https://forms.gle/4geGdXkywwAQcZDt6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full transition-colors"
            >
              Feedback
            </a>
            <button
              onClick={() => {
                setBannerDismissed(true);
                localStorage.setItem('beta-banner-dismissed', 'true');
              }}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 text-lg leading-none cursor-pointer"
              aria-label="Dismiss banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Phase 4.6 — task form modal (desktop) / slide-up sheet (mobile).
          AnimatePresence handles the mount/unmount animation. The sheet springs up
          from the bottom on mobile and appears centered on sm+. max-h-[90vh] +
          overflow-y-auto ensures the form never extends off-screen on short devices. */}
      <AnimatePresence>
        {showTaskForm && (
          <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center">
            {/* Backdrop — fade only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowTaskForm(false)}
            />

            {/* Sheet — springs up on mobile, scales in centered on desktop */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative z-modal w-full sm:max-w-lg bg-white dark:bg-dark-300 rounded-t-2xl sm:rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Add New Task
                </h3>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <TaskForm onTaskCreated={() => setShowTaskForm(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PageTutorial tutorialId="dashboard_intro" steps={dashboardTutorialSteps} />
    </>
  );
};

export default Dashboard;
