import { Keyboard } from 'lucide-react';
import { useShortcut } from '@/hooks';
import React from 'react';
import getAvailableShortcuts from '@/constants/shortcuts';

const ShortcutModal = ({
  showShortcuts,
  setShowShortcuts,
}: {
  showShortcuts: boolean;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  useShortcut({
    escape: () => setShowShortcuts(false),
  });
  const availableShortcuts = getAvailableShortcuts();

  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 !mt-0">
      <div className="bg-white dark:bg-gray-900 min-w-[400px] max-w-3xl p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Keyboard className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            <span>Available Shortcuts</span>
          </h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
          {Object.entries(availableShortcuts).map(([tool, shortcuts]) => (
            <div key={tool}>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2 border-l-4 border-sky-500 pl-2">
                {tool}
              </h3>
              <ul className="space-y-1 pl-4">
                {shortcuts.map((shortcut, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed flex flex-wrap items-center gap-1"
                  >
                    <span className="flex gap-1 flex-wrap items-center">
                      {shortcut.keys.map((el, j) => (
                        <React.Fragment key={j}>{el}</React.Fragment>
                      ))}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      {shortcut.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutModal;
