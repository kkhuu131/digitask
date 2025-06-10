import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Apply theme class to document element for global styling
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check system preference on initial load
  useEffect(() => {
    const checkSystemPreference = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Only apply system preference if user hasn't explicitly set a preference
      if (localStorage.getItem('theme-settings') === null) {
        useThemeStore.getState().setDarkMode(prefersDark);
      }
    };

    checkSystemPreference();

    // Set up listener for preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't explicitly set a preference
      if (localStorage.getItem('theme-settings') === null) {
        useThemeStore.getState().setDarkMode(e.matches);
      }
    };

    // Use the appropriate event listener based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return <>{children}</>;
};

export default ThemeProvider; 