import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDigimonStore } from "../store/petStore";
import { motion, AnimatePresence } from "framer-motion";
interface LayoutProps {
  children: ReactNode;
}

// Add this component for dropdown menus
const NavDropdown = ({ 
  label, 
  isActive, 
  children 
}: { 
  label: string; 
  isActive: boolean; 
  children: React.ReactNode 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
          isActive
            ? "border-primary-500 text-gray-900"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const { user, userProfile, signOut, isAdmin } = useAuthStore();
  const { userDigimon } = useDigimonStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<'digimon' | 'battle' | 'more' | null>(null);
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Helper to check if any of the paths are active
  const isAnyActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };
  
  // Additional navigation items for the "More" menu
  const moreNavItems = [
    { path: "/profile", label: "Profile", icon: "🏠" },
    { path: "/patch-notes", label: "Patch Notes", icon: "📝" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/user-search", label: "Find Players", icon: "👥" },
    { path: "/tutorial", label: "Tutorial", icon: "📚" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    // { path: "/playground", label: "Playground", icon: "🎮" },
  ];
  
  const handleMenuClick = (menu: 'digimon' | 'battle' | 'more') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-white shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/assets/digimon/agumon_professor.png" 
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
                <NavDropdown 
                  label="Digimon" 
                  isActive={isAnyActive(["/party", "/digifarm"])}
                >
                  <Link
                    to="/party"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Party
                  </Link>
                  <Link
                    to="/digifarm"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    DigiFarm
                  </Link>
                </NavDropdown>
                <NavDropdown 
                  label="Play" 
                  isActive={isAnyActive(["/battle", "/digimon-dex"])}
                >
                  <Link
                    to="/battle"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Arena
                  </Link>
                  <Link
                    to="/campaign"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Campaign
                  </Link>
                  <Link
                    to="/store"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Store
                  </Link>
                  <Link
                    to="/digimon-dex"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    DigiDex
                  </Link>
                </NavDropdown>
                
                <NavDropdown 
                  label="Community" 
                  isActive={isAnyActive(["/user-search", "/leaderboard"])}
                >
                  <Link
                    to="/user-search"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Find Players
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Leaderboard
                  </Link>
                </NavDropdown>
                
                <NavDropdown 
                  label="Help" 
                  isActive={isAnyActive(["/tutorial", "/patch-notes"])}
                >
                  <Link
                    to="/tutorial"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Tutorial
                  </Link>
                  <Link
                    to="/patch-notes"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Patch Notes
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveMenu(null)}
                  >
                    Settings
                  </Link>
                </NavDropdown>
              </div>
            )}
            
            {isAdmin && (
              <NavDropdown 
                label="Admin" 
                isActive={isAnyActive(['/admin'])}
              >
                <Link
                  to="/admin/reports"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setActiveMenu(null)}
                >
                  Reports
                </Link>
                <Link
                  to="/admin/digimon-editor"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setActiveMenu(null)}
                >
                  Editor
                </Link>
                <Link
                  to="/admin/digimon-manager"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setActiveMenu(null)}
                >
                  Database Manager
                </Link>
                <Link
                  to="/admin/titles"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setActiveMenu(null)}
                >
                  Titles
                </Link>
              </NavDropdown>
            )}
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link to="/profile" className="text-sm text-gray-700 hover:text-primary-600 hidden md:inline">
                    <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                      <img
                        draggable="false"
                        src={userProfile?.avatar_url || "/assets/digimon/agumon_professor.png"}
                        alt={"avatar"}
                        className="w-8 h-8 cursor-pointer"
                        style={{
                          imageRendering: "pixelated",
                          transformOrigin: "center center",
                          position: "relative",
                          display: "block",
                          margin: "0 auto",
                        }}
                        onError={(e) => {
                          // Fallback if image doesn't load
                          (e.target as HTMLImageElement).src = "/assets/digimon/agumon_professor.png";
                        }}
                      />
                    </div>
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
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Bottom navigation for mobile */}
      {userDigimon && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999]">
          <div className="flex justify-around items-center">
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center py-2 ${
                isActive("/") ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>

            

              <div className="relative">
              <button
                onClick={() => handleMenuClick('digimon')}
                className={`flex flex-col items-center justify-center py-2 ${
                  activeMenu === 'digimon' || isActive("/party") || isActive("/digifarm") 
                    ? "text-primary-600" 
                    : "text-gray-500"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs mt-1">Digimon</span>
              </button>
              
              <AnimatePresence>
                {activeMenu === 'digimon' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 w-36 overflow-hidden"
                  >
                    <div className="py-1">
                      <Link
                        to="/party"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/party") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">👥</span>
                        Party
                      </Link>
                      <Link
                        to="/digifarm"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/digifarm") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">🌾</span>
                        DigiFarm
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <button
                onClick={() => handleMenuClick('battle')}
                className={`flex flex-col items-center justify-center py-2 ${
                  activeMenu === 'battle' || isActive("/battle") || isActive("/campaign") 
                    ? "text-primary-600" 
                    : "text-gray-500"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs mt-1">Battle</span>
              </button>
              
              <AnimatePresence>
                {activeMenu === 'battle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-36 overflow-hidden"
                  >
                    <div className="py-1">
                      <Link
                        to="/battle"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/battle") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">⚔️</span>
                        Arena
                      </Link>
                      <Link
                        to="/campaign"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/campaign") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">🗺️</span>
                        Campaign
                      </Link>
                      <Link
                        to="/store"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/store") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">🛍️</span>
                        Store
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link 
              to="/digimon-dex" 
              className={`flex flex-col items-center justify-center py-2 ${
                isActive("/digimon-dex") ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs mt-1">DigiDex</span>
            </Link>
            
            <div className="relative">
              <button
                onClick={() => handleMenuClick('more')}
                className={`flex flex-col items-center justify-center py-2 ${
                  activeMenu === 'more' || isAnyActive(moreNavItems.map(item => item.path)) 
                    ? "text-primary-600" 
                    : "text-gray-500"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-xs mt-1">More</span>
              </button>
              
              <AnimatePresence>
                {activeMenu === 'more' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-48 overflow-hidden"
                  >
                    <div className="py-1">
                      {moreNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center px-4 py-2 text-sm ${
                            isActive(item.path) ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setActiveMenu(null)}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
      
      {/* Add a click outside handler to close the menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
      
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