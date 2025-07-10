import { useState } from 'react';
import { Layout } from './components/ui';
import { PDFManager, IMDBSearch, CWRConverter } from './pages';

function App() {
  const [currentTool, setCurrentTool] = useState(() => {
    return localStorage.getItem('defaultTool') ?? 'pdf-manager';
  });

  const appName = 'TūlBOX';

  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
    localStorage.setItem('defaultTool', tool);
  };

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'pdf-manager':
        return <PDFManager />;
      case 'imdb-search':
        return <IMDBSearch />;
      case 'cwr-converter':
        return <CWRConverter />;
      default:
        return <PDFManager />;
    }
  };

  return (
    <Layout
      appName={appName}
      currentTool={currentTool}
      onToolChange={handleToolChange}
    >
      {renderCurrentTool()}
    </Layout>
  );
}

export default App;
