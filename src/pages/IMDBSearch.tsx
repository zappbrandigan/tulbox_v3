import React, { useEffect, useState } from 'react';
import {
  Search,
  Podcast,
  Video,
  Clapperboard,
  Film,
  Tv,
  Gamepad2,
  CircleUser,
} from 'lucide-react';
import {
  AKATitle,
  IMDBProduction,
  IMDBSearchResult,
  productionType,
} from '@/types';
import { searchIMDB, getProductionDetails, getAkas, trackEvent } from '@/utils';
import {
  SearchContainer,
  SearchInput,
  SearchFilter,
  SearchResult,
  ProductionDetails,
} from '@/components/imdb';
import { ToolHeader, LoadingOverlay } from '@/components/ui';

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
    trackEvent('imdb_prod_search', { query: searchQuery });
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedProduction(null);
    setAkaTitles([]);

    try {
      const results = await searchIMDB(searchQuery, searchType);
      setSearchResults(results);
    } catch (error) {
      trackEvent('imdb_prod_search_error', { query: searchQuery });
      setError(true);
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetAkas = async (result: IMDBSearchResult) => {
    trackEvent('imdb_prod_akas', { production: result.id });
    setIsLoadingAkas(true);
    try {
      const akas = await getAkas(result);
      setAkaTitles(akas);
      setIsLoadingAkas(false);
    } catch (error) {
      trackEvent('imdb_prod_akas_error', { query: result.id });
      console.error('Failed to load AKAs:', error);
    } finally {
      setIsLoadingAkas(false);
    }
  };

  const handleSelectProduction = async (result: IMDBSearchResult) => {
    trackEvent('imdb_prod_selection', { production: result.id });
    setIsLoadingDetails(true);
    setSelectedProduction(null);

    try {
      const details = await getProductionDetails(result);
      setSelectedProduction(details);
    } catch (error) {
      trackEvent('imdb_prod_selection_error', { production: result.id });
      console.error('Failed to load production details:', error);
    } finally {
      setIsLoadingDetails(false);
      setSearchQuery('');
      setSearchResults([]);
      handleGetAkas(result);
    }
  };

  const iconMap: Record<productionType, JSX.Element> = {
    movie: <Film className="w-5 h-5" />,
    tvSeries: <Tv className="w-5 h-5" />,
    tvMovie: <Tv className="w-5 h-5" />,
    tvSpecial: <Tv className="w-5 h-5" />,
    tvMiniSeries: <Tv className="w-5 h-5" />,
    tvEpisode: <Clapperboard className="w-5 h-5" />,
    videoGame: <Gamepad2 className="w-5 h-5" />,
    video: <Video className="w-5 h-5" />,
    musicVideo: <Video className="w-5 h-5" />,
    podcast: <Podcast className="w-5 h-5" />,
    short: <Film className="w-5 h-5" />,
    all: <Film className="w-5 h-5" />,
    name: <CircleUser className="w-5 h-5" />,
  };

  const getTypeIcon = (type: productionType): JSX.Element => {
    return iconMap[type] ?? <Film className="w-5 h-5" />;
  };

  useEffect(() => {
    trackEvent('screen_view', {
      firebase_screen: 'IMDbSearch',
      firebase_screen_class: 'IMDbSearch',
    });
  }, []);

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
      <SearchContainer>
        <SearchFilter searchType={searchType} setSearchType={setSearchType} />
        <SearchInput
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          setSearchQuery={setSearchQuery}
        />
      </SearchContainer>

      {/* Search Results */}
      {!isLoadingDetails && !selectedProduction && (
        <SearchResult
          searchType={searchType}
          searchResults={searchResults}
          handleSelectProduction={handleSelectProduction}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* Loading Details */}
      {isLoadingDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LoadingOverlay message="Loading production details" />
        </div>
      )}

      {/* Production Details */}
      {selectedProduction && (
        <ProductionDetails
          selectedProduction={selectedProduction}
          isLoadingAkas={isLoadingAkas}
          akaTitles={akaTitles}
          getTypeIcon={getTypeIcon}
        />
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
