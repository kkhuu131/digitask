import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">Digitask</Link>
            </div>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link to="/digimon-dex" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Digimon Dex
                </Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-gray-700 hidden md:inline">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="btn-outline text-sm"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile navigation */}
          {user && (
            <div className="md:hidden py-2 flex space-x-2 border-t">
              <Link to="/" className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-center text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link>
              <Link to="/digimon-dex" className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-center text-gray-700 hover:bg-gray-100">
                Digimon Dex
              </Link>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Digitask. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 