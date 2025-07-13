import {
  Search,
  Expand,
  MessageSquareText,
  MessageSquareOff,
} from 'lucide-react';
import ShortcutButton from './ShortcutButton';
import ShortcutIcon from './ShortcutIcon';

interface CodeViewHeaderProps {
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTooltipEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isTooltipEnabled: boolean;
  totalRecords: number;
  fileName: string;
}
const CodeViewHeader: React.FC<CodeViewHeaderProps> = ({
  setShowSearch,
  setIsFullScreen,
  setIsTooltipEnabled,
  isTooltipEnabled,
  totalRecords,
  fileName,
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">
          CWR File Records
        </h4>
        <div className="flex gap-1">
          <ShortcutButton toggle={setShowSearch}>
            <Search className="h-4 w-4" />
            <ShortcutIcon text="F" />
          </ShortcutButton>
          <ShortcutButton toggle={setIsFullScreen}>
            <Expand className="h-4 w-4" />
            <ShortcutIcon text="E" />
          </ShortcutButton>
          <ShortcutButton toggle={setIsTooltipEnabled}>
            {isTooltipEnabled ? (
              <MessageSquareText className="h-4 w-4" />
            ) : (
              <MessageSquareOff className="h-4 w-4" />
            )}
            <ShortcutIcon text="K" />
          </ShortcutButton>
        </div>
        <span className="text-xs text-gray-500">
          {totalRecords} lines • {fileName}
        </span>
      </div>
    </div>
  );
};

export default CodeViewHeader;
