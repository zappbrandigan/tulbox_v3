import {
  Search,
  Expand,
  MessageSquareText,
  MessageSquareOff,
} from 'lucide-react';
import ShortcutButton from './ShortcutButton';
import ShortcutIcon from './ShortcutIcon';

interface CodeViewHeaderProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  isTooltipEnabled: boolean;
  setIsTooltipEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  totalRecords: number;
  fileName: string;
}
const CodeViewHeader: React.FC<CodeViewHeaderProps> = ({
  showSearch,
  setShowSearch,
  isFullScreen,
  setIsFullScreen,
  isTooltipEnabled,
  setIsTooltipEnabled,
  totalRecords,
  fileName,
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="relative flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 z-10">
          CWR File Records
        </h4>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
          <ShortcutButton
            title="Toggle Search"
            toggle={setShowSearch}
            active={showSearch}
          >
            <Search className="h-4 w-4" />
            <ShortcutIcon text="F" />
          </ShortcutButton>
          <ShortcutButton
            title="Toggle Full Screen"
            toggle={setIsFullScreen}
            active={isFullScreen}
          >
            <Expand className="h-4 w-4" />
            <ShortcutIcon text="E" />
          </ShortcutButton>
          <ShortcutButton
            title="Toggle Field Descriptions"
            toggle={setIsTooltipEnabled}
            active={isTooltipEnabled}
          >
            {isTooltipEnabled ? (
              <MessageSquareText className="h-4 w-4" />
            ) : (
              <MessageSquareOff className="h-4 w-4" />
            )}
            <ShortcutIcon text="K" />
          </ShortcutButton>
        </div>

        <span className="text-xs text-gray-500 z-10 hidden md:inline">
          {totalRecords} lines • {fileName}
        </span>
      </div>
    </div>
  );
};

export default CodeViewHeader;
