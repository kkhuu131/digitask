import { useEffect } from 'react';
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { checkSession } = useAuthStore();
  const { userDigimon, fetchUserDigimon, fetchDiscoveredDigimon } = useDigimonStore();
  const { checkOverdueTasks } = useTaskStore();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) {
      fetchUserDigimon();
      fetchDiscoveredDigimon();
      checkOverdueTasks();
    }
  }, [fetchUserDigimon, fetchDiscoveredDigimon, checkOverdueTasks, useAuthStore.getState().user]);
  
  return (
    <Router>
      <Routes>
        <Route path="/debug" element={<Debug />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
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