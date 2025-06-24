import { useState } from 'react';
import Layout from './components/ui/Layout';
import PDFManager from './pages/PDFManager';
import IMDBSearch from './pages/IMDBSearch';
import CWRParser from './pages/CWRParser';

function App() {
  const [currentTool, setCurrentTool] = useState('pdf-manager');
  const appName = 'TūlBOX';

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'pdf-manager':
        return <PDFManager />;
      case 'imdb-search':
        return <IMDBSearch />;
      case 'cwr-parser':
        return <CWRParser />;
      default:
        return <PDFManager />;
    }
  };

  return (
    <Layout appName={appName} currentTool={currentTool} onToolChange={setCurrentTool}>
      {renderCurrentTool()}
    </Layout>
  );
}

export default App;