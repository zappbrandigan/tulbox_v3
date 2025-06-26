import React from 'react';
import { Header } from '@/components/header/Header';
import { ToolContainer } from './ToolContainer';

interface LayoutProps {
  children: React.ReactNode;
  appName: string;
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, appName, currentTool, onToolChange }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header appName={appName} currentTool={currentTool} onToolChange={onToolChange} />
      <ToolContainer>
        {children}
      </ToolContainer>
    </div>
  );
};

export default Layout;