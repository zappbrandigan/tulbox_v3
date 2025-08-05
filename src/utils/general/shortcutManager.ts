type ShortcutCallback = (e: KeyboardEvent) => void;
type BindingMap = Record<string, ShortcutCallback>;

const bindingsMap = new Map<symbol, BindingMap>();

let isListenerAttached = false;

const getCombo = (e: KeyboardEvent): string => {
  const isMac = /mac/.test(navigator.userAgent.toLowerCase());
  const modKey = isMac ? e.metaKey : e.ctrlKey;

  const parts: string[] = [];
  if (modKey) parts.push('mod');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');

  const key = e.key.toLowerCase();
  if (!['shift', 'alt', 'meta', 'control'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
};

const isTypingTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
};

const globalHandler = (e: KeyboardEvent) => {
  if (isTypingTarget(e.target)) return;

  const combo = getCombo(e);
  for (const binding of bindingsMap.values()) {
    const fn = binding[combo];
    if (fn) {
      e.preventDefault();
      fn(e);
    }
  }
};

export const registerShortcuts = (id: symbol, bindings: BindingMap) => {
  bindingsMap.set(id, bindings);
  if (!isListenerAttached) {
    window.addEventListener('keydown', globalHandler);
    isListenerAttached = true;
  }
};

export const unregisterShortcuts = (id: symbol) => {
  bindingsMap.delete(id);
  if (bindingsMap.size === 0 && isListenerAttached) {
    window.removeEventListener('keydown', globalHandler);
    isListenerAttached = false;
  }
};
