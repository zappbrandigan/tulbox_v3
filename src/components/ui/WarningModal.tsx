import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useShortcut } from '@/hooks';

interface Props {
  warnings: string[];
  showWarnings: boolean;
  setShowWarnings: React.Dispatch<React.SetStateAction<boolean>>;
}

const ROW_HEIGHT = 22;
const MAX_HEIGHT_PX = 256;
const W_MULTIPLIER = 3;

const Row = ({ index, style, data }: ListChildComponentProps<string[]>) => {
  return (
    <li
      style={style}
      className="list-none text-sm text-gray-800 dark:text-gray-200"
      dangerouslySetInnerHTML={{ __html: data[index] }}
    />
  );
};

const WarningModal: React.FC<Props> = ({
  warnings,
  showWarnings,
  setShowWarnings,
}) => {
  useShortcut({ escape: () => setShowWarnings(false) });
  if (warnings.length === 0 || !showWarnings) return null;

  const viewportHeight = Math.min(warnings.length * ROW_HEIGHT, MAX_HEIGHT_PX);
  const viewportWidth =
    Math.max(...warnings.map((w) => w.length)) * W_MULTIPLIER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 !mt-0">
      <div className="bg-white dark:bg-gray-900  p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-amber-700">Warnings</h2>
          <button
            onClick={() => setShowWarnings(false)}
            className="text-sm text-amber-600 hover:underline"
          >
            Close
          </button>
        </div>

        <List
          height={viewportHeight}
          width={viewportWidth}
          itemCount={warnings.length}
          itemSize={ROW_HEIGHT}
          itemData={warnings}
          innerElementType="ul"
          className="scrollbar-none whitespace-nowrap hover:scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600scrollbar-track-gray-100 dark:scrollbar-track-gray-800 "
          itemKey={(index: number, data: string[]) =>
            `${index}-${data[index]?.length ?? 0}`
          }
        >
          {Row as React.ComponentType<ListChildComponentProps<string[]>>}
        </List>
      </div>
    </div>
  );
};

export default WarningModal;
