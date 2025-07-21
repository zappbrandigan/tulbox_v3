import React from 'react';
import { ExternalLink, MenuIcon } from 'lucide-react';
import { TOOLS } from '@/constants/appTools';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { trackEvent } from '@/utils';
import { logUserEvent } from '@/utils/general/logEvent';
import { LogSource } from '@/types/logging';
import { useSessionId } from '@/context/sessionContext';

interface NavProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Nav: React.FC<NavProps> = ({ currentTool, onToolChange }) => {
  const sessionId = useSessionId();
  function DocsLink() {
    const handleClick = () => {
      logUserEvent(
        sessionId,
        'User viewed Docs',
        {
          action: 'link-click',
          target: 'docs-link',
        },
        currentTool as LogSource
      );
      trackEvent('docs_link_click', {
        destination: 'https://docs.tulbox.app/tulbox/intro',
        label: 'Documentation',
      });
    };

    return (
      <a
        href="https://docs.tulbox.app/tulbox/intro"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center px-4 rounded-lg text-sm transition-all duration-200 whitespace-nowrap text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ExternalLink className="inline pr-2" />
        Docs
      </a>
    );
  }
  return (
    <div className="flex items-center justify-between">
      {/* Mobile Nav (Dropdown) */}
      <div className="lg:hidden relative">
        <Menu>
          <MenuButton className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-500 text-sm dark:text-gray-300">
            <MenuIcon />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg z-50">
            {TOOLS.map((tool) => (
              <MenuItem key={tool.id}>
                {({ active }) => (
                  <button
                    onClick={() => onToolChange(tool.id)}
                    disabled={tool.id === 'coming-soon'}
                    className={`w-full text-left px-4 text-sm rounded transition-all ${
                      active
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tool.icon} {tool.title}
                  </button>
                )}
              </MenuItem>
            ))}
            <MenuItem>
              <DocsLink />
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex space-x-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center md:px-2 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              currentTool === tool.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="hidden lg:inline">{tool.icon}</span> {tool.title}
          </button>
        ))}
        <DocsLink />
      </nav>
    </div>
  );
};

export default Nav;
