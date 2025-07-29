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
        description: 'Search (Raw View)',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="e">e</kbd>],
        description: 'Full screen (Raw View)',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="k">k</kbd>],
        description: 'Toggle Tooltips (Raw View)',
      },
      {
        keys: [<kbd key="esc">Esc</kbd>],
        description: 'Exit Full Screen (Raw View)',
      },
    ],
    'PDF Manager': [
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="h">h</kbd>],
        description: 'Show/Hide Templates',
      },
      {
        keys: [<ModKey key="mod" />, '+', <kbd key="0-9">0-9</kbd>],
        description: 'Add Specific Template',
      },
    ],
  };
}

export default getAvailableShortcuts;
