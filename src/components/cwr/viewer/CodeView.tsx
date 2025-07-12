import React, { useState, useEffect, useRef } from 'react';
import RecordLine from './RecordLine';
import { LoadingOverlay } from '@/components/ui';
import {
  Code,
  Expand,
  MessageSquareOff,
  MessageSquareText,
  Minimize,
  Search,
} from 'lucide-react';
import { CWRConverterRecord, CWRParsedRecord } from 'cwr-parser/types';
import { getTemplateById } from '@/utils';
import ParserWorker from '@/workers/parserWorker?worker';
import SearchCodeView from './SearchCodeView';
import SearchWorker from '@/workers/recordSearchWorker?worker';
import ShortcutButton from './ShortcutButton';
import ShortcutIcon from './ShortcutIcon';

const ROW_HEIGHT = 24;
const PAGE_SIZE = 50;

interface CodeViewProps {
  fileContent: string;
  file: string;
  selectedTemplate: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  parseResult: CWRConverterRecord | null;
  setParseResult: React.Dispatch<
    React.SetStateAction<CWRConverterRecord | null>
  >;
}

const CodeView: React.FC<CodeViewProps> = ({
  fileContent,
  file,
  selectedTemplate,
  isProcessing,
  setIsProcessing,
  parseResult,
  setParseResult,
}) => {
  const template = getTemplateById(selectedTemplate);
  const [lines, setLines] = useState<CWRParsedRecord<Map<string, string>>[]>(
    []
  );
  const [startIndex, setStartIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLines, setFilteredLines] = useState<
    {
      index: number;
      line: CWRParsedRecord<Map<string, string>>;
    }[]
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [workerBusy, setWorkerBusy] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const MIN_DURATION = 500; // ms
    const start = Date.now();
    setIsProcessing(true);

    const worker = new ParserWorker();
    worker.postMessage({ fileContent, file });

    worker.onmessage = (e) => {
      const result: CWRConverterRecord = e.data;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      setParseResult(result);
      setLines(result.lines);

      setTimeout(() => {
        setIsProcessing(false);
        worker.terminate();
      }, remaining);
    };

    return () => worker.terminate();
  }, [fileContent, file, setIsProcessing, setParseResult]);

  useEffect(() => {
    const handleFullScreen = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && !event.metaKey && event.key === 'e') ||
        (event.metaKey && !event.ctrlKey && event.key === 'e')
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsFullScreen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setIsFullScreen(false);
      }
    };

    const handleShowSearch = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && !event.metaKey && event.key === 'f') ||
        (event.metaKey && !event.ctrlKey && event.key === 'f')
      ) {
        event.preventDefault();
        event.stopPropagation();
        setShowSearch((prevShowSearch) => {
          if (prevShowSearch) {
            setSearchQuery('');
            setShowSearch(false);
            setFilteredLines([]);
            setCurrentMatchIndex(-1);
          }
          return !prevShowSearch;
        });
      }
    };

    const handleToggleTooltip = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && !event.metaKey && event.key === 'k') ||
        (event.metaKey && !event.ctrlKey && event.key === 'k')
      ) {
        event.preventDefault();
        event.stopPropagation();
        setIsTooltipEnabled((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleFullScreen);
    window.addEventListener('keydown', handleShowSearch);
    window.addEventListener('keydown', handleToggleTooltip);

    return () => {
      window.removeEventListener('keydown', handleFullScreen);
      window.removeEventListener('keydown', handleShowSearch);
      window.removeEventListener('keydown', handleToggleTooltip);
    };
  }, []);

  // Set focus to search bar when visible
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  //️  create & destroy once
  useEffect(() => {
    const worker = new SearchWorker();
    searchWorkerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, status, matches } = e.data;

      if (type === 'status') {
        setWorkerBusy(status === 'working');
      }

      if (type === 'result') {
        setFilteredLines(matches);
        setCurrentMatchIndex(-1);
      }
    };

    return () => worker.terminate();
  }, []); // only on mount/unmount

  //  send heavy payload whenever lines change
  useEffect(() => {
    if (lines.length && searchWorkerRef.current) {
      searchWorkerRef.current.postMessage({
        type: 'init', // or 'updateLines'
        payload: { lines },
      });
    }
  }, [lines]); // only re-fires the postMessage

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchWorkerRef.current) {
      searchWorkerRef.current.postMessage({
        type: 'search',
        payload: { query },
      });
    }
  };

  if (!parseResult) return null;

  return (
    <>
      <div className="flex items-center space-x-2">
        <Code className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {`Raw File Content (${parseResult?.statistics?.totalRecords} lines)`}
        </h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isProcessing ? (
          <LoadingOverlay message={'Rendering Raw Viewer...'} />
        ) : (
          <>
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
                  {parseResult?.statistics?.totalRecords} lines •{' '}
                  {parseResult?.fileName}
                </span>
              </div>
            </div>

            {/* Virtualized Scroll Area */}
            <div
              className={`bg-gray-900 text-gray-100 overflow-hidden ${
                isFullScreen
                  ? 'absolute top-0 left-0 right-0 bottom-0 z-50'
                  : ''
              }`}
            >
              <SearchCodeView
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredLines={filteredLines}
                setFilteredLines={setFilteredLines}
                handleSearch={handleSearch}
                scrollContainerRef={scrollContainerRef}
                setStartIndex={setStartIndex}
                currentMatchIndex={currentMatchIndex}
                setCurrentMatchIndex={setCurrentMatchIndex}
                workerBusy={workerBusy}
                ROW_HEIGHT={ROW_HEIGHT}
              />
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
                    {lines
                      .slice(startIndex, startIndex + PAGE_SIZE)
                      .map((line, i) => {
                        const actualIndex = startIndex + i;
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
                        const addMarginTop =
                          spacingRecords.includes(recordType);

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
                                isFullScreen={isFullScreen}
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

            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  <span className="text-emerald-500">
                    {parseResult?.statistics?.totalRecords}
                  </span>
                  {` records • `}
                  <span className="text-red-500">
                    {parseResult?.statistics?.errors.length}
                  </span>
                  {` errors • `}
                  <span className="text-amber-500">
                    {parseResult?.statistics?.warnings.length}
                  </span>
                  {` warnings`}
                </span>
                <span>
                  CWR v{Number(parseResult.version)} format •{' '}
                  {`${template?.name} `}
                  <span className="text-blue-500">v{template?.version}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CodeView;
