import React, { useState } from 'react';
import {
  Search,
  Podcast,
  Video,
  Clapperboard,
  Film,
  Tv,
  Gamepad2,
  Calendar,
  Globe,
  Building,
  Users,
  User,
  Star,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  AKATitle,
  IMDBProduction,
  IMDBSearchResult,
  productionType,
} from '@/types';
import { searchIMDB, getProductionDetails, getAkas } from '@/utils/imdbApi';
import { showToast } from '@/utils/toast';
import { ToolHeader } from '@/components/ui/ToolHeader';
import { ImdbSearchFilter } from '@/components/imdb/ImdbSearchFilter';
import { ImdbSearchInput } from '@/components/imdb/ImdbSearchInput';
import { ImdbSearchContainer } from '@/components/imdb/ImdbSearchContainer';

const IMDBSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IMDBSearchResult[]>([]);
  const [selectedProduction, setSelectedProduction] =
    useState<IMDBProduction | null>(null);
  const [akaTitles, setAkaTitles] = useState<AKATitle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingAkas, setIsLoadingAkas] = useState(false);
  const [searchType, setSearchType] = useState<productionType>('all');
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedProduction(null);
    setAkaTitles([]);

    try {
      const results = await searchIMDB(searchQuery, searchType);
      setSearchResults(results);
    } catch (error) {
      setError(true);
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetAkas = async (result: IMDBSearchResult) => {
    setIsLoadingAkas(true);
    try {
      const akas = await getAkas(result);
      setAkaTitles(akas);
      setIsLoadingAkas(false);
    } catch (error) {
      console.error('Failed to load AKAs:', error);
    } finally {
      setIsLoadingAkas(false);
    }
  };

  const handleSelectProduction = async (result: IMDBSearchResult) => {
    setIsLoadingDetails(true);
    setSelectedProduction(null);

    try {
      const details = await getProductionDetails(result);
      setSelectedProduction(details);
    } catch (error) {
      console.error('Failed to load production details:', error);
    } finally {
      setIsLoadingDetails(false);
      setSearchQuery('');
      setSearchResults([]);
      handleGetAkas(result);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="w-5 h-5" />;
      case 'tvSeries':
      case 'tvMovie':
      case 'tvSpecial':
        return <Tv className="w-5 h-5" />;
      case 'tvEpisode':
        return <Clapperboard className="w-5 h-5" />;
      case 'videoGame':
        return <Gamepad2 className="w-5 h-5" />;
      case 'video':
      case 'musicVideo':
        return <Video className="w-5 h-5" />;
      case 'podcast':
        return <Podcast className="w-5 h-5" />;
      default:
        return <Film className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie':
        return 'bg-blue-100 text-blue-800';
      case 'tvEpisode':
      case 'tvSeries':
        return 'bg-purple-100 text-purple-800';
      case 'tvMovie':
      case 'tvSpecial':
        return 'bg-orange-100 text-orange-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'musicVideo':
        return 'bg-pink-100 text-pink-800';
      case 'podcast':
      case 'videoGame':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSearchResults =
    searchType === 'all'
      ? searchResults
      : searchResults.filter((item) => item.type === searchType);

  return (
    <div className="space-y-8">
      <ToolHeader
        primaryText="IMDb Production Search"
        secondaryText={`
          Search for movies, TV shows, games and more.
          Get detailed production information including cast, crew, and international titles.
        `}
      />

      {/* Search Section */}
      <ImdbSearchContainer>
        <ImdbSearchFilter
          searchType={searchType}
          setSearchType={setSearchType}
        />
        <ImdbSearchInput
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          setSearchQuery={setSearchQuery}
        />
      </ImdbSearchContainer>

      {/* Search Results */}
      {!isLoadingDetails &&
        !selectedProduction &&
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
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    {result.poster ? (
                      <img
                        src={result.poster}
                        alt={result.title}
                        className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(result.type)}
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
                          {getTypeIcon(result.type)}
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
        )}

      {/* Loading Details */}
      {isLoadingDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading production details...</p>
        </div>
      )}

      {/* Production Details */}
      {selectedProduction && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getTypeIcon(selectedProduction.type)}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white`}
                  >
                    {selectedProduction.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedProduction.title}
                </h2>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedProduction.releaseYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{selectedProduction.language}</span>
                  </div>
                  {selectedProduction.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{selectedProduction.rating}/10</span>
                    </div>
                  )}
                </div>
              </div>
              {selectedProduction.poster && (
                <img
                  src={selectedProduction.poster}
                  alt={selectedProduction.title}
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* IMDB Code */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedProduction.imdbCode}`
                  );
                  showToast();
                }}
                className="flex items-center space-x-2"
              >
                <span className="font-medium text-gray-900">IMDB Code:</span>
                <code className="px-2 py-1 bg-gray-200 rounded text-sm font-mono hover:cursor-pointer">
                  {selectedProduction.imdbCode}
                </code>
              </div>
              <a
                href={`https://www.imdb.com/title/${selectedProduction.imdbCode}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                View on IMDB
                <ExternalLink className="inline w-5 h-5 text-gray-600" />
              </a>
            </div>

            {/* Plot */}
            {selectedProduction.plot && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Plot
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProduction.plot.length > 500
                    ? `${selectedProduction.plot.substring(0, 500)}. . .`
                    : selectedProduction.plot}
                </p>
              </div>
            )}

            {/* Cast & Crew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Actors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Cast
                </h3>
                <div className="space-y-2">
                  {selectedProduction.actors.map((actor, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        navigator.clipboard.writeText(`${actor}`);
                        showToast();
                      }}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Director */}
              {selectedProduction.director && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center hover:cursor-pointer">
                    <User className="w-5 h-5 mr-2" />
                    Director
                  </h3>
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${selectedProduction.director}`
                      );
                      showToast();
                    }}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:cursor-pointer"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {selectedProduction.director}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Production Companies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Production Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduction.productionCompanies.map(
                  (company, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        navigator.clipboard.writeText(`${company}`);
                        showToast();
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:cursor-pointer"
                    >
                      {company}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Loading AKAs */}
            {isLoadingAkas && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Detecting AKA Languages...</p>
              </div>
            )}

            {/* AKA Titles */}
            {akaTitles?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  International Titles
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Transliterated Title
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Article
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Language
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {akaTitles?.map((aka, index) => (
                        <tr
                          key={index}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${aka.transliterated}\t${aka.article}\t${aka.type}\t${aka.language}`
                            );
                            showToast();
                          }}
                          className="hover:bg-gray-50 hover:cursor-pointer"
                        >
                          <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                            {aka.transliterated}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {aka.article}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {aka.language}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {aka.type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching &&
        !isLoadingDetails &&
        searchResults.length === 0 &&
        !selectedProduction &&
        searchQuery &&
        error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
    </div>
  );
};

export default IMDBSearch;
