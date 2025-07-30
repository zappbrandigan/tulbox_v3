import { ModKey } from '@/components/ui';

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
      {
        keys: [<kbd key="esc">Esc</kbd>],
        description: 'Exit Full Screen, Exit Search (Raw View)',
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
        keys: [<ModKey key="mod" />, '+', <kbd key="1-9">1-9</kbd>],
        description: 'Add Specific Template',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="j">j</kbd>],
        description: 'Clear Rules',
      },
    ],
  };
}

export default getAvailableShortcuts;
