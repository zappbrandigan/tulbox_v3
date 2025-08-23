import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/toast';

const DEFAULT_DURATION = 3000;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div className="absolute bottom-16 right-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const v = (t.variant ?? 'default') as
              | 'default'
              | 'success'
              | 'warning'
              | 'error';

            const palette =
              v === 'success'
                ? {
                    icon: (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ),
                    bar: 'bg-emerald-500/80',
                    ring: 'ring-emerald-500/20',
                    stripe: 'bg-emerald-500',
                  }
                : v === 'warning'
                ? {
                    icon: (
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    ),
                    bar: 'bg-amber-500/80',
                    ring: 'ring-amber-500/20',
                    stripe: 'bg-amber-500',
                  }
                : v === 'error'
                ? {
                    icon: (
                      <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    ),
                    bar: 'bg-rose-500/80',
                    ring: 'ring-rose-500/20',
                    stripe: 'bg-rose-500',
                  }
                : {
                    icon: (
                      <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    ),
                    bar: 'bg-blue-500/80',
                    ring: 'ring-blue-500/20',
                    stripe: 'bg-blue-500',
                  };

            const duration = t.duration ?? DEFAULT_DURATION;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                role="status"
                aria-live="polite"
                className={[
                  'pointer-events-auto relative w-80 sm:w-96 overflow-hidden',
                  'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md',
                  'rounded-md shadow-lg ring-1',
                  palette.ring,
                ].join(' ')}
              >
                {/* Colored left stripe */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${palette.stripe}`}
                />

                <div className="p-3 pl-4 pr-9">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{palette.icon}</div>
                    <div className="min-w-0">
                      {t.title && (
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {t.title}
                        </div>
                      )}
                      {t.description && (
                        <div className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 break-words">
                          {t.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar (shrinks over duration) */}
                  {duration > 0 && (
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 ${palette.bar}`}
                      initial={{ width: '100%' }}
                      animate={{ width: 0 }}
                      transition={{ duration: duration / 1000, ease: 'linear' }}
                      style={{ originX: 0 }}
                    />
                  )}

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                    aria-label="Dismiss notification"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
