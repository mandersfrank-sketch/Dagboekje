import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme, getStoredTheme, applyTheme } from '../utils/theme';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    // Synchronize initial state with the actual document element class
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Wissel naar lichte modus' : 'Wissel naar donkere modus'}
      title={isDark ? 'Wissel naar lichte weergave' : 'Wissel naar donkere weergave'}
      className="inline-flex items-center justify-center p-2 rounded-xl text-[#163f57] dark:text-[#f2ebe1] bg-[#f4eee6] dark:bg-[#2c221b] hover:bg-[#eae0d2] dark:hover:bg-[#382c23] border border-[#ded3c5] dark:border-[#45362b] transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="w-4 h-4 text-[#8a5f2e] transition-transform rotate-0 scale-100" />
      )}
      <span className="sr-only">
        {isDark ? 'Lichte weergave activeren' : 'Donkere weergave activeren'}
      </span>
    </button>
  );
};
