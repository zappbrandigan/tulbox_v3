// App.tsx
import { useEffect } from 'react';
import { useSession } from '@/stores/session';
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

  const ensureSession = useSession((s) => s.ensureSession);
  useEffect(() => {
    ensureSession();
  }, [ensureSession]);

  // temporary: removing old storage keys for state management migration
  useEffect(() => {
    const LEGACY_KEYS = ['tulbox_session', 'theme', 'defaultTool'];
    LEGACY_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        console.log();
      }
    });
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
  );
}

export default App;
