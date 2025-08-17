import { MenuIcon } from 'lucide-react';
import { TOOLS } from '@/constants/appTools';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { DocsLink } from '../ui';
import { NavLink } from 'react-router';

const Nav = () => {
  return (
    <div className="flex items-center justify-between">
      {/* Mobile Nav (Dropdown) */}
      <div className="lg:hidden relative">
        <Menu>
          <MenuButton className="flex items-center px-2 py-1 rounded-lg dark:border-gray-60 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <MenuIcon className="size-7" />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-2 p-1 w-72 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 z-50 focus:outline-none overflow-hidden">
            <div className="py-1">
              {TOOLS.map((tool) => (
                <MenuItem key={tool.id}>
                  {({ focus }) => (
                    <NavLink
                      to={tool.path}
                      className={({ isActive }) =>
                        `w-full flex items-center px-4 py-2 text-sm text-left rounded transition ${
                          focus
                            ? 'bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${isActive ? 'font-semibold' : ''}`
                      }
                    >
                      {tool.title}
                    </NavLink>
                  )}
                </MenuItem>
              ))}

              <MenuItem>
                <DocsLink />
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex space-x-1">
        {TOOLS.map((tool) => (
          <NavLink
            to={tool.path}
            key={tool.id}
            className={({ isActive }) =>
              `flex items-center md:px-2 lg:px-4 py-2 rounded text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            {tool.title}
          </NavLink>
        ))}
        <DocsLink />
      </nav>
    </div>
  );
};

export default Nav;
