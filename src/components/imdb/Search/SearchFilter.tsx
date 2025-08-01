import { productionType } from '@/types';
import { Film, Gamepad2, Search, Tv } from 'lucide-react';
import React from 'react';

interface SearchFilterProps {
  searchType: productionType;
  setSearchType: React.Dispatch<React.SetStateAction<productionType>>;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchType,
  setSearchType,
}) => {
  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {[
        { id: 'all', label: 'All Types', icon: Search },
        { id: 'movie', label: 'Movies', icon: Film },
        { id: 'tvSeries', label: 'TV Shows', icon: Tv },
        { id: 'tvMovie', label: 'TV Movies', icon: Tv },
        { id: 'videoGame', label: 'Games', icon: Gamepad2 },
      ].map((type) => (
        <button
          key={type.id}
          onClick={() => setSearchType(type.id as productionType)}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all border
        ${
          searchType === type.id
            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
        }`}
        >
          <type.icon className="w-4 h-4 mr-2" />
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default SearchFilter;
