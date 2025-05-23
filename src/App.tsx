import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';
import { supabase } from './lib/supabase';
import NotificationCenter from './components/NotificationCenter';
import 'reactflow/dist/style.css';
import UpdateNotification from './components/UpdateNotification';
import { useOnboardingStore } from './store/onboardingStore';
import React from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import CreatePet from './pages/CreatePet';
import DigimonDexPage from './pages/DigimonDexPage';
import Layout from './components/Layout';
import Debug from './pages/Debug';
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Battle from './pages/Battle';
import ProfileSettings from './pages/ProfileSettings';
import UserDigimonPage from './pages/UserDigimonPage';
import Tutorial from './pages/Tutorial';
import PatchNotes from './pages/PatchNotes';
import ProfilePage from './pages/ProfilePage';
import UserSearchPage from './pages/UserSearchPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminReportsPage from './pages/AdminReportsPage';
// import DigimonPlayground from "./pages/DigimonPlayground";
import Campaign from "./pages/Campaign";
import AdminDigimonEditor from './pages/AdminDigimonEditor';
import AdminTitlesPage from './pages/AdminTitlesPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import RosterPage from './pages/RosterPage';

// Define a clear app initialization state
interface AppInitState {
  authChecked: boolean;
  onboardingChecked: boolean;
  digimonChecked: boolean;
  tasksChecked: boolean;
}

// Add this at the top of the file, outside the component
let isInitializationInProgress = false;
let isAppMounted = false;
let lastAuthEventTime = 0;
const AUTH_EVENT_DEBOUNCE_MS = 2000; // 2 seconds
let currentSessionId: string | null = null; // Track the current session ID
let currentUserId: string | null = null; // Track the current user ID

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const location = useLocation();
  
  // If the route is an admin route, check for admin status
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function RequireAuth({ children, allowNoDigimon = false }: { children: React.ReactNode, allowNoDigimon?: boolean }) {
  const { user, loading: authLoading } = useAuthStore();
  const { userDigimon, loading: digimonLoading } = useDigimonStore();
  const { hasCompletedOnboarding, isCheckingStatus, checkOnboardingStatus } = useOnboardingStore();
  const location = useLocation();
  const hasCheckedRef = useRef(false);
  
  // Skip navigation during hot module reloading
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isHotReload) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If needs onboarding, redirect to onboarding
  if (hasCompletedOnboarding === false && !isHotReload) {
    console.log("User needs onboarding, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding but has no Digimon, redirect to onboarding
  // This ensures they go through the full flow
  if (hasCompletedOnboarding && !allowNoDigimon && !userDigimon && !digimonLoading && !isHotReload) {
    console.log("No Digimon found, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Show loading while fetching Digimon data
  if (!allowNoDigimon && digimonLoading && !isHotReload) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Digimon...</p>
        </div>
      </div>
    );
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
    tasksChecked: false
  });
  
  // Track component mount state
  useEffect(() => {
    isAppMounted = true;
    return () => {
      isAppMounted = false;
    };
  }, []);
  
  // Derived loading state - only false when ALL checks are complete
  const appLoading = !appInit.authChecked || 
                    (!!user && (!appInit.onboardingChecked || 
                               !appInit.digimonChecked || 
                               !appInit.tasksChecked));

  // Initial app loading - sequential approach
  useEffect(() => {
    // Skip if component is unmounted
    if (!isAppMounted) return;
    
    const initApp = async () => {
      // Prevent multiple initializations
      if (isInitializationInProgress) {
        console.log("Initialization already in progress, skipping");
        return;
      }
      
      isInitializationInProgress = true;
      
      try {
        
        // Step 1: Check authentication first
        await checkSession();
        const isAuthenticated = !!useAuthStore.getState().user;
        
        // Skip further initialization if component unmounted during auth check
        if (!isAppMounted) {
          console.log("Component unmounted during initialization, aborting");
          isInitializationInProgress = false;
          return;
        }
        
        // Update auth checked state
        setAppInit(prev => ({ ...prev, authChecked: true }));
        
        if (!isAuthenticated) {
          console.log("User not authenticated, skipping further initialization");
          // Mark all steps as complete when user is not authenticated
          setAppInit({
            authChecked: true,
            onboardingChecked: true,
            digimonChecked: true,
            tasksChecked: true
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
        
        setAppInit(prev => ({ ...prev, onboardingChecked: true }));
        
        // Step 3: Initialize stores in sequence
        await initializeStore();
        
        // Skip if component unmounted
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }
        
        setAppInit(prev => ({ ...prev, tasksChecked: true }));
        
        await fetchUserDigimon();
        
        // Skip if component unmounted
        if (!isAppMounted) {
          isInitializationInProgress = false;
          return;
        }
        
        setAppInit(prev => ({ ...prev, digimonChecked: true }));
        
      } catch (error) {
        console.error("Error initializing app:", error);
        // Mark all as checked even on error to prevent infinite loading
        if (isAppMounted) {
          setAppInit({
            authChecked: true,
            onboardingChecked: true,
            digimonChecked: true,
            tasksChecked: true
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
  
  // Set up Digimon subscription - only after initialization
  useEffect(() => {
    // Only set up subscriptions if user is authenticated and app is initialized
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
        currentSessionId = data.session.user.id;
        currentUserId = data.session.user.id;
      }
    };
    
    initCurrentSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, { 
          hasSession: !!session,
          appInitState: appInit,
          isInitializationInProgress,
          sessionId: session?.user?.id,
          currentSessionId,
          userId: session?.user?.id,
          currentUserId
        });
        
        // Skip if we're already handling an auth change or initialization is in progress
        if (isHandlingAuthChange || isInitializationInProgress) {
          // console.log("Already handling auth change or initialization in progress, skipping");
          return;
        }
        
        // For INITIAL_SESSION, we should let the normal initialization flow handle it
        if (event === 'INITIAL_SESSION') {
          // console.log("Received INITIAL_SESSION event - letting normal init flow handle it");
          if (session) {
            currentSessionId = session.user.id;
            currentUserId = session.user.id;
          }
          return;
        }
        
        // TOKEN_REFRESHED should never trigger reinitialization
        if (event === 'TOKEN_REFRESHED') {
          // console.log("Token refreshed, no need to reinitialize app");
          if (session) {
            currentSessionId = session.user.id;
            currentUserId = session.user.id;
          }
          return;
        }
        
        // Only proceed with SIGNED_IN if it's a genuine new sign-in
        if (event === 'SIGNED_IN') {
          const now = Date.now();
          
          // If this SIGNED_IN happens too soon after another auth event, ignore it
          if (now - lastAuthEventTime < AUTH_EVENT_DEBOUNCE_MS) {
            // console.log("Ignoring SIGNED_IN event - too soon after previous auth event");
            return;
          }
          
          // Check for hot reload
          const isHotReload = import.meta.hot && import.meta.hot.data.isHotReload;
          if (isHotReload && appInit.authChecked) {
            // console.log("Ignoring SIGNED_IN during hot reload");
            return;
          }
          
          // Update the last auth event time
          lastAuthEventTime = now;
          
          // CRITICAL CHECK: If we have a current user ID and it matches the session user ID,
          // this is likely a token refresh or session continuation, not a new sign-in
          if (currentUserId && session?.user?.id === currentUserId) {
            // console.log("Same user ID detected, not treating as new sign-in");
            // Update session ID if needed
            if (session) {
              currentSessionId = session.user.id;
            }
            return;
          }
          
          // If we get here, this is a genuine new sign-in or a different user
          isHandlingAuthChange = true;
          // console.log("Genuine new sign-in detected, reinitializing app");
          
          try {
            // Update the current session and user ID
            if (session) {
              currentSessionId = session.user.id || null;
              currentUserId = session.user.id;
            }
            
            // Reset initialization state to trigger the sequence again
            setAppInit({
              authChecked: false,
              onboardingChecked: false,
              digimonChecked: false,
              tasksChecked: false
            });
            
            // Re-run checkSession to update the auth store
            await checkSession();
            setAppInit(prev => ({ ...prev, authChecked: true }));
            
            // Continue with the rest of initialization
            await useOnboardingStore.getState().checkOnboardingStatus();
            setAppInit(prev => ({ ...prev, onboardingChecked: true }));
            
            await initializeStore();
            setAppInit(prev => ({ ...prev, tasksChecked: true }));
            
            await fetchUserDigimon();
            setAppInit(prev => ({ ...prev, digimonChecked: true }));
            
            // console.log("App re-initialization complete after sign-in");
          } finally {
            isHandlingAuthChange = false;
          }
        } else if (event === 'SIGNED_OUT') {
          // Reset the session and user ID
          currentSessionId = null;
          currentUserId = null;
          
          // User signed out - clear all stores
          useAuthStore.setState({ user: null, loading: false });
          useDigimonStore.setState({ 
            userDigimon: null, 
            digimonData: null, 
            evolutionOptions: [] 
          });
          useTaskStore.setState({ tasks: [] });
          
          // Mark auth as checked but reset others
          setAppInit({
            authChecked: true,
            onboardingChecked: false,
            digimonChecked: false,
            tasksChecked: false
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, fetchUserDigimon, initializeStore]);
  
  // Remove redundant useEffects that were causing race conditions
  // Keep only the essential ones
  
  // Overdue task check - only run when fully initialized
  useEffect(() => {
    if (!user || appLoading || !isAppMounted) return;
    
    // console.log("Setting up overdue task check interval");
    
    // Use a ref to track if a check is in progress
    let isCheckingTasks = false;
    
    // Check every 30 seconds
    const intervalId = setInterval(() => {
      // Skip if component unmounted, initialization in progress, or another check is running
      if (!isAppMounted || isInitializationInProgress || isCheckingTasks) {
        return;
      }
      
      isCheckingTasks = true;
      useTaskStore.getState().checkOverdueTasks()
        .finally(() => {
          isCheckingTasks = false;
        });
    }, 30 * 1000);
    
    // Run once immediately, but only if not initializing
    if (!isInitializationInProgress) {
      isCheckingTasks = true;
      useTaskStore.getState().checkOverdueTasks()
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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Digimon adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {
          process.env.NODE_ENV === 'development' && (
            <Route path="/debug" element={<Debug />} />
          )
        }
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={
          user ? (
            <ProtectedRoute>
              <Layout>
                <HomeRouteContent />
              </Layout>
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
        } />
        <Route path="/dashboard" element={
          <Navigate to="/" replace />
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/digimon-dex" element={
          <ProtectedRoute>
            <Layout>
              <DigimonDexPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/battle" element={
          <ProtectedRoute>
            <Layout>
              <Battle />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile/user/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile/name/:username" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <ProfileSettings />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/your-digimon" element={
          <ProtectedRoute>
            <Layout>
              <UserDigimonPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/tutorial" element={
          <ProtectedRoute>
            <Layout>
              <Tutorial />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/patch-notes" element={
          <ProtectedRoute>
            <Layout>
              <PatchNotes />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/user-search" element={
          <ProtectedRoute>
            <Layout>
              <UserSearchPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <Layout>
              <AdminReportsPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin/digimon-editor" element={
          <ProtectedRoute>
            <Layout>
              <AdminDigimonEditor />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* <Route path="/playground" element={
          <ProtectedRoute>
            <Layout>
              <DigimonPlayground />
            </Layout>
          </ProtectedRoute>
        } /> */}
        
        <Route
          path="/create-pet" 
          element={
            <RequireAuth allowNoDigimon={true}>
              <CreatePet />
            </RequireAuth>
          } 
        />
        
        <Route path="/campaign" element={
          <ProtectedRoute>
            <Layout>
              <Campaign />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/titles" element={
          <ProtectedRoute>
            <Layout>
              <AdminTitlesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/onboarding" element={
          <OnboardingWrapper />
        } />
        
        <Route path="/roster" element={<RosterPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <NotificationCenter />
      <UpdateNotification />
    </Router>
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
  const isResendOnCooldown = lastResendTime ? (Date.now() - lastResendTime < resendCooldown) : false;
  const cooldownRemaining = isResendOnCooldown ? Math.ceil((resendCooldown - (Date.now() - (lastResendTime || 0))) / 1000) : 0;

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
          .from("profiles")
          .select("id") // Just check if it exists, no need for all fields
          .eq("id", user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error("Error checking profile:", error);
          return;
        }
        
        // Only create profile if it doesn't exist
        if (!profile) {
          console.log("No profile found, creating one...");
          await createUserProfile(user);
        } else {
          console.log("Profile already exists, continuing...");
          // Make sure we have the latest onboarding status
          await checkOnboardingStatus();
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
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
      console.error("Error resending confirmation email:", error);
      setResendError((error as Error).message || "Failed to resend email. Please try again later.");
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
      // First check again if profile exists to avoid race conditions
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (existingProfile) {
        setCreatingProfile(false);
        await checkOnboardingStatus();
        return;
      }
      
      // Get username from user metadata
      const username = user.user_metadata?.username || 
                      user.email?.split('@')[0] || 
                      `user_${Math.floor(Math.random() * 10000)}`;
      
      // Create the profile
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username,
          display_name: username,
          saved_stats: { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 },
          daily_stat_gains: 0,
          last_stat_reset: new Date().toISOString(),
          battles_won: 0,
          battles_completed: 0,
        },
      ]);

      if (error) {
        // If it's a duplicate key error, the profile was created in a race condition
        if (error.code === '23505') { // PostgreSQL unique violation error
          console.log("Profile was created by another process, continuing");
        } else {
          throw error;
        }
      }
      
      // Refresh user profile in auth store
      await useAuthStore.getState().fetchUserProfile();
      
      // Refresh onboarding status
      await checkOnboardingStatus();
      
    } catch (error) {
      console.error("Error creating user profile:", error);
      setProfileError("Failed to create your profile. Please try refreshing the page.");
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
          .from("profiles")
          .select("id")
          .eq("id", user.id)
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
      console.error("Error refetching data:", error);
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
              Please check your email and click the confirmation link to activate your account.
              Once confirmed, you'll be able to create your Digimon and start playing.
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
              {resendingEmail ? "Sending..." : 
               isResendOnCooldown ? `Resend in ${cooldownRemaining}s` : 
               "Resend Confirmation Email"}
            </button>
            
            <button
              onClick={() => useAuthStore.getState().signOut()}
              className="btn-secondary"
            >
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
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
            <button
              onClick={refetchData}
              className="btn-primary"
              disabled={isRefetching}
            >
              {isRefetching ? "Trying again..." : "Try Again"}
            </button>
            
            <button
              onClick={continueAnyway}
              className="btn-secondary"
            >
              Continue Anyway
            </button>
            
            <button
              onClick={() => useAuthStore.getState().signOut()}
              className="btn-outline"
            >
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
              onClick={() => navigate("/onboarding")}
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
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                "Refresh Data"
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
        console.log("OnboardingWrapper: Forcing onboarding status check");
        await checkOnboardingStatus();
        setHasChecked(true);
      }
    };
    
    forceCheck();
  }, [user, hasChecked, checkOnboardingStatus]);
  
  // Debug logging
  useEffect(() => {
    console.log("OnboardingWrapper debug:", {
      user: !!user,
      authLoading,
      hasCompletedOnboarding,
      isCheckingStatus,
      hasChecked
    });
  }, [user, authLoading, hasCompletedOnboarding, isCheckingStatus, hasChecked]);
  
  // Handle redirects
  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/login", { replace: true });
    } else if (hasCompletedOnboarding === true && hasChecked) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, hasCompletedOnboarding, hasChecked, navigate]);
  
  // Show loading state
  if (authLoading || !hasChecked || (isCheckingStatus && hasCompletedOnboarding === null)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }
  
  // If we've checked and the user needs onboarding, show the onboarding page
  if (hasCompletedOnboarding === false) {
    return <OnboardingPage />;
  }
  
  // Fallback - should not reach here
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default App; 