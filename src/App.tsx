import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDigimonStore } from './store/petStore';
import { useTaskStore } from './store/taskStore';

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
  const { loading: authLoading, checkSession } = useAuthStore();
  const { userDigimon, fetchUserDigimon } = useDigimonStore();
  const { checkOverdueTasks } = useTaskStore();
  const [appLoading, setAppLoading] = useState(true);
  
  useEffect(() => {
    const initApp = async () => {
      await checkSession();
      
      if (useAuthStore.getState().user) {
        await fetchUserDigimon();
        await checkOverdueTasks();
      }
      
      setAppLoading(false);
    };
    
    initApp();
  }, [checkSession, fetchUserDigimon, checkOverdueTasks]);
  
  // Add this useEffect to set up the subscription
  useEffect(() => {
    // Only set up subscription if user is logged in
    if (useAuthStore.getState().user) {
      const subscription = useDigimonStore.getState().subscribeToDigimonUpdates();
      
      // Clean up subscription when component unmounts
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
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
              {userDigimon ? <Dashboard /> : <CreatePet />}
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