import React from 'react';
import { ExternalLink, MenuIcon } from 'lucide-react';
import { TOOLS } from '@/constants/appTools';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface NavProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

export const Nav: React.FC<NavProps> = ({ currentTool, onToolChange }) => {
  return (
    <div className="flex items-center justify-between">
      {/* Mobile Nav (Dropdown) */}
      <div className="md:hidden relative">
        <Menu>
          <MenuButton className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700">
            <MenuIcon />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
            {TOOLS.map((tool) => (
              <MenuItem key={tool.id}>
                {({ active }) => (
                  <button
                    onClick={() => onToolChange(tool.id)}
                    disabled={tool.id === 'coming-soon'}
                    className={`w-full text-left px-4 py-2 text-sm rounded ${
                      tool.id === 'coming-soon'
                        ? 'text-gray-400 cursor-not-allowed'
                        : active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {tool.icon} {tool.title}
                  </button>
                )}
              </MenuItem>
            ))}
            <MenuItem>
              <a
                href="https://docs.tulbox.app/tulbox/intro"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Docs <ExternalLink className="inline pl-2" />
              </a>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            disabled={tool.id === 'coming-soon'}
            className={`flex items-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              currentTool === tool.id
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : tool.id === 'coming-soon'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="hidden lg:inline">{tool.icon}</span> {tool.title}
          </button>
        ))}
        <a
          href="https://docs.tulbox.app/tulbox/intro"
          target="_blank"
          rel="noopender noreferrer"
        >
          <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            Docs <ExternalLink className="inline pl-2" />
          </button>
        </a>
      </nav>
    </div>
  );
};
