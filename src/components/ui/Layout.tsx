import React from 'react';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { ToolContainer } from './ToolContainer';

interface LayoutProps {
  children: React.ReactNode;
  appName: string;
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  appName,
  currentTool,
  onToolChange,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        appName={appName}
        currentTool={currentTool}
        onToolChange={onToolChange}
      />
      <ToolContainer>{children}</ToolContainer>
      <Footer />
    </div>
  );
};

export default Layout;
