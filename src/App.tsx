import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';
import { supabase } from './lib/supabase';

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
  const { loading: authLoading, checkSession, user } = useAuthStore();
  const { userDigimon, fetchUserDigimon } = useDigimonStore();
  const [appLoading, setAppLoading] = useState(true);
  
  // Initial app loading
  useEffect(() => {
    const initApp = async () => {
      try {
        await checkSession();
        
        if (useAuthStore.getState().user) {
          await fetchUserDigimon();
          await useTaskStore.getState().fetchTasks();
          await useTaskStore.getState().checkOverdueTasks();
          await useTaskStore.getState().checkDailyQuota();
          await useDigimonStore.getState().checkDigimonHealth();
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        // Always set loading to false, even if there are errors
        setAppLoading(false);
      }
    };
    
    initApp();
  }, [checkSession, fetchUserDigimon]);
  
  // Set up Digimon subscription
  useEffect(() => {
    // Only set up subscription if user is logged in
    if (user) {
      const subscription = useDigimonStore.getState().subscribeToDigimonUpdates();
      
      // Clean up subscription when component unmounts
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [user]);
  
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 