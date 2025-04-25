import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';
import { supabase } from './lib/supabase';
import NotificationCenter from './components/NotificationCenter';
import 'reactflow/dist/style.css';

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
import LandingPage from './pages/LandingPage';
import PatchNotes from './pages/PatchNotes';
import ProfilePage from './pages/ProfilePage';
import UserSearchPage from './pages/UserSearchPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminReportsPage from './pages/AdminReportsPage';

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

// Public route that redirects to dashboard if user is logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { loading: authLoading, checkSession } = useAuthStore();
  const { userDigimon, fetchUserDigimon } = useDigimonStore();
  const [appLoading, setAppLoading] = useState(true);
  const [needsEmailConfirmation, _setNeedsEmailConfirmation] = useState(false);
  const [_isAuthenticated, setIsAuthenticated] = useState(false);
  const [_loading, setLoading] = useState(true);
  
  // Initial app loading
  useEffect(() => {
    const initApp = async () => {
      try {
        await checkSession();
        
        if (useAuthStore.getState().user) {
          await useTaskStore.getState().initializeStore();
          await fetchUserDigimon();
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setAppLoading(false);
      }
    };
    
    initApp();
  }, [checkSession, fetchUserDigimon]);
  
  // Set up Digimon subscription
  useEffect(() => {
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
  }, []);

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log("Auth state change:", event);
        
        if (event === 'SIGNED_IN') {
          // User signed in - session will be handled by checkSession in the first useEffect
          console.log("User signed in");
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          useAuthStore.setState({ user: null, loading: false });
          useDigimonStore.setState({ 
            userDigimon: null, 
            digimonData: null, 
            evolutionOptions: [] 
          });
          useTaskStore.setState({ tasks: [] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Update the useEffect that checks auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        
        // Fetch the user's Digimon
        await useDigimonStore.getState().fetchUserDigimon();
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Keep only this one
  useEffect(() => {
    // Only run if user is logged in
    if (!useAuthStore.getState().user) return;
    
    console.log("Setting up overdue task check interval");
    
    // Check every 30 seconds instead of every minute
    const intervalId = setInterval(() => {
      console.log("Running scheduled overdue task check");
      useTaskStore.getState().checkOverdueTasks();
      
      // Also refresh the task list to update UI
      useTaskStore.getState().fetchTasks();
    }, 30 * 1000);
    
    // Run once immediately
    useTaskStore.getState().checkOverdueTasks();
    
    return () => {
      console.log("Clearing overdue task check interval");
      clearInterval(intervalId);
    };
  }, []);
  
  // Add this effect to listen for Digimon death
  useEffect(() => {
    const handleDigimonDeath = () => {
      console.log("Digimon death event received, navigating to create pet");
      window.location.href = "/create-pet"; // Force navigation
    };
    
    window.addEventListener('digimon-died', handleDigimonDeath);
    
    return () => {
      window.removeEventListener('digimon-died', handleDigimonDeath);
    };
  }, []);
  
  // Add this to the useEffect in App.tsx
  useEffect(() => {
    // Check for overdue tasks every minute
    const overdueCheckInterval = setInterval(() => {
      if (useAuthStore.getState().user) {
        useTaskStore.getState().checkOverdueTasks();
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(overdueCheckInterval);
    };
  }, []);
  
  // Add this to the useEffect that runs on app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Check auth
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        
        try {
          // Fetch the daily quota first to get penalized tasks
          await useTaskStore.getState().fetchDailyQuota();
          
          // Then fetch tasks
          await useTaskStore.getState().fetchTasks();
          
          // Fetch the user's Digimon
          await useDigimonStore.getState().fetchUserDigimon();
          await useDigimonStore.getState().fetchAllUserDigimon();
          
          // IMPORTANT: Don't redirect here - let the router handle it
          // This prevents redirect loops
          const { allUserDigimon } = useDigimonStore.getState();
          if (allUserDigimon.length === 0) {
            console.log("User has no Digimon, but letting router handle navigation");
            // Don't force redirect here
          }
        } catch (error) {
          console.error("Error during app initialization:", error);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    initializeApp();
  }, []);
  
  // Initialize the daily stat gains
  useEffect(() => {
    useDigimonStore.getState().fetchUserDailyStatGains();
  }, []);
  
  // Show a loading indicator while the app is initializing
  if (appLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <img src="/assets/digimon/dot050.png" alt="Digitask" className="h-12 w-12 mx-auto mb-4" style={{ imageRendering: 'pixelated' }} />
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (needsEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-primary-600">Digitask</h1>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Email Confirmation Required</h2>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please check your email and click the confirmation link to activate your account.
                </p>
              </div>
            </div>
          </div>
          
          <p className="mt-2 text-center text-sm text-gray-600">
            Once confirmed, you'll be able to create your Digimon and start playing.
          </p>
          
          <button
            onClick={() => useAuthStore.getState().signOut()}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign Out
          </button>
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
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              {appLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your Digimon...</p>
                  </div>
                </div>
              ) : (
                userDigimon ? <Dashboard /> : <CreatePet />
              )}
            </Layout>
          </ProtectedRoute>
        } />
        
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
              {userDigimon ? <Battle /> : <CreatePet />}
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
              {userDigimon ? <UserDigimonPage /> : <CreatePet />}
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
        
        <Route 
          path="/create-pet" 
          element={
            <RequireAuth allowNoDigimon={true}>
              <CreatePet />
            </RequireAuth>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <NotificationCenter />
    </Router>
  );
}

function RequireAuth({ children, allowNoDigimon = false }: { children: React.ReactNode, allowNoDigimon?: boolean }) {
  const { user } = useAuthStore();
  const { userDigimon } = useDigimonStore();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only check for Digimon if not on the create-pet page
  if (!allowNoDigimon && !userDigimon) {
    console.log("No Digimon found, redirecting to create-pet");
    return <Navigate to="/create-pet" replace />;
  }

  return children;
}

export default App; 