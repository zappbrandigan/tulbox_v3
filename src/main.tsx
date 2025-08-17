import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './context/ToastContext.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
