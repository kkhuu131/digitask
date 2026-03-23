import { useEffect, useState, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';
import { supabase } from './lib/supabase';
import NotificationCenter from './components/NotificationCenter';
import 'reactflow/dist/style.css';
import UpdateNotification from './components/UpdateNotification';
import { useOnboardingStore } from './store/onboardingStore';
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import CreatePet from './pages/CreatePet';
import DigimonDexPage from './pages/DigimonDexPage';
import Layout from './components/Layout';
import Debug from './pages/Debug';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Battle from './pages/Battle';
import Settings from './pages/Settings';
import Tutorial from './pages/Tutorial';
import PatchNotes from './pages/PatchNotes';
import ProfilePage from './pages/ProfilePage';
import UserSearchPage from './pages/UserSearchPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminReportsPage from './pages/AdminReportsPage';
import DigimonPlayground from './pages/DigimonPlayground';
import Tournament from './pages/Tournament';
import AdminUserDigimonPage from './pages/AdminUserDigimonPage';
import AdminTitlesPage from './pages/AdminTitlesPage';
import AdminTournamentTeamsPage from './pages/AdminTournamentTeamsPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import RosterPage from './pages/RosterPage';
import DigimonStorePage from './pages/DigimonStorePage';
import AdminDigimonManager from './pages/AdminDigimonManager';
import AchievementsPage from './pages/AchievementsPage';

// Define a clear app initialization state
interface AppInitState {
  authChecked: boolean;
  onboardingChecked: boolean;
  digimonChecked: boolean;
  tasksChecked: boolean;
}

// These flags live at module scope (not in React state or a ref) so that they
// survive re-renders and are shared across the onAuthStateChange closure and the
// init useEffect without needing to be passed through props or context.
let isInitializationInProgress = false; // prevents concurrent init runs
let isAppMounted = false; // guards against setState-after-unmount
let lastAuthEventTime = 0;
const AUTH_EVENT_DEBOUNCE_MS = 2000; // rate-limits rapid successive auth events
let currentUserId: string | null = null; // used to detect genuine new sign-ins vs. token refreshes

// Branded full-screen loading spinner — adapts to dark/light mode
const AppLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0A0A0F] transition-colors duration-200">
    <div className="text-center space-y-4">
      <img
        src="/assets/digimon/agumon_professor.png"
        alt="Digitask"
        className="h-14 w-14 mx-auto"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto" />
      <p className="font-body text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// ProtectedRoute: lightweight auth + admin guard used for most routes.
// It does NOT check onboarding status or Digimon existence — use RequireAuth for that.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (authLoading) {
    return <AppLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// RequireAuth: stricter guard for routes that need a fully set-up account.
// On top of auth, it verifies onboarding completion and Digimon existence,
// redirecting to /onboarding if either is missing.
// allowNoDigimon=true is used for /create-pet, which must be accessible before
// a Digimon exists (it's the page where you first create one).
function RequireAuth({
  children,
  allowNoDigimon = false,
}: {
  children: React.ReactNode;
  allowNoDigimon?: boolean;
}) {
  const { user, loading: authLoading } = useAuthStore();
  const { userDigimon, loading: digimonLoading } = useDigimonStore();
  const { hasCompletedOnboarding, isCheckingStatus, checkOnboardingStatus } = useOnboardingStore();
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  // Vite HMR re-mounts components and replays effects, which would trigger
  // navigation side-effects (like a redirect to /onboarding) during development.
  // Skipping all guards during a hot reload avoids this.
  const isHotReload = import.meta.hot;

  useEffect(() => {
    // Only check once per mount and skip during hot reload
    if (!hasCheckedRef.current && !isHotReload) {
      checkOnboardingStatus();
      hasCheckedRef.current = true;
    }
  }, [checkOnboardingStatus]);

  // Show loading while checking auth and onboarding status
  if ((authLoading || isCheckingStatus || hasCompletedOnboarding === null) && !isHotReload) {
    return <AppLoader />;
  }

  if (!user && !isHotReload) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If needs onboarding, redirect to onboarding
  if (hasCompletedOnboarding === false && !isHotReload) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding but has no Digimon, redirect to onboarding
  // This ensures they go through the full flow
  if (
    hasCompletedOnboarding &&
    !allowNoDigimon &&
    !userDigimon &&
    !digimonLoading &&
    !isHotReload
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Show loading while fetching Digimon data
  if (!allowNoDigimon && digimonLoading && !isHotReload) {
    return <AppLoader message="Loading your Digimon..." />;
  }

  return <>{children}</>;
}

function App() {
  const { checkSession, user } = useAuthStore();
  const { fetchUserDigimon } = useDigimonStore();
  const { initializeStore } = useTaskStore();

  // Use a single, comprehensive loading state
  const [appInit, setAppInit] = useState<AppInitState>({
    authChecked: false,
    onboardingChecked: false,
    digimonChecked: false,
    tasksChecked: false,
  });

  // Track component mount state
  useEffect(() => {
    isAppMounted = true;
    return () => {
      isAppMounted = false;
    };
  }, []);

  // appLoading is true until the init sequence finishes.
  // For unauthenticated users, auth check is sufficient — the downstream steps
  // (onboarding, tasks, Digimon) are skipped entirely, so we don't wait for them.
  const appLoading =
    !appInit.authChecked ||
    (!!user && (!appInit.onboardingChecked || !appInit.digimonChecked || !appInit.tasksChecked));

  // Initial app loading - sequential approach
  useEffect(() => {
    // Skip if component is unmounted
    if (!isAppMounted) return;

    const initApp = async () => {
      // Prevent multiple initializations
      if (isInitializationInProgress) {
        return;
      }

      isInitializationInProgress = true;

      try {
        // Step 1: Check authentication first
        await checkSession();
        const isAuthenticated = !!useAuthStore.getState().user;

        // Skip further initialization if component unmounted during auth check
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }

        // Update auth checked state
        setAppInit((prev) => ({ ...prev, authChecked: true }));

        if (!isAuthenticated) {
          // Mark all steps as complete when user is not authenticated
          setAppInit({
            authChecked: true,
            onboardingChecked: true,
            digimonChecked: true,
            tasksChecked: true,
          });
          isInitializationInProgress = false;
          return;
        }

        // Step 2: Check onboarding status
        await useOnboardingStore.getState().checkOnboardingStatus();

        // Skip if component unmounted
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }

        setAppInit((prev) => ({ ...prev, onboardingChecked: true }));

        // Step 3: Initialize stores in sequence
        await initializeStore();

        // Skip if component unmounted
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }

        setAppInit((prev) => ({ ...prev, tasksChecked: true }));

        await fetchUserDigimon();

        // Skip if component unmounted
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }

        setAppInit((prev) => ({ ...prev, digimonChecked: true }));
      } catch (error) {
        console.error('Error initializing app:', error);
        // Mark all as checked even on error to prevent infinite loading
        if (isAppMounted) {
          setAppInit({
            authChecked: true,
            onboardingChecked: true,
            digimonChecked: true,
            tasksChecked: true,
          });
        }
      } finally {
        isInitializationInProgress = false;
      }
    };

    // Only start initialization if not already in progress
    if (!isInitializationInProgress && !appInit.authChecked) {
      initApp();
    }
  }, [checkSession, fetchUserDigimon, initializeStore]);

  // Realtime subscriptions are opened only after the full init sequence completes.
  // Opening them during init risks receiving change events before the initial data
  // has been loaded, which could overwrite state with partial/stale payloads.
  useEffect(() => {
    if (!user || appLoading) return;

    let unsubscribeDigimon: (() => void) | undefined;
    let unsubscribeQuota: (() => void) | undefined;

    const setupSubscriptions = async () => {
      // Set up Digimon subscription
      unsubscribeDigimon = await useDigimonStore.getState().subscribeToDigimonUpdates();

      // Set up Quota subscription
      unsubscribeQuota = await useTaskStore.getState().subscribeToQuotaUpdates();
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeDigimon) {
        unsubscribeDigimon();
      }
      if (unsubscribeQuota) {
        unsubscribeQuota();
      }
    };
  }, [user, appLoading]);

  // Auth state change listener
  useEffect(() => {
    let isHandlingAuthChange = false;

    // Initialize the current session and user ID on mount
    const initCurrentSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        currentUserId = data.session.user.id;
      }
    };

    initCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      // Skip if we're already handling an auth change or initialization is in progress
      if (isHandlingAuthChange || isInitializationInProgress) {
        return;
      }

      // INITIAL_SESSION fires once on page load for any existing session.
      // The normal init sequence (initApp) already handles this case; re-running
      // it here would double-initialize and overwrite in-progress state.
      if (event === 'INITIAL_SESSION') {
        if (session) {
          currentUserId = session.user.id;
        }
        return;
      }

      // TOKEN_REFRESHED fires when Supabase silently rotates the JWT.
      // It must never trigger a full re-init — the user hasn't changed, only the token.
      if (event === 'TOKEN_REFRESHED') {
        if (session) {
          currentUserId = session.user.id;
        }
        return;
      }

      if (event === 'SIGNED_IN') {
        const now = Date.now();

        // Debounce: Supabase sometimes emits multiple SIGNED_IN events in quick
        // succession (e.g. during OAuth redirects). Drop any that arrive within
        // AUTH_EVENT_DEBOUNCE_MS of the previous one.
        if (now - lastAuthEventTime < AUTH_EVENT_DEBOUNCE_MS) {
          return;
        }

        // Skip during Vite HMR — hot reloads re-mount the component and replay
        // auth events, but the app is already initialized so we should do nothing.
        const isHotReload = import.meta.hot && import.meta.hot.data.isHotReload;
        if (isHotReload && appInit.authChecked) {
          return;
        }

        lastAuthEventTime = now;

        // Key distinction: Supabase can fire SIGNED_IN for token refreshes before
        // TOKEN_REFRESHED arrives. Compare the session's user ID to the currently
        // known ID — if they match, this is a same-user continuation, not a new login.
        if (currentUserId && session?.user?.id === currentUserId) {
          return;
        }

        // If we get here, this is a genuine new sign-in or a different user
        isHandlingAuthChange = true;

        try {
          if (session) {
            currentUserId = session.user.id;
          }

          // Reset initialization state to trigger the sequence again
          setAppInit({
            authChecked: false,
            onboardingChecked: false,
            digimonChecked: false,
            tasksChecked: false,
          });

          // Re-run checkSession to update the auth store
          await checkSession();
          setAppInit((prev) => ({ ...prev, authChecked: true }));

          // Continue with the rest of initialization
          await useOnboardingStore.getState().checkOnboardingStatus();
          setAppInit((prev) => ({ ...prev, onboardingChecked: true }));

          await initializeStore();
          setAppInit((prev) => ({ ...prev, tasksChecked: true }));

          await fetchUserDigimon();
          setAppInit((prev) => ({ ...prev, digimonChecked: true }));
        } finally {
          isHandlingAuthChange = false;
        }
      } else if (event === 'SIGNED_OUT') {
        currentUserId = null;

        // Manually clear all Zustand stores. Supabase's auth state change
        // only updates authStore — the other stores hold stale user data
        // that must be wiped explicitly so the next user doesn't see it.
        useAuthStore.setState({ user: null, loading: false });
        useDigimonStore.setState({
          userDigimon: null,
          digimonData: null,
          evolutionOptions: [],
        });
        useTaskStore.setState({ tasks: [] });

        // Mark auth as checked but reset others
        setAppInit({
          authChecked: true,
          onboardingChecked: false,
          digimonChecked: false,
          tasksChecked: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, fetchUserDigimon, initializeStore]);

  // Remove redundant useEffects that were causing race conditions
  // Keep only the essential ones

  // Poll for newly overdue tasks every 30 seconds.
  // isCheckingTasks prevents concurrent checks if a previous run is still in flight.
  // isInitializationInProgress prevents this from running while the boot sequence
  // is active, since tasks haven't been fetched yet at that point.
  useEffect(() => {
    if (!user || appLoading || !isAppMounted) return;

    let isCheckingTasks = false;

    const intervalId = setInterval(() => {
      if (!isAppMounted || isInitializationInProgress || isCheckingTasks) return;

      isCheckingTasks = true;
      useTaskStore
        .getState()
        .checkOverdueTasks()
        .finally(() => {
          isCheckingTasks = false;
        });
    }, 30 * 1000);

    // Also run immediately on mount so the user sees penalties right away
    // rather than waiting up to 30 seconds for the first interval tick.
    if (!isInitializationInProgress) {
      isCheckingTasks = true;
      useTaskStore
        .getState()
        .checkOverdueTasks()
        .finally(() => {
          isCheckingTasks = false;
        });
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [user, appLoading]);

  // Render a consistent loading state
  if (appLoading) {
    return <AppLoader message="Loading your Digimon adventure..." />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-400 transition-colors duration-200">
          <Routes>
            {process.env.NODE_ENV === 'development' && <Route path="/debug" element={<Debug />} />}
            <Route path="/landing" element={<LandingPage />} />
            <Route
              path="/"
              element={
                user ? (
                  <ProtectedRoute>
                    <Layout>
                      <HomeRouteContent />
                    </Layout>
                  </ProtectedRoute>
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/digimon-dex"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DigimonDexPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/battles" element={<Navigate to="/battle" replace />} />

            <Route
              path="/battle"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Battle />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/user/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/name/:username"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutorial"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tutorial />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/patch-notes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PatchNotes />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-search"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserSearchPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LeaderboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/user-digimon"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminUserDigimonPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/digimon-manager"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDigimonManager />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/digifarm"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DigimonPlayground />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-pet"
              element={
                <RequireAuth allowNoDigimon={true}>
                  <CreatePet />
                </RequireAuth>
              }
            />

            <Route
              path="/tournament"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tournament />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tournament-teams"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminTournamentTeamsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/titles"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminTitlesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/onboarding" element={<OnboardingWrapper />} />
            <Route path="/roster" element={<RosterPage />} />

            <Route
              path="/store"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DigimonStorePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AchievementsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <NotificationCenter />
          <UpdateNotification />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

function HomeRouteContent() {
  const { userDigimon, fetchUserDigimon, loading } = useDigimonStore();
  const { hasCompletedOnboarding, checkOnboardingStatus } = useOnboardingStore();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isRefetching, setIsRefetching] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Calculate if resend is on cooldown
  const resendCooldown = 120000; // 2 minutes in milliseconds
  const isResendOnCooldown = lastResendTime ? Date.now() - lastResendTime < resendCooldown : false;
  const cooldownRemaining = isResendOnCooldown
    ? Math.ceil((resendCooldown - (Date.now() - (lastResendTime || 0))) / 1000)
    : 0;

  useEffect(() => {
    const checkEmailConfirmationAndProfile = async () => {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        setNeedsEmailConfirmation(true);
        return;
      }

      setNeedsEmailConfirmation(false);

      // Check if user has a profile
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id') // Just check if it exists, no need for all fields
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          console.error('Error checking profile:', error);
          return;
        }

        // Only create profile if it doesn't exist
        if (!profile) {
          await createUserProfile(user);
        } else {
          // Make sure we have the latest onboarding status
          await checkOnboardingStatus();
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    };

    checkEmailConfirmationAndProfile();
  }, []);

  // Function to resend confirmation email
  const handleResendEmail = async () => {
    // Check if on cooldown
    if (isResendOnCooldown) return;

    setResendingEmail(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: useAuthStore.getState().user?.email || '',
      });

      if (error) throw error;

      setResendSuccess(true);
      setLastResendTime(Date.now());

      // Store last resend time in localStorage to persist across page refreshes
      localStorage.setItem('lastEmailResendTime', Date.now().toString());
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      setResendError((error as Error).message || 'Failed to resend email. Please try again later.');
    } finally {
      setResendingEmail(false);
    }
  };

  // Load last resend time from localStorage on component mount
  useEffect(() => {
    const storedTime = localStorage.getItem('lastEmailResendTime');
    if (storedTime) {
      setLastResendTime(parseInt(storedTime));
    }
  }, []);

  // Function to create a user profile if it doesn't exist
  const createUserProfile = async (user: any) => {
    if (!user || !user.id) return;

    setCreatingProfile(true);
    setProfileError(null);

    try {
      // Re-check before inserting: two tabs opened simultaneously could both
      // reach this point and attempt to create the same profile. The second
      // check makes this safe; the 23505 unique-violation catch below is the
      // final safety net if the race is lost between this check and the insert.
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        setCreatingProfile(false);
        await checkOnboardingStatus();
        return;
      }

      // Get username from user metadata
      const username =
        user.user_metadata?.username ||
        user.email?.split('@')[0] ||
        `user_${Math.floor(Math.random() * 10000)}`;

      // Create the profile
      const { error } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username,
          display_name: username,
          saved_stats: { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 },
          battles_won: 0,
          battles_completed: 0,
        },
      ]);

      if (error) {
        // If it's a duplicate key error, the profile was created in a race condition
        if (error.code === '23505') {
          // PostgreSQL unique violation error — race condition, safe to ignore
        } else {
          throw error;
        }
      }

      // Refresh user profile in auth store
      await useAuthStore.getState().fetchUserProfile();

      // Refresh onboarding status
      await checkOnboardingStatus();
    } catch (error) {
      console.error('Error creating user profile:', error);
      setProfileError('Failed to create your profile. Please try refreshing the page.');
    } finally {
      setCreatingProfile(false);
    }
  };

  // Function to refetch all necessary data
  const refetchData = async () => {
    setIsRefetching(true);
    setProfileError(null); // Clear any previous errors

    try {
      // First check if profile exists
      const { user } = useAuthStore.getState();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile) {
          await createUserProfile(user);
        }
      }

      // Check onboarding status first
      await checkOnboardingStatus();
      // Then fetch Digimon data
      await fetchUserDigimon();
    } catch (error) {
      console.error('Error refetching data:', error);
    } finally {
      setIsRefetching(false);
    }
  };

  // If there's an error but we want to try continuing anyway
  const continueAnyway = async () => {
    setProfileError(null);
    await checkOnboardingStatus();
    await fetchUserDigimon();
  };

  if (needsEmailConfirmation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Email Confirmation Required</h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Please check your email and click the confirmation link to activate your account. Once
              confirmed, you'll be able to create your Digimon and start playing.
            </p>
          </div>

          {resendSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <p className="text-sm text-green-700">
                Confirmation email has been resent! Please check your inbox and spam folder.
              </p>
            </div>
          )}

          {resendError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-700">{resendError}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleResendEmail}
              className="btn-primary"
              disabled={resendingEmail || isResendOnCooldown}
            >
              {resendingEmail
                ? 'Sending...'
                : isResendOnCooldown
                  ? `Resend in ${cooldownRemaining}s`
                  : 'Resend Confirmation Email'}
            </button>

            <button onClick={() => useAuthStore.getState().signOut()} className="btn-secondary">
              Sign Out
            </button>
          </div>

          <div className="text-xs text-gray-500">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
            <p>Make sure you entered the correct email address during registration.</p>
          </div>
        </div>
      </div>
    );
  }

  if (creatingProfile) {
    return <AppLoader message="Setting up your profile..." />;
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Setup Error</h2>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{profileError}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={refetchData} className="btn-primary" disabled={isRefetching}>
              {isRefetching ? 'Trying again...' : 'Try Again'}
            </button>

            <button onClick={continueAnyway} className="btn-secondary">
              Continue Anyway
            </button>

            <button onClick={() => useAuthStore.getState().signOut()} className="btn-outline">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user hasn't completed onboarding, redirect them there
  if (hasCompletedOnboarding === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding but has no Digimon, show create button
  if (!userDigimon) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You don't have a Digimon yet!</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Onboarding
            </button>

            <button
              onClick={refetchData}
              disabled={isRefetching || loading}
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center"
            >
              {isRefetching || loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              If you already have a Digimon, try refreshing the data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the dashboard
  return <Dashboard />;
}

function OnboardingWrapper() {
  const { user, loading: authLoading } = useAuthStore();
  const { hasCompletedOnboarding, isCheckingStatus, checkOnboardingStatus } = useOnboardingStore();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  // Force a check when the component mounts
  useEffect(() => {
    const forceCheck = async () => {
      if (user && !hasChecked) {
        await checkOnboardingStatus();
        setHasChecked(true);
      }
    };

    forceCheck();
  }, [user, hasChecked, checkOnboardingStatus]);

  // Handle redirects
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login', { replace: true });
    } else if (hasCompletedOnboarding === true && hasChecked) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, hasCompletedOnboarding, hasChecked, navigate]);

  // Show loading state
  if (authLoading || !hasChecked || (isCheckingStatus && hasCompletedOnboarding === null)) {
    return <AppLoader message="Loading onboarding..." />;
  }

  // If we've checked and the user needs onboarding, show the onboarding page
  if (hasCompletedOnboarding === false) {
    return <OnboardingPage />;
  }

  // Fallback - should not reach here
  return <AppLoader message="Redirecting..." />;
}

export default App;
