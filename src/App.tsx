import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';
import { supabase } from './lib/supabase';
import NotificationCenter from './components/NotificationCenter';

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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuthStore();
  
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { loading: authLoading, checkSession } = useAuthStore();
  const { userDigimon, fetchUserDigimon, subscribeToDigimonUpdates } = useDigimonStore();
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
          await useDigimonStore.getState().checkDigimonHealth();
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
    let unsubscribe: (() => void) | undefined;

    const subscribe = async () => {
      unsubscribe = await subscribeToDigimonUpdates();
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Cleanup function to remove subscription
      }
    };
  }, [subscribeToDigimonUpdates]);

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
        
        // Check Digimon health
        await useDigimonStore.getState().checkDigimonHealth();
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Add this useEffect to periodically check for overdue tasks
  useEffect(() => {
    // Only run if user is logged in
    if (!useAuthStore.getState().user) return;
    
    // Check every minute
    const intervalId = setInterval(() => {
      useTaskStore.getState().checkOverdueTasks();
    },  60 * 1000);
    ``
    // Run once immediately
    useTaskStore.getState().checkOverdueTasks();
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Show a loading indicator while the app is initializing
  if (appLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Digitask...</p>
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
        <Route path="/debug" element={<Debug />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/" element={
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <NotificationCenter />
    </Router>
  );
}

export default App; 