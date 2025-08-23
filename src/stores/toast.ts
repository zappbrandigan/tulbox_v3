import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';
export type ToastInput = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms; 0 = sticky
};

export type ToastItem = Required<Pick<ToastInput, 'id'>> &
  Omit<ToastInput, 'id'>;

type ToastState = {
  toasts: ToastItem[];
  toast: (t: ToastInput) => string; // push & schedule auto-dismiss
  dismiss: (id?: string) => void; // close (allow exit animation)
  clear: () => void;
};

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const DEFAULT_DURATION = 3000;
const timers = new Map<string, number>();

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  toast: (t) => {
    const id = t.id ?? genId();
    const duration = t.duration ?? DEFAULT_DURATION;
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));

    if (duration > 0 && typeof window !== 'undefined') {
      const h = window.setTimeout(() => get().dismiss(id), duration);
      timers.set(id, h);
    }
    return id;
  },
  dismiss: (id) => {
    if (id) {
      const h = timers.get(id);
      if (h) {
        clearTimeout(h);
        timers.delete(id);
      }
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    } else {
      timers.forEach(clearTimeout);
      timers.clear();
      set({ toasts: [] });
    }
  },
  clear: () => {
    timers.forEach(clearTimeout);
    timers.clear();
    set({ toasts: [] });
  },
}));

export const useToast = () => {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);
  return { toast, dismiss };
};
