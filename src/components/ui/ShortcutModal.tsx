import { useShortcut } from '@/hooks';

const availableShortcuts = {
  General: ['<kbd>Esc</kbd>: Close modal'],
  'CWR Converter': [
    '<kbd>^</kbd> / <kbd>⌘</kbd> + <kbd>f</kbd>: Search',
    '<kbd>^</kbd> / <kbd>⌘</kbd> + <kbd>e</kbd>: Full screen (Raw View)',
    '<kbd>^</kbd> / <kbd>⌘</kbd> +  <kbd>k</kbd>: Toggle tooltips',
    '<kbd>Esc</kbd>: Exit full screen',
  ],
  'PDF Manager': [
    '<kbd>^</kbd> / <kbd>⌘</kbd> + <kbd>0-9</kbd>: Add specific template',
  ],
};

const ShortcutModal = ({
  showShortcuts,
  setShowShortcuts,
}: {
  showShortcuts: boolean;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!showShortcuts) return null;
  useShortcut({
    escape: () => setShowShortcuts(false),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 !mt-0">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-sky-600 dark:text-sky-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.75 17L6 12.25L7.41 10.84L9.75 13.17L16.59 6.34L18 7.75L9.75 17Z"
              />
            </svg>
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
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: shortcut }}
                  />
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
