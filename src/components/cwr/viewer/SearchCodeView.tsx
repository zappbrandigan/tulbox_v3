import { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, CircleX, Loader } from 'lucide-react';
import { CWRParsedRecord } from 'cwr-parser/types';

interface SearchCodeViewProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredLines: {
    index: number;
    line: CWRParsedRecord<Map<string, string>>;
  }[];
  setFilteredLines: React.Dispatch<
    React.SetStateAction<
      {
        index: number;
        line: CWRParsedRecord<Map<string, string>>;
      }[]
    >
  >;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  setStartIndex: React.Dispatch<React.SetStateAction<number>>;
  currentMatchIndex: number;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;
  workerBusy: boolean;
  ROW_HEIGHT: number;
}

const SearchCodeView: React.FC<SearchCodeViewProps> = ({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  filteredLines,
  setFilteredLines,
  handleSearch,
  scrollContainerRef,
  setStartIndex,
  currentMatchIndex,
  setCurrentMatchIndex,
  workerBusy,
  ROW_HEIGHT,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredLines.length > 0) {
      handleNext();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSearch(false);
    setFilteredLines([]);
    setCurrentMatchIndex(-1);
  };

  const handlePrevious = () => {
    setCurrentMatchIndex((prevIndex) => {
      const newIndex =
        prevIndex === 0 ? filteredLines.length - 1 : prevIndex - 1;
      scrollToMatch(filteredLines[newIndex].index);
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentMatchIndex((prevIndex) => {
      const newIndex =
        prevIndex === filteredLines.length - 1 ? 0 : prevIndex + 1;
      scrollToMatch(filteredLines[newIndex].index);
      return newIndex;
    });
  };

  const scrollToMatch = (index: number) => {
    setStartIndex(index);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = index * ROW_HEIGHT;
    }
  };

  return (
    <div
      className={
        showSearch
          ? 'w-full flex center-items bg-white border-2 border-gray-300 focus-within:border-blue-300'
          : 'hidden'
      }
    >
      <div className="w-[200px] py-4 text-md text-gray-500 bg-blue-50 flex justify-center items-center border-r-2">
        {workerBusy ? (
          <Loader />
        ) : (
          <span>
            {filteredLines.length > 0 ? currentMatchIndex + 1 : 0} /{' '}
            {filteredLines.length ?? 0}
          </span>
        )}
      </div>

      <button
        className="text-gray-500 disabled:text-gray-300 hover:text-blue-500 disabled:hover:bg-transparent"
        onClick={handlePrevious}
        disabled={filteredLines.length === 0}
      >
        <ChevronUp className="w-8 h-8 mx-1 rounded-lg" />
      </button>
      <button
        className="text-gray-500 disabled:text-gray-300 hover:text-blue-500 disabled:hover:bg-transparent"
        onClick={handleNext}
        disabled={filteredLines.length === 0}
      >
        <ChevronDown className="w-8 h-8 mx-1 rounded-lg" />
      </button>
      <button
        className="text-gray-500 hover:text-red-500"
        onClick={handleClear}
      >
        <CircleX className="w-6 h-6 mx-2" />
      </button>
      <input
        type="text"
        name="recordSearch"
        value={searchQuery}
        ref={searchInputRef}
        onChange={handleSearch}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search records. . ."
        className="w-[100%] pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:border-transparent"
      />
    </div>
  );
};

export default SearchCodeView;
