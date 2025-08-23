import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

type ThemeState = {
  theme: Theme; // user choice
  resolved: 'light' | 'dark'; // effective theme (derived)
  setTheme: (t: Theme) => void;
  toggleTheme: () => void; // cycles: light → dark → system → ...
  init: () => void; // call once on app boot
};

const mq =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

const computeResolved = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? (mq?.matches ? 'dark' : 'light') : theme;

const applyToDOM = (resolved: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: 'light',
      setTheme: (t) => {
        const r = computeResolved(t);
        set({ theme: t, resolved: r });
        applyToDOM(r);
      },
      toggleTheme: () => {
        const order: Theme[] = ['light', 'dark', 'system'];
        const idx = order.indexOf(get().theme);
        const next = order[(idx + 1) % order.length];
        get().setTheme(next);
      },
      init: () => {
        // set initial resolved + apply to DOM, attach system listener
        const r = computeResolved(get().theme);
        set({ resolved: r });
        applyToDOM(r);
        mq?.addEventListener('change', (e) => {
          if (get().theme === 'system') {
            const rr = e.matches ? 'dark' : 'light';
            set({ resolved: rr });
            applyToDOM(rr);
          }
        });
      },
    }),
    {
      name: 'tulbox_prefs', // separate from tulbox_store
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }), // only persist user choice
      version: 1,
    }
  )
);
