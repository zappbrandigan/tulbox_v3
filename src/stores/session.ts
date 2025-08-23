import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

type SessionState = {
  sessionId: string;
  ensureSession(): string;
  resetSession(): string;
};

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36);

const legacyKey = 'tulbox_session';

// --- SSR-safe memory storage (string-based) ---
const mem: Record<string, string> = {};
const memoryStorage: StateStorage = {
  getItem: (name) => (name in mem ? mem[name] : null),
  setItem: (name, value) => {
    mem[name] = value;
  },
  removeItem: (name) => {
    delete mem[name];
  },
};

// Only persist this slice
type Persisted = Pick<SessionState, 'sessionId'>;

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: '',
      ensureSession() {
        let id = get().sessionId;
        if (!id) {
          if (typeof window !== 'undefined') {
            id = window.localStorage.getItem(legacyKey) || genId();
            window.localStorage.setItem(legacyKey, id); // mirror legacy key
          } else {
            id = genId();
          }
          set({ sessionId: id });
        }
        return id;
      },
      resetSession() {
        const id = genId();
        set({ sessionId: id });
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(legacyKey, id);
        }
        return id;
      },
    }),
    {
      name: 'tulbox_store',
      // Always provide a PersistStorage by wrapping a StateStorage
      storage: createJSONStorage<Persisted>(() =>
        typeof window === 'undefined' ? memoryStorage : localStorage
      ),
      partialize: (s): Persisted => ({ sessionId: s.sessionId }),
      version: 1,
    }
  )
);
