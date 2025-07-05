import React from 'react';
import Brand from './Brand';
import Nav from './Nav';

interface HeaderProps {
  appName: string;
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  appName,
  currentTool,
  onToolChange,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Brand appName={appName} />
          <Nav currentTool={currentTool} onToolChange={onToolChange} />
        </div>
      </div>
    </header>
  );
};

export default Header;
