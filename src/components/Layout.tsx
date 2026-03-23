import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTitleStore } from '../store/titleStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Home,
  Sprout,
  BookMarked,
  Sword,
  Users,
  Trophy,
  ScrollText,
  Settings,
  BookOpen,
  Zap,
  LogOut,
  ChevronDown,
  Heart,
  ShoppingBag,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const NavDropdown = ({
  label,
  isActive,
  children,
}: {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center h-full" ref={dropdownRef}>
      <button
        className={`inline-flex items-center gap-1 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
          isActive
            ? 'border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500'
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
  const { user, userProfile, signOut } = useAuthStore();
  const { unclaimedCount } = useTitleStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<'digimon' | 'battle' | 'more' | null>(null);
  const [energy, setEnergy] = useState<{ current: number; max: number }>({ current: 0, max: 10 });
  const pendingAchievements = unclaimedCount();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isAnyActive = (paths: string[]) => paths.some((path) => location.pathname.startsWith(path));

  const { bits, fetchCurrency } = useCurrencyStore();

  useEffect(() => {
    const fetchEnergy = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_energy, max_battle_energy')
        .eq('id', user.id)
        .single();
      if (profile)
        setEnergy({ current: profile.battle_energy ?? 0, max: profile.max_battle_energy ?? 10 });
    };
    fetchEnergy();
    fetchCurrency();

    const onUpdate = () => {
      fetchEnergy();
      fetchCurrency();
    };
    window.addEventListener('task-completed', onUpdate);
    window.addEventListener('energy-updated', onUpdate);
    window.addEventListener('currency-updated', onUpdate);
    return () => {
      window.removeEventListener('task-completed', onUpdate);
      window.removeEventListener('energy-updated', onUpdate);
      window.removeEventListener('currency-updated', onUpdate);
    };
  }, [user?.id, fetchCurrency]);

  const handleMenuClick = (menu: 'digimon' | 'battle' | 'more') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const profilePath = userProfile?.username ? `/profile/name/${userProfile.username}` : '/profile';
  const isProfileActive =
    location.pathname.startsWith('/profile') || location.pathname === '/achievements';

  const dropdownLinkClass =
    'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-100 dark:hover:text-white';

  return (
    <div className="flex flex-col min-h-screen">
      {user && (
        <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-200 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-[4.5rem]">
              <div className="flex">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <img
                    src="/assets/digimon/agumon_professor.png"
                    alt="Digitask"
                    className="h-8 w-8 mr-2"
                  />
                  <Link
                    to="/"
                    className="text-2xl font-bold font-heading text-primary-600 dark:text-accent-500 tracking-wide"
                  >
                    Digitask
                  </Link>
                </div>

                {/* Primary nav */}
                <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-8 h-[4.5rem]">
                  {/* Dashboard */}
                  <Link
                    to="/"
                    className={`inline-flex items-center gap-1.5 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
                      isActive('/')
                        ? 'border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>

                  {/* Digimon dropdown */}
                  <NavDropdown
                    label="Digimon"
                    isActive={isAnyActive(['/digifarm', '/digimon-dex'])}
                  >
                    <Link
                      to="/digifarm"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <Sprout className="h-4 w-4" />
                      Digifarm
                    </Link>
                    <Link
                      to="/digimon-dex"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <BookMarked className="h-4 w-4" />
                      DigiDex
                    </Link>
                  </NavDropdown>

                  {/* Battle dropdown */}
                  <NavDropdown
                    label="Battle"
                    isActive={isAnyActive(['/battle', '/store'])}
                  >
                    <Link
                      to="/battle"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <Sword className="h-4 w-4" />
                      Arena
                    </Link>
                    <Link
                      to="/store"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Store
                    </Link>
                  </NavDropdown>

                  {/* Community dropdown */}
                  <NavDropdown
                    label="Community"
                    isActive={isAnyActive(['/user-search', '/leaderboard'])}
                  >
                    <Link
                      to="/user-search"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <Users className="h-4 w-4" />
                      Find Players
                    </Link>
                    <Link
                      to="/leaderboard"
                      className={dropdownLinkClass}
                      onClick={() => setActiveMenu(null)}
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Link>
                  </NavDropdown>

                  {/* Profile — badge shows pending achievements */}
                  <Link
                    to={profilePath}
                    className={`relative inline-flex items-center gap-1.5 px-1 pb-2 border-b-2 text-sm font-medium font-body transition-colors ${
                      isProfileActive
                        ? 'border-primary-500 text-gray-900 dark:border-accent-500 dark:text-gray-100'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={userProfile?.avatar_url || '/assets/digimon/agumon_professor.png'}
                      alt="Profile"
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    Profile
                    {pendingAchievements > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                        {pendingAchievements}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Right side: HUDs + Settings + Sign out */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
                {/* Energy HUD */}
                <Link
                  to="/battle"
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-dark-100 hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-200 font-body">
                    {energy.current}/{energy.max}
                  </span>
                  <div className="w-20 h-1.5 bg-gray-300 dark:bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{
                        width: `${Math.min(100, (energy.current / Math.max(1, energy.max)) * 100)}%`,
                      }}
                    />
                  </div>
                </Link>

                {/* Bits */}
                <Link
                  to="/store"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium font-body text-amber-700 dark:text-amber-300">
                    {bits.toLocaleString()} bits
                  </span>
                </Link>

                {/* Settings icon */}
                <Link
                  to="/settings"
                  title="Settings"
                  className={`p-1.5 rounded-full transition-colors ${
                    isActive('/settings')
                      ? 'text-primary-600 dark:text-accent-500 bg-gray-100 dark:bg-dark-200'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-200'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                </Link>

                {/* Sign out */}
                <button
                  type="button"
                  className="bg-white dark:bg-dark-200 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-accent-500 p-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <span className="sr-only">Sign out</span>
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile header */}
      {user && (
        <header className="bg-white dark:bg-dark-300 shadow-sm border-b border-gray-200 dark:border-dark-200 sm:hidden">
          <div className="flex justify-between items-center h-14 px-4">
            <div className="flex items-center">
              <img
                src="/assets/digimon/agumon_professor.png"
                alt="Digitask"
                className="h-8 w-8 mr-2"
              />
              <Link
                to="/"
                className="text-xl font-bold font-heading text-primary-600 dark:text-accent-500 tracking-wide"
              >
                Digitask
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/name/${userProfile?.username}`}
                className="relative flex items-center justify-center"
                title="View Profile"
              >
                <img
                  src={userProfile?.avatar_url || '/assets/digimon/agumon_professor.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-accent-500 transition-colors"
                />
                {pendingAchievements > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                    {pendingAchievements}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow bg-gray-50 dark:bg-dark-400 transition-colors duration-200 pb-16 sm:pb-0">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-4">
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

      {/* Mobile bottom nav */}
      {user && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200 z-sticky shadow-lg">
          <div className="grid grid-cols-4 px-4 py-1">
            {/* Home */}
            <div className="relative">
              <Link
                to="/"
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive('/')
                    ? 'text-primary-600 dark:text-accent-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-body">Home</span>
                {isActive('/') && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </Link>
            </div>

            {/* Digimon dropdown */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('digimon')}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  activeMenu === 'digimon' || isAnyActive(['/digifarm', '/digimon-dex'])
                    ? 'text-primary-600 dark:text-accent-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Heart className="h-5 w-5" />
                <span className="text-xs font-body">Digimon</span>
                {(activeMenu === 'digimon' || isAnyActive(['/digifarm', '/digimon-dex'])) && (
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
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/digifarm') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Sprout className="h-4 w-4" />
                        Digifarm
                      </Link>
                      <Link
                        to="/digimon-dex"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/digimon-dex') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
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

            {/* Battle dropdown */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('battle')}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  activeMenu === 'battle' ||
                  isAnyActive(['/battle', '/store'])
                    ? 'text-primary-600 dark:text-accent-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Sword className="h-5 w-5" />
                <span className="text-xs font-body">Battle</span>
                {(activeMenu === 'battle' ||
                  isAnyActive(['/battle', '/store'])) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500 dark:bg-accent-500" />
                )}
              </button>
              <AnimatePresence>
                {activeMenu === 'battle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-48 overflow-hidden z-dropdown"
                  >
                    <div className="py-1">
                      <Link
                        to="/battle"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/battle') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Sword className="h-4 w-4" />
                        Arena
                      </Link>
                      <Link
                        to="/store"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/store') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Store
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile / More */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('more')}
                className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  activeMenu === 'more' || isProfileActive
                    ? 'text-primary-600 dark:text-accent-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className="relative">
                  <img
                    src={userProfile?.avatar_url || '/assets/digimon/agumon_professor.png'}
                    alt="Profile"
                    className={`h-5 w-5 rounded-full object-cover border-2 transition-colors ${
                      activeMenu === 'more' || isProfileActive
                        ? 'border-primary-500 dark:border-accent-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {pendingAchievements > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 leading-none">
                      {pendingAchievements}
                    </span>
                  )}
                </div>
                <span className="text-xs font-body">Profile</span>
                {(activeMenu === 'more' || isProfileActive) && (
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
                    className="absolute bottom-full mb-2 right-0 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-200 w-52 overflow-hidden z-dropdown"
                  >
                    <div className="py-1">
                      <Link
                        to={profilePath}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isProfileActive ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <img
                          src={userProfile?.avatar_url || '/assets/digimon/agumon_professor.png'}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                        />
                        <span className="flex-1">Profile & Achievements</span>
                        {pendingAchievements > 0 && (
                          <span className="min-w-[18px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                            {pendingAchievements}
                          </span>
                        )}
                      </Link>
                      <div className="my-1 border-t border-gray-100 dark:border-dark-100" />
                      <Link
                        to="/leaderboard"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/leaderboard') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Trophy className="h-4 w-4" />
                        Leaderboard
                      </Link>
                      <Link
                        to="/user-search"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/user-search') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Users className="h-4 w-4" />
                        Find Players
                      </Link>
                      <div className="my-1 border-t border-gray-100 dark:border-dark-100" />
                      <Link
                        to="/patch-notes"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/patch-notes') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <ScrollText className="h-4 w-4" />
                        Patch Notes
                      </Link>
                      <Link
                        to="/tutorial"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/tutorial') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Tutorial
                      </Link>
                      <Link
                        to="/settings"
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-body ${isActive('/settings') ? 'bg-primary-50 text-primary-700 dark:bg-dark-200 dark:text-accent-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-200'}`}
                        onClick={() => setActiveMenu(null)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside overlay */}
      {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}

      <footer className="bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-sm font-body text-gray-500 dark:text-gray-400">
              This is a fan project. Digimon™ is owned by Bandai/Toei Animation.
            </span>
            <div className="flex items-center gap-4">
              <Link
                to="/tutorial"
                className="text-xs font-body text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Tutorial
              </Link>
              <Link
                to="/patch-notes"
                className="text-xs font-body text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Patch Notes
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
