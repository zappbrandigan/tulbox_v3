import { useEffect, useRef } from 'react';
import {
  registerShortcuts,
  unregisterShortcuts,
} from '@/utils/general/shortcutManager';

export const useShortcut = (
  bindings: { [combo: string]: (e: KeyboardEvent) => void },
  deps: any[] = []
) => {
  const idRef = useRef<symbol>(Symbol());

  useEffect(() => {
    registerShortcuts(idRef.current, bindings);
    return () => unregisterShortcuts(idRef.current);
  }, deps);
};
