import React from 'react';
import { MenuIcon } from 'lucide-react';
import { TOOLS } from '@/constants/appTools';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { logUserEvent } from '@/utils/general/logEvent';
import { LogSource } from '@/types/logging';
import { useSessionId } from '@/context/sessionContext';
import { DocsLink } from '../ui';

interface NavProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Nav: React.FC<NavProps> = ({ currentTool, onToolChange }) => {
  const sessionId = useSessionId();

  return (
    <div className="flex items-center justify-between">
      {/* Mobile Nav (Dropdown) */}
      <div className="lg:hidden relative">
        <Menu>
          <MenuButton className="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <MenuIcon className="w-4 h-4 mr-2" />
            {TOOLS.find((t) => t.id === currentTool)?.title ?? 'Select Tool'}
          </MenuButton>

          <MenuItems className="absolute right-0 mt-2 p-1 w-72 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 z-50 focus:outline-none overflow-hidden">
            <div className="py-1">
              {TOOLS.map((tool) => (
                <MenuItem key={tool.id}>
                  {({ focus }) => (
                    <button
                      onClick={() => onToolChange(tool.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm text-left rounded transition ${
                        focus
                          ? 'bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${tool.id === currentTool ? 'font-semibold' : ''}`}
                    >
                      <span className="mr-2">{tool.icon}</span> {tool.title}
                    </button>
                  )}
                </MenuItem>
              ))}

              <MenuItem>
                <DocsLink
                  onClick={() => {
                    logUserEvent(
                      sessionId,
                      'User viewed Docs',
                      {
                        action: 'link-click',
                        target: 'docs-link',
                      },
                      currentTool as LogSource
                    );
                  }}
                />
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex space-x-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center md:px-2 lg:px-4 py-2 rounded text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
