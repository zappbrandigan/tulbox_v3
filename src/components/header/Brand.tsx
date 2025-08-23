import React, { useEffect, useState } from 'react';
import { Moon, PocketKnife, Sun } from 'lucide-react';
import { logUserEvent } from '@/utils/general/logEvent';
import { useSessionId } from '@/context/sessionContext';
import { Link } from 'react-router';
import { useShortcut } from '@/hooks';

interface BrandProps {
  appName: string;
}

const Brand: React.FC<BrandProps> = ({ appName }) => {
  const sessionId = useSessionId();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    logUserEvent(sessionId, 'User changed theme', {
      action: 'ui-interaction',
      target: 'theme-toggle',
      value: theme === 'light' ? 'dark' : 'light',
    });
  };

  useShortcut({
    t: {
      callback: toggleDarkMode,
      allowInInput: false,
    },
  });

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
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
        className="inline-flex items-center px-2 py-2 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors"
      >
        <Sun className="w-4 h-4 hidden dark:inline" />
        <Moon className="w-4 h-4 dark:hidden" />
      </button>
    </div>
  );
};

export default Brand;
