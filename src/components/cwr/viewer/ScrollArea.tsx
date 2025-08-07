import { Minimize } from 'lucide-react';
import RecordLine from './RecordLine';
import Search from './Search';
import { useEffect, useRef, useState } from 'react';
import { useSearch, useShortcut } from '@/hooks';
import { CWRParsedRecord } from 'cwr-parser/types';
import { logUserEvent } from '@/utils/general/logEvent';
import { useSessionId } from '@/context/sessionContext';

const ROW_HEIGHT = 24;
const PAGE_SIZE = 50;

interface Props {
  lines: CWRParsedRecord<Map<string, string>>[];
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  isTooltipEnabled: boolean;
  setIsTooltipEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScrollArea: React.FC<Props> = ({
  lines,
  showSearch,
  setShowSearch,
  isTooltipEnabled,
  setIsTooltipEnabled,
  isFullScreen,
  setIsFullScreen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [hitRows, setHitRows] = useState<number[]>([]);

  const { runSearch, matchLines, busy, progress } = useSearch(lines);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sessionId = useSessionId();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    runSearch(value);
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const rows = Array.from(matchLines).sort((a, b) => a - b);
    setHitRows(rows);
    setCurrentMatchIndex(rows.length ? 0 : -1);
  }, [matchLines]);

  useShortcut({
    'mod+e': () => {
      setIsFullScreen((prev) => !prev);
      logUserEvent(
        sessionId,
        'Shortcut Key Used',
        {
          action: 'ui-interaction',
          target: 'kb-shortcut',
          value: 'Full Screen',
        },
        'cwr-converter'
      );
    },
    'mod+f': () => {
      setShowSearch((show) => {
        if (show) {
          setSearchQuery('');
          setHitRows([]);
          setCurrentMatchIndex(-1);
        }
        return !show;
      });
      logUserEvent(
        sessionId,
        'Shortcut Key Used',
        {
          action: 'ui-interaction',
          target: 'kb-shortcut',
          value: 'Search Bar',
        },
        'cwr-converter'
      );
    },
    'mod+k': () => {
      setIsTooltipEnabled((prev) => !prev);
      logUserEvent(
        sessionId,
        'Shortcut Key Used',
        {
          action: 'ui-interaction',
          target: 'kb-shortcut',
          value: 'Toggle Tooltips',
        },
        'cwr-converter'
      );
    },
    escape: () => {
      setIsFullScreen(false);
      setShowSearch(false);
      setSearchQuery('');
      setHitRows([]);
      setCurrentMatchIndex(-1);
    },
  });

  return (
    <div
      className={`bg-slate-800 text-gray-100 dark:bg-gray-900 overflow-hidden transition-all duration-500 ease ${
        isFullScreen ? 'absolute top-0 left-0 right-0 bottom-0 z-50' : ''
      }`}
    >
      <Search
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearchInput}
        scrollContainerRef={scrollContainerRef}
        setStartIndex={setStartIndex}
        currentMatchIndex={currentMatchIndex}
        setCurrentMatchIndex={setCurrentMatchIndex}
        busy={busy}
        hitRows={hitRows}
        progress={progress}
        ROW_HEIGHT={ROW_HEIGHT}
      />

      {/* Exit full screen button */}
      <button
        onClick={() => {
          setIsFullScreen(false);
        }}
        className={`${
          isFullScreen
            ? 'absolute top-2 right-2 bg-red-200 bg-opacity-25 p-2 rounded-lg z-[1001] hover:bg-opacity-100 hover:text-red-500'
            : 'hidden'
        }`}
        title="Exit Full Screen (Esc)"
      >
        <Minimize className="w-15 h-15" />
      </button>

      {/* Virtual scroll container */}
      <div
        className={`min-h-[600px] ${
          isFullScreen ? 'h-[100vh]' : 'h-[73vh]'
        } overflow-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800`}
        ref={scrollContainerRef}
        onScroll={() => {
          const scrollTop = scrollContainerRef.current?.scrollTop || 0;
          const newIndex = Math.floor(scrollTop / ROW_HEIGHT);
          setStartIndex(newIndex);
        }}
      >
        <div
          className="relative font-mono text-sm"
          style={{ height: lines.length * ROW_HEIGHT }}
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              transform: `translateY(${startIndex * ROW_HEIGHT}px)`,
            }}
          >
            {lines.slice(startIndex, startIndex + PAGE_SIZE).map((line, i) => {
              const actualIndex = startIndex + i;
              const isRowMatched = matchLines.has(actualIndex);
              const recordType = line.recordType ?? '';
              const spacingRecords = [
                'HDR',
                'GRH',
                'GRT',
                'TRL',
                'NWR',
                'REV',
                'ACK',
              ];
              const addMarginTop = spacingRecords.includes(recordType);

              return (
                <div
                  key={actualIndex}
                  id={`match-${actualIndex}`}
                  className={`flex transition-colors ${
                    addMarginTop ? 'mt-3' : ''
                  }`}
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  <div className="flex-shrink-0 min-w-12 px-3 py-1 text-gray-400 text-right border-r border-gray-700 select-none">
                    {actualIndex + 1}
                  </div>
                  <div className="flex-1 px-3 py-1 whitespace-nowrap">
                    <RecordLine
                      line={line.data}
                      isMatched={isRowMatched}
                      searchQuery={searchQuery}
                      isTooltipEnabled={isTooltipEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollArea;
