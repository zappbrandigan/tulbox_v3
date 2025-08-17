import React from 'react';
import Brand from './Brand';
import Nav from './Nav';

interface HeaderProps {
  appName: string;
}

const Header: React.FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 dark:bg-gray-800/90 dark:border-gray-700/80 shadow-sm dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Brand appName={appName} />
          <Nav />
        </div>
      </div>
    </header>
  );
};

export default Header;
