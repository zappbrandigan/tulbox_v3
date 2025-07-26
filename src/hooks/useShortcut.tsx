import { useEffect } from 'react';

export const useShortcut = (
  bindings: { [combo: string]: (e: KeyboardEvent) => void },
  deps: any[] = []
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = /mac/.test(navigator.userAgent.toLowerCase());
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      const parts: string[] = [];

      if (modKey) parts.push('mod');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');

      const key = e.key.toLowerCase();

      parts.push(key);

      const combo = parts.join('+');

      const action = bindings[combo];
      if (action) {
        e.preventDefault();
        action(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, deps);
};
