import React from 'react';
import { IMDBSearchResult, productionType } from '@/types';
import PosterImage from '../PosterImage';

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
      tvMiniSeries: 'bg-emerald-100 text-emerald-800',
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
              onClick={() => handleSelectProduction(result)}
              className="flex p-4 rounded-xl border border-gray-200 hover:shadow-sm hover:border-blue-400 transition-all bg-white space-x-4 cursor-pointer"
            >
              {/* Poster */}
              <div className="flex-shrink-0">
                {result.poster ? (
                  <PosterImage
                    src={result.poster}
                    alt={result.title ?? 'Unknown'}
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    {getTypeIcon(result.type as productionType)}
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                {/* Title */}
                <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {result.title}
                </h4>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getTypeColor(
                      result.type
                    )}`}
                  >
                    {getTypeIcon(result.type as productionType)}
                    <span className="ml-1">{result.type}</span>
                  </span>
                  {result.year && (
                    <span className="text-sm rounded-md px-2 py-0.5 bg-gray-100">
                      <span className="font-medium text-gray-800">Year:</span>{' '}
                      {result.year}
                    </span>
                  )}
                  <span className="font-mediumrounded-md px-2 py-0.5 bg-gray-100 xs:inline md:hidden 2xl:inline">
                    <span className="font-medium text-gray-800">ID: </span>
                    {result.id}
                  </span>
                </div>

                {/* Stars */}
                {result.stars && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    <span className="font-medium text-gray-700">Stars:</span>{' '}
                    {result.stars}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default SearchResult;
