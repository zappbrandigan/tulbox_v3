import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ToolContainer from './ToolContainer';
import ShortcutModal from './ShortcutModal';
import { useShortcut } from '@/hooks';

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
  const [showShortcuts, setShowShortcuts] = useState(false);

  useShortcut(
    {
      'mod+/': () => setShowShortcuts(true),
    },
    []
  );
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-200 dark:from-slate-900 dark:via-gray-900 dark:to-black transition-color duration-300">
      <Header
        appName={appName}
        currentTool={currentTool}
        onToolChange={onToolChange}
      />
      <ToolContainer>{children}</ToolContainer>
      <Footer appName={appName} setShowShortcut={setShowShortcuts} />
      <ShortcutModal
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
      />
    </div>
  );
};

export default Layout;
