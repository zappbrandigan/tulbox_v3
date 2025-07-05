import React from 'react';
import { IMDBSearchResult, productionType } from '@/types';

interface SearchResultProps {
  searchType: string;
  searchResults: IMDBSearchResult[];
  handleSelectProduction: (result: IMDBSearchResult) => Promise<void>;
  getTypeIcon: (type: productionType) => JSX.Element;
}
const SearchResult: React.FC<SearchResultProps> = ({
  searchType,
  searchResults,
  handleSelectProduction,
  getTypeIcon,
}) => {
  const getTypeColor = (type: productionType | string) => {
    const colors: Record<productionType, string> = {
      movie: 'bg-blue-100 text-blue-800',
      tvEpisode: 'bg-purple-100 text-purple-800',
      tvSeries: 'bg-fuchsia-100 text-fuchsia-800',
      tvMovie: 'bg-orange-100 text-orange-800',
      tvSpecial: 'bg-amber-100 text-amber-800',
      video: 'bg-red-100 text-red-800',
      musicVideo: 'bg-pink-100 text-pink-800',
      podcast: 'bg-green-100 text-green-900',
      videoGame: 'bg-teal-100 text-teal-800',
      short: 'bg-rose-100 text-rose-800',
      all: '',
      name: '',
    };
    return colors[type as productionType] ?? 'bg-gray-100 text-gray-800';
  };

  const filteredSearchResults =
    searchType === 'all'
      ? searchResults
      : searchResults.filter((item) => item.type === searchType);

  return (
    filteredSearchResults.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Search Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSearchResults.map((result) => (
            <div
              key={result.id}
              title={result.title}
              onClick={() => handleSelectProduction(result)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start space-x-3">
                {result.poster ? (
                  <img
                    src={result.poster}
                    alt={result.title ?? 'Unknown'}
                    className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(result.type as productionType)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {result.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        result.type
                      )}`}
                    >
                      {getTypeIcon(result.type as productionType)}
                      <span className="ml-1">{result.type}</span>
                    </span>
                    {result.year && (
                      <span className="text-sm text-gray-500">
                        {result.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default SearchResult;
