import type {
  LogContext,
  LogPayload,
  LogSource,
  LogType,
} from '@/types/logging';

export const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return '';
  const key = 'tulbox_session';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const newId = crypto.randomUUID?.() || Date.now().toString(36);
  localStorage.setItem(key, newId);
  return newId;
};

export const logEvent = (
  message: string,
  data: Partial<LogContext> = {},
  level: LogPayload['level'],
  source: LogContext['source'] = 'frontend',
  type: LogType
) => {
  try {
    const payload: LogPayload = {
      message,
      level,
      logKey: import.meta.env.VITE_LOGGING_SECRET,
      type,
      source,
      sessionId: getOrCreateSessionId(),
      ...data,
    };

    if (import.meta.env.DEV) {
      console.log(payload);
    } else {
      navigator.sendBeacon(
        `${import.meta.env.VITE_REQUEST_URL}/log`,
        new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        })
      );
    }
  } catch (err) {
    console.warn('logEvent failed:', err);
  }
};

export const logUserEvent = (
  message: string,
  event: LogContext['event'],
  source: LogSource = 'frontend',
  level: LogPayload['level'] = 'info',
  type: LogType = 'user-event'
) => {
  logEvent(message, { event }, level, source, type);
};
