import { useMemo, useState } from 'react';
import { SessionContext } from './context/sessionContext';
import { Layout } from './components/ui';
import { PDFManager, ProductionSearch, CWRConverter } from './pages';
import CueSheetConverter from './pages/CueSheetConverter';

function App() {
  const [currentTool, setCurrentTool] = useState(() => {
    return localStorage.getItem('defaultTool') ?? 'pdf-manager';
  });

  const appName = 'TūlBOX';

  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const key = 'tulbox_session';
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const newId = crypto.randomUUID?.() || Date.now().toString(36);
    localStorage.setItem(key, newId);
    return newId;
  }, []);

  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
    localStorage.setItem('defaultTool', tool);
  };

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'pdf-manager':
        return <PDFManager />;
      case 'production-search':
        return <ProductionSearch />;
      case 'cwr-converter':
        return <CWRConverter />;
      case 'cue-sheet-converter':
        return <CueSheetConverter />;
      default:
        return <PDFManager />;
    }
  };

  return (
    <SessionContext.Provider value={sessionId}>
      <Layout
        appName={appName}
        currentTool={currentTool}
        onToolChange={handleToolChange}
      >
        {renderCurrentTool()}
      </Layout>
    </SessionContext.Provider>
  );
}

export default App;
