import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../lib/supabase';
import {
  Home,
  Sprout,
  BookMarked,
  Sword,
  Users,
  Trophy,
  BookOpen,
  ScrollText,
  Settings,
  User,
  Zap,
  LogOut,
  ChevronDown,
  Heart,
} from 'lucide-react';

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
        className={`inline-flex items-center gap-1 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
          isActive
            ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-dark-200 ring-1 ring-black ring-opacity-5 z-dropdown">
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
    { path: "/profile", label: "Profile", Icon: User },
    { path: "/patch-notes", label: "Patch Notes", Icon: ScrollText },
    { path: "/leaderboard", label: "Leaderboard", Icon: Trophy },
    { path: "/user-search", label: "Find Players", Icon: Users },
    { path: "/tutorial", label: "Tutorial", Icon: BookOpen },
    { path: "/settings", label: "Settings", Icon: Settings },
    // { path: "/playground", label: "Playground", Icon: Gamepad2 },
  ];

  const handleMenuClick = (menu: 'digimon' | 'more') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {user && (
        <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-200 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-[4.5rem]">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img src="/assets/digimon/agumon_professor.png" alt="Digitask" className="h-8 w-8 mr-2" />
                  <Link to="/" className="text-2xl font-bold font-heading text-primary-600 dark:text-accent-500 tracking-wide">
                    Digitask
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-8 h-[4.5rem]">
                  <Link
                    to="/"
                    className={`inline-flex items-center gap-1.5 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
                      isActive("/")
                        ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <NavDropdown
                    label="Digimon"
                    isActive={isAnyActive(["/digifarm", "/digimon-dex"])}
                  >
                    <Link
                      to="/digifarm"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Sprout className="h-4 w-4" />
                      Digifarm
                    </Link>
                    <Link
                      to="/digimon-dex"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <BookMarked className="h-4 w-4" />
                      DigiDex
                    </Link>
                  </NavDropdown>

                  <Link
                    to="/battles"
                    className={`inline-flex items-center gap-1.5 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
                      isAnyActive(["/battles", "/battle", "/campaign", "/store"])
                        ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
                    }`}
                  >
                    <Sword className="h-4 w-4" />
                    Battle
                  </Link>

                  <Link
                    to={userProfile?.username ? `/profile/name/${userProfile.username}` : '/profile'}
                    className={`inline-flex items-center gap-1.5 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
                      location.pathname.startsWith('/profile')
                        ? "border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={userProfile?.avatar_url || "/assets/digimon/agumon_professor.png"}
                      alt="Profile"
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    Profile
                  </Link>

                  <NavDropdown
                    label="Community"
                    isActive={isAnyActive(["/user-search", "/leaderboard"])}
                  >
                    <Link
                      to="/user-search"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Users className="h-4 w-4" />
                      Find Players
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Link>
                  </NavDropdown>

                  <NavDropdown
                    label="Help"
                    isActive={isAnyActive(["/tutorial", "/patch-notes"])}
                  >
                    <Link
                      to="/tutorial"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <BookOpen className="h-4 w-4" />
                      Tutorial
                    </Link>
                    <Link
                      to="/patch-notes"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <ScrollText className="h-4 w-4" />
                      Patch Notes
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Settings className="h-4 w-4" />
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
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-200 font-body">{energy.current}/{energy.max}</span>
                  <div className="w-20 h-1.5 bg-gray-300 dark:bg-dark-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (energy.current / Math.max(1, energy.max)) * 100)}%` }} />
                  </div>
                </Link>
                {/* Bits Display */}
                <Link
                  to="/store"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium font-body text-amber-700 dark:text-amber-300">{bits.toLocaleString()} bits</span>
                </Link>

                {/* Sign out button */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="bg-white dark:bg-dark-200 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-accent-500 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={handleSignOut}
                      title="Sign out"
                    >
                      <span className="sr-only">Sign out</span>
                      <LogOut className="h-5 w-5" />
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
              <Link to="/" className="text-xl font-bold font-heading text-primary-600 dark:text-accent-500 tracking-wide">
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
          {/* Phase 2 — page transition: 150ms fade + 6px vertical slide, GPU-composited */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {user && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200 z-sticky shadow-lg">
          <div className="grid grid-cols-4 px-4 py-1">
            <div className="relative">
              <Link
                to="/"
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive("/")
                    ? "text-primary-600 dark:text-accent-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-body">Home</span>
                {isActive("/") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => handleMenuClick('digimon')}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  activeMenu === 'digimon' || isActive("/digifarm") || isActive("/digimon-dex")
                    ? "text-primary-600 dark:text-accent-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Heart className="h-5 w-5" />
                <span className="text-xs font-body">Digimon</span>
                {(activeMenu === 'digimon' || isActive("/digifarm") || isActive("/digimon-dex")) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </button>

              <AnimatePresence>
                {activeMenu === 'digimon' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 left-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-48 overflow-hidden z-dropdown"
                  >
                    <div className="py-1">
                      <Link
                        to="/digifarm"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${
                          isActive("/digifarm") ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Sprout className="h-4 w-4" />
                        Digifarm
                      </Link>
                      <Link
                        to="/digimon-dex"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${
                          isActive("/digimon-dex") ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
                        }`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <BookMarked className="h-4 w-4" />
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
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isAnyActive(["/battles", "/battle", "/campaign", "/store"])
                    ? "text-primary-600 dark:text-accent-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Sword className="h-5 w-5" />
                <span className="text-xs font-body">Battle</span>
                {isAnyActive(["/battles", "/battle", "/campaign", "/store"]) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => handleMenuClick('more')}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  activeMenu === 'more' || isAnyActive(moreNavItems.map(item => item.path))
                    ? "text-primary-600 dark:text-accent-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <img
                  src={userProfile?.avatar_url || "/assets/digimon/agumon_professor.png"}
                  alt="Profile"
                  className={`h-5 w-5 rounded-full object-cover border-2 transition-colors ${
                    activeMenu === 'more' || isAnyActive(moreNavItems.map(item => item.path))
                      ? "border-primary-500 dark:border-accent-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                <span className="text-xs font-body">Profile</span>
                {(activeMenu === 'more' || isAnyActive(moreNavItems.map(item => item.path))) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </button>

              <AnimatePresence>
                {activeMenu === 'more' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-48 overflow-hidden z-dropdown"
                  >
                    <div className="py-1">
                      {moreNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${
                            isActive(item.path) ? "bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200"
                          }`}
                          onClick={() => setActiveMenu(null)}
                        >
                          <item.Icon className="h-4 w-4" />
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
          <div className="py-4 text-center text-sm font-body text-gray-500 dark:text-gray-400">
            This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
