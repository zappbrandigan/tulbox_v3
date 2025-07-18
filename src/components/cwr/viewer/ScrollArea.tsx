import { Minimize } from 'lucide-react';
import RecordLine from './RecordLine';
import Search from './Search';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { CWRParsedRecord } from 'cwr-parser/types';
import { logUserEvent } from '@/utils/general/logEvent';

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

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    runSearch(value);
  };

  const isCmdOrCtrl = (e: KeyboardEvent) =>
    (e.ctrlKey && !e.metaKey) || (e.metaKey && !e.ctrlKey);

  const key = (e: KeyboardEvent) => e.key.toLowerCase(); // case-insensitive

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      /* 1. Full-screen (Cmd/Ctrl + E) ------------------------------ */
      if (isCmdOrCtrl(e) && key(e) === 'e') {
        e.preventDefault();
        setIsFullScreen((prev) => !prev);
        logUserEvent(
          'Shortcut Key Used',
          {
            action: 'ui-interaction',
            target: 'kb-shortcut',
            value: 'Full Screen',
          },
          'cwr-converter'
        );
        return;
      }

      /* 2. Toggle search bar (Cmd/Ctrl + F) ------------------------ */
      if (isCmdOrCtrl(e) && key(e) === 'f') {
        e.preventDefault();
        setShowSearch((show) => {
          if (show) {
            setSearchQuery('');
            setHitRows([]);
            setCurrentMatchIndex(-1);
          }
          return !show;
        });
        logUserEvent(
          'Shortcut Key Used',
          {
            action: 'ui-interaction',
            target: 'kb-shortcut',
            value: 'Search Bar',
          },
          'cwr-converter'
        );
        return;
      }

      /* 3. Toggle tooltips (Cmd/Ctrl + K) -------------------------- */
      if (isCmdOrCtrl(e) && key(e) === 'k') {
        e.preventDefault();
        setIsTooltipEnabled((prev) => !prev);
        logUserEvent(
          'Shortcut Key Used',
          {
            action: 'ui-interaction',
            target: 'kb-shortcut',
            value: 'Toggle Tooltips',
          },
          'cwr-converter'
        );
        return;
      }

      /* 4. Escape exits full-screen or close search bar------------- */
      if (e.key === 'Escape') {
        setIsFullScreen(false);
        setShowSearch(false);
        setSearchQuery('');
        setHitRows([]);
        setCurrentMatchIndex(-1);
        return;
      }
    },
    [
      setIsFullScreen,
      setShowSearch,
      setIsTooltipEnabled,
      setSearchQuery,
      setHitRows,
      setCurrentMatchIndex,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  return (
    <div
      className={`bg-gray-900 text-gray-100 overflow-hidden transition-all duration-500 ease ${
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
        } overflow-auto`}
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
                  <div className="flex-shrink-0 w-12 px-3 py-1 text-gray-500 text-right border-r border-gray-700 bg-gray-800 select-none">
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
