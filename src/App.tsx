import { useMemo } from 'react';
import { SessionContext } from './context/sessionContext';
import { Layout } from './components/ui';
import {
  Home,
  PDFManager,
  ProductionSearch,
  CWRConverter,
  NotFound,
} from './pages';
import CueSheetConverter from './pages/CueSheetConverter';
import { Routes, Route, useNavigate } from 'react-router';
import { useShortcut } from './hooks';

function App() {
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

  const navigate = useNavigate();
  useShortcut({
    h: { callback: () => navigate('/'), allowInInput: false },
    p: { callback: () => navigate('/pdf'), allowInInput: false },
    s: { callback: () => navigate('/search'), allowInInput: false },
    c: { callback: () => navigate('/cwr'), allowInInput: false },
    x: { callback: () => navigate('/cues'), allowInInput: false },
  });

  return (
    <SessionContext.Provider value={sessionId}>
      <Layout appName={appName}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf" element={<PDFManager />} />
          <Route path="/cwr" element={<CWRConverter />} />
          <Route path="/cues" element={<CueSheetConverter />} />
          <Route path="/search" element={<ProductionSearch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </SessionContext.Provider>
  );
}

export default App;
