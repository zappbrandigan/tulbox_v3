import { useEffect, useRef } from 'react';
import {
  registerShortcuts,
  unregisterShortcuts,
} from '@/utils/general/shortcutManager';

export const useShortcut = (
  bindings: {
    [combo: string]:
      | ((e: KeyboardEvent) => void)
      | { callback: (e: KeyboardEvent) => void; allowInInput?: boolean };
  },
  deps: any[] = []
) => {
  const idRef = useRef<symbol>(Symbol());

  useEffect(() => {
    const map = new Map<
      string,
      { callback: (e: KeyboardEvent) => void; allowInInput?: boolean }
    >();

    for (const [key, val] of Object.entries(bindings)) {
      if (typeof val === 'function') {
        map.set(key, { callback: val, allowInInput: true });
      } else {
        map.set(key, {
          callback: val.callback,
          allowInInput: !!val.allowInInput,
        });
      }
    }

    registerShortcuts(idRef.current, map);
    return () => unregisterShortcuts(idRef.current);
  }, deps);
};
