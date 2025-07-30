import { ModKey, ReturnKey, ShiftKey } from '@/components/ui';

function getAvailableShortcuts() {
  return {
    General: [
      {
        keys: [<kbd key="esc">Esc</kbd>],
        description: 'Close Modal',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd>/</kbd>],
        description: 'Show Shortcuts',
      },
    ],
    'CWR Converter': [
      {
        keys: [<kbd key="esc">Esc</kbd>],
        description: 'Exit Full Screen, Exit Search (Raw View)',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="f">f</kbd>],
        description: 'Toggle Search (Raw View)',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="e">e</kbd>],
        description: 'Toggle Full screen (Raw View)',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="k">k</kbd>],
        description: 'Toggle Tooltips (Raw View)',
      },
    ],
    'PDF Manager': [
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="h">h</kbd>],
        description: 'Show/Hide Templates',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key=".">.</kbd>],
        description: 'Add Rule',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="j">j</kbd>],
        description: 'Clear Rules',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="1-9">1-9</kbd>],
        description: 'Add Rule Template',
      },
      {
        keys: [<ModKey key="mod" />, '+', <ShiftKey />, '+', <ReturnKey />],
        description: 'Apply Rules',
      },
    ],
  };
}

export default getAvailableShortcuts;
