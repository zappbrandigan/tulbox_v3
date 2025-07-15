import { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, CircleX, Loader } from 'lucide-react';

interface SearchCodeViewProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;

  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  hitRows: number[]; // sorted array of row indices with ≥1 match
  currentMatchIndex: number;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;

  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;

  scrollContainerRef: React.RefObject<HTMLDivElement>;
  setStartIndex: React.Dispatch<React.SetStateAction<number>>;

  busy: boolean; // worker scanning?
  progress: number; // 0‒1
  ROW_HEIGHT: number;
}

const SearchCodeView: React.FC<SearchCodeViewProps> = ({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,

  hitRows,
  currentMatchIndex,
  setCurrentMatchIndex,

  handleSearch,
  scrollContainerRef,
  setStartIndex,

  busy,
  progress,
  ROW_HEIGHT,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(t);
    } else {
      searchInputRef.current?.blur();
    }
  }, [showSearch]);

  /* --- helpers ---------------------------------------------------- */
  const totalHits = hitRows.length;
  const scrollToMatch = (row: number) => {
    setStartIndex(row);
    scrollContainerRef.current!.scrollTop = row * ROW_HEIGHT;
  };

  const handlePrev = () =>
    setCurrentMatchIndex((i) => {
      const next = i <= 0 ? totalHits - 1 : i - 1;
      scrollToMatch(hitRows[next]);
      return next;
    });

  const handleNext = () =>
    setCurrentMatchIndex((i) => {
      const next = i >= totalHits - 1 ? 0 : i + 1;
      scrollToMatch(hitRows[next]);
      return next;
    });

  const handleClear = () => {
    setSearchQuery('');
    setShowSearch(false);
    setCurrentMatchIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && totalHits) handleNext();
  };

  return (
    <div
      className={`w-full flex items-center transition-all duration-500 ease-out overflow-hidden transform ${
        showSearch ? 'max-h-[80px] scale-100' : 'max-h-0 scale-y-95'
      }`}
    >
      <div className="w-full flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400">
        {/* left counter / loader */}
        <div className="w-[200px] py-4 text-md text-gray-500 dark:text-gray-200 bg-blue-50 dark:bg-blue-950 flex justify-center items-center border-r-2 border-gray-300 dark:border-gray-700">
          {busy ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin" />
              <span>{Math.round(progress * 100)}%</span>
            </div>
          ) : (
            <span>
              {totalHits ? currentMatchIndex + 1 : 0} / {totalHits}
            </span>
          )}
        </div>

        {/* nav buttons */}
        <button
          onClick={handlePrev}
          disabled={!totalHits || busy}
          className="text-gray-500 dark:text-gray-300 disabled:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 disabled:hover:text-gray-300 disabled:hover:bg-transparent"
        >
          <ChevronUp className="w-8 h-8 mx-1 rounded-lg" />
        </button>
        <button
          onClick={handleNext}
          disabled={!totalHits || busy}
          className="text-gray-500 dark:text-gray-300 disabled:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 disabled:hover:text-gray-300 disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-8 h-8 mx-1 rounded-lg" />
        </button>

        {/* clear */}
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-red-500"
        >
          <CircleX className="w-6 h-6 mx-2" />
        </button>

        {/* input */}
        <input
          id="record-search-box"
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          placeholder="Search records…"
          className="flex-1 pl-10 pr-4 py-3 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default SearchCodeView;
