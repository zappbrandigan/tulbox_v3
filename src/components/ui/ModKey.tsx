import { Command, ChevronUp } from 'lucide-react';
import { useIsMac } from '@/hooks';

const ModKey = () => {
  const isMac = useIsMac();

  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600">
      {isMac ? (
        <Command className="w-3 h-3" />
      ) : (
        <ChevronUp className="w-3 h-3" />
      )}
    </kbd>
  );
};
export default ModKey;
