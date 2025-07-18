import { Loader2, Search } from 'lucide-react';
import React from 'react';

interface SearchInputProps {
  searchQuery: string;
  handleSearch: () => Promise<void>;
  isSearching: boolean;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  handleSearch,
  isSearching,
  setSearchQuery,
}) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          type="text"
          name="search"
          value={searchQuery}
          autoComplete="off"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for movies, TV shows, games..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={!searchQuery.trim() || isSearching}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center"
      >
        {isSearching ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Search
          </>
        )}
      </button>
    </div>
  );
};

export default SearchInput;
