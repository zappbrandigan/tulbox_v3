import { useShortcut } from '@/hooks';

interface Props {
  warnings: string[];
  showWarnings: boolean;
  setShowWarnings: React.Dispatch<React.SetStateAction<boolean>>;
}

const WarningModal: React.FC<Props> = ({
  warnings,
  showWarnings,
  setShowWarnings,
}) => {
  useShortcut({
    escape: () => setShowWarnings(false),
  });
  if (warnings.length === 0 || !showWarnings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 !mt-0">
      <div className="bg-white dark:bg-gray-900 w-auto max-w-[80vw] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-amber-700">Warnings</h2>
          <button
            onClick={() => setShowWarnings(false)}
            className="text-sm text-amber-600 hover:underline"
          >
            Close
          </button>
        </div>
        <ul className="list-none list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1 max-h-64 overflow-auto">
          {warnings.map((w, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: w }} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WarningModal;
