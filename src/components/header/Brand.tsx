import React, { useEffect } from 'react';
import { Moon, PocketKnife, Sun, SunMoon } from 'lucide-react';
import { Link } from 'react-router';
import { useShortcut } from '@/hooks';
import { useTheme } from '@/stores/theme';

interface BrandProps {
  appName: string;
}

const Brand: React.FC<BrandProps> = ({ appName }) => {
  const initTheme = useTheme((s) => s.init);
  const toggleTheme = useTheme((s) => s.toggleTheme);
  const currentTheme = useTheme((s) => s.theme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);
  useShortcut({ t: { callback: toggleTheme, allowInInput: false } });

  return (
    <div className="flex items-center space-x-3">
      <Link to="/" className="flex items-center space-x-3">
        {/* Icon Box */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <PocketKnife className="w-5 h-5 text-white" />
        </div>

        {/* Brand Text */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent transition-all duration-300">
          {appName}
        </h1>
      </Link>

      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        title={`Toggle theme: ${currentTheme}`}
        className="inline-flex items-center px-2 py-2 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors"
      >
        {currentTheme === 'light' && <Sun className="w-4 h-4" />}
        {currentTheme === 'dark' && <Moon className="w-4 h-4" />}
        {currentTheme === 'system' && <SunMoon className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default Brand;
