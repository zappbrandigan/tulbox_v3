import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';
import pkg from './package.json';

// Get last commit date and hash from Git
const commitDate = execSync('git log -1 --format=%cd').toString().trim();
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_UPDATED__: JSON.stringify(commitDate),
    __APP_COMMIT__: JSON.stringify(commitHash),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react'],
          firebase: ['firebase/app', 'firebase/analytics'],
          jszip: ['jszip'],
          transliteration: ['transliteration'],
          'pdfjs-dist': ['pdfjs-dist'],
        },
      },
    },
  },
});
