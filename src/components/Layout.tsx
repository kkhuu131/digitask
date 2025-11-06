import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../lib/supabase';

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
    <div className="relative flex items-center h-full" ref={dropdownRef}>
      <button
        className={`inline-flex items-center px-1 pb-2 border-b-2 text-sm font-medium ${
          isActive
            ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-dark-200 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const { user, userProfile, signOut, } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<'digimon' | 'more' | null>(null);
  const [energy, setEnergy] = useState<{ current: number; max: number }>({ current: 0, max: 100 });
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

  const { bits, fetchCurrency } = useCurrencyStore();

  // Fetch battle energy HUD and bits
  useEffect(() => {
    const fetchEnergy = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_energy, max_battle_energy')
        .eq('id', user.id)
        .single();
      if (profile) {
        setEnergy({ current: profile.battle_energy ?? 0, max: profile.max_battle_energy ?? 100 });
      }
    };
    fetchEnergy();
    fetchCurrency();

    const onTaskCompleted = () => {
      fetchEnergy();
      fetchCurrency();
    };
    const onEnergyUpdated = () => {
      fetchEnergy();
      fetchCurrency();
    };
    window.addEventListener('task-completed', onTaskCompleted);
    window.addEventListener('energy-updated', onEnergyUpdated);
    return () => {
      window.removeEventListener('task-completed', onTaskCompleted);
      window.removeEventListener('energy-updated', onEnergyUpdated);
    };
  }, [user?.id, fetchCurrency]);
  
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
  
  const handleMenuClick = (menu: 'digimon' | 'more') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {user && (
        <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-200 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img src="/assets/digimon/agumon_professor.png" alt="Digitask" className="h-8 w-8 mr-2" />
                  <Link to="/" className="text-xl font-bold text-primary-600 dark:text-gray-100">
                    Digitask
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8 h-16">
                  <Link
                    to="/"
                    className={`inline-flex items-center px-1 pb-2 border-b-2 text-sm font-medium ${
                      isActive("/")
                        ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <NavDropdown 
                    label="Digimon" 
                    isActive={isAnyActive(["/digifarm", "/digimon-dex"])}
                  >
                    <Link
                      to="/digifarm"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      Digifarm
                    </Link>
                    <Link
                      to="/digimon-dex"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      DigiDex
                    </Link>
                  </NavDropdown>
                  
                  <Link
                    to="/battles"
                    className={`inline-flex items-center px-1 pb-2 border-b-2 text-sm font-medium ${
                      isAnyActive(["/battles", "/battle", "/campaign", "/store"])
                        ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
                    }`}
                  >
                    Battle
                  </Link>
                  
                  <NavDropdown 
                    label="Community" 
                    isActive={isAnyActive(["/user-search", "/leaderboard"])}
                  >
                    <Link
                      to="/user-search"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      Find Players
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      Tutorial
                    </Link>
                    <Link
                      to="/patch-notes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      Patch Notes
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      Settings
                    </Link>
                  </NavDropdown>
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {/* Energy HUD */}
                <Link
                  to="/battles"
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-gray-700 dark:text-gray-200">⚡ {energy.current}/{energy.max}</span>
                  <div className="w-20 h-1.5 bg-gray-300 dark:bg-dark-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (energy.current / Math.max(1, energy.max)) * 100)}%` }} />
                  </div>
                </Link>
                {/* Bits Display */}
                <Link
                  to="/store"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{bits.toLocaleString()} bits</span>
                </Link>
                
                {/* User Avatar - links to profile */}
                <Link
                  to={`/profile/name/${userProfile?.username}`}
                  className="flex items-center justify-center"
                  title="View Profile"
                >
                  <img
                    src={userProfile?.avatar_url || "/assets/digimon/agumon_professor.png"}
                    alt="Profile"
                    title={userProfile?.display_name || userProfile?.username || "User Profile"}
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-accent-500 transition-colors"
                  />
                </Link>
                
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="bg-white dark:bg-dark-200 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-accent-500"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={handleSignOut}
                    >
                      <span className="sr-only">Sign out</span>
                      <svg
                        className="h-6 w-8 rounded-full text-gray-500 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Mobile header - just shows the logo */}
      {user && (
        <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-200 sm:hidden">
          <div className="flex justify-between items-center h-14 px-4">
            <div className="flex items-center">
              <img src="/assets/digimon/agumon_professor.png" alt="Digitask" className="h-8 w-8 mr-2" />
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-gray-100">
                Digitask
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/name/${userProfile?.username}`}
                className="flex items-center justify-center"
                title="View Profile"
              >
                <img
                  src={userProfile?.avatar_url || "/assets/digimon/agumon_professor.png"}
                  alt="Profile"
                  title={userProfile?.display_name || userProfile?.username || "User Profile"}
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-accent-500 transition-colors"
                />
              </Link>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-grow bg-gray-50 dark:bg-dark-400 transition-colors duration-200 pb-16 sm:pb-0">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">
          {children}
        </div>
      </main>
      
      {user && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200 z-10 shadow-lg">
          <div className="grid grid-cols-4 px-4 py-1">
            <div className="relative">
              <Link
                to="/"
                className={`flex flex-col items-center justify-center py-2 ${
                  isActive("/") ? "text-primary-600 dark:text-accent-500" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs mt-1">Home</span>
              </Link>
            </div>
            
            <div className="relative">
              <button
                onClick={() => handleMenuClick('digimon')}
                className={`flex flex-col items-center justify-center py-2 ${
                  activeMenu === 'digimon' || isActive("/digifarm") || isActive("/digimon-dex")
                    ? "text-primary-600 dark:text-accent-500" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
                    className="absolute bottom-full mb-2 left-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-48 overflow-hidden"
                  >
                    <div className="py-1">
                      <Link
                        to="/digifarm"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/digifarm") ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">🌱</span>
                        Digifarm
                      </Link>
                      <Link
                        to="/digimon-dex"
                        className={`flex items-center px-4 py-2 text-sm ${
                          isActive("/digimon-dex") ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="mr-2">🌟</span>
                        DigiDex
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <Link
                to="/battles"
                className={`flex flex-col items-center justify-center py-2 ${
                  isAnyActive(["/battles", "/battle", "/campaign", "/store"]) ? "text-primary-600 dark:text-accent-500" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs mt-1">Battle</span>
              </Link>
            </div>
            
            <div className="relative">
              <button
                onClick={() => handleMenuClick('more')}
                className={`flex flex-col items-center justify-center py-2 ${
                  activeMenu === 'more' || isAnyActive(moreNavItems.map(item => item.path)) 
                    ? "text-primary-600 dark:text-accent-500" 
                    : "text-gray-500 dark:text-gray-400"
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
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-48 overflow-hidden"
                  >
                    <div className="py-1">
                      {moreNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center px-4 py-2 text-sm ${
                            isActive(item.path) ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
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
      
      <footer className="bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 