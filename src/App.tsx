import { useState } from 'react';
import Layout from './components/Layout';
import PDFManager from './pages/PDFManager';
import IMDBSearch from './pages/IMDBSearch';

function App() {
  const [currentTool, setCurrentTool] = useState('pdf-manager');

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'pdf-manager':
        return <PDFManager />;
      case 'imdb-search':
        return <IMDBSearch />;
      default:
        return <PDFManager />;
    }
  };

  return (
    <Layout currentTool={currentTool} onToolChange={setCurrentTool}>
      {renderCurrentTool()}
    </Layout>
  );
}

export default App;