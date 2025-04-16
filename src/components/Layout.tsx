import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDigimonStore } from "../store/petStore";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, userProfile, signOut } = useAuthStore();
  const { userDigimon } = useDigimonStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/assets/digimon/dot050.png" 
                  alt="Digitask Logo" 
                  className="h-8 w-8 mr-2"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-xl font-bold text-primary-600">Digitask</span>
              </Link>
            </div>
            
            {userDigimon && (
              <div className="hidden md:flex ml-6 space-x-4">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tutorial"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/tutorial")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Tutorial
                </Link>
                <Link
                  to="/your-digimon"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/your-digimon")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Your Digimon
                </Link>
                <Link
                  to="/digimon-dex"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/digimon-dex")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  DigiDex
                </Link>
                
                <Link
                  to="/battle"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/battle")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Battle
                </Link>
              
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-gray-700 hidden md:inline">{userProfile?.username}</span>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </Link>
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
            <div className="md:hidden py-2 flex overflow-x-auto space-x-2 border-t">
              <Link 
                to="/" 
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium text-center whitespace-nowrap ${
                  isActive("/") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/digimon-dex" 
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium text-center whitespace-nowrap ${
                  isActive("/digimon-dex") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                DigiDex
              </Link>
              <Link 
                to="/battle" 
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium text-center whitespace-nowrap ${
                  isActive("/battle") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Battle
              </Link>
              <Link 
                to="/your-digimon" 
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium text-center whitespace-nowrap ${
                  isActive("/your-digimon") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Your Digimon
              </Link>
              <Link
                to="/tutorial"
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium text-center whitespace-nowrap ${
                  isActive("/tutorial") ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Tutorial
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
            This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 