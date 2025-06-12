export type productionType = 
'all' | 'movie' | 'tvMovie' |'tvSeries' | 'tvEpisode' | 'short' |
'videoGame' | 'podcast' | 'musicVideo' |'name' | 'video'

export interface FileItem {
  id: string;
  originalName: string;
  currentName: string;
  file: File;
  characterCount: number;
  status: 'valid' | 'invalid' | 'duplicate';
  lastModified: Date;
}

export interface SearchReplaceRule {
  id: string;
  searchPattern: string;
  replaceWith: string;
  isRegex: boolean;
  isEnabled: boolean;
}

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  isActive: boolean;
}

export interface IMDBProduction {
  id: string;
  title: string;
  imdbCode: string;
  type: productionType;
  language: string;
  productionCompanies: string[];
  releaseYear: number;
  actors: string[];
  director: string | null;
  akaTitle: AKATitle[];
  plot?: string;
  rating?: number;
  poster?: string;
}

export interface AKATitle {
  title: string;
  transliterated: string;
  article: string;
  language: string;
  type: string;
}

export interface IMDBSearchResult {
  id: string;
  title: string;
  year: string | number;
  type: string;
  poster?: string;
}

/*
* type for API title details response from imdb236
*
*/

export interface ApiTitleSearchResponse {
  data: {
    d: ApiTitleSearchItem[];
    q: string;
    v: number;
  }
}

export interface ApiTitleSearchItem {
  i: {
    height: number;
    imageUrl: string;
    width: number;
  };
  id: string;
  l: string; // title
  q: string; // type e.g., "feature", "TV series"
  qid: string; // qualified type e.g., "movie", "tvSeries"
  rank: number;
  s: string; // cast summary
  y: number; // release year
  yr?: string; // optional: year range string, e.g. "2021-2021"
}

export interface ApiProductionDetails {
  data: {
    id: string;
    url: string;
    primaryTitle: string;
    originalTitle: string;
    type: productionType;
    description: string;
    primaryImage: string;
    trailer: string;
    contentRating: string;
    startYear: number;
    endYear: number | null;
    releaseDate: string;
    interests: string[];
    countriesOfOrigin: string[];
    externalLinks: string[];
    spokenLanguages: string[];
    filmingLocations: string[];
    productionCompanies: ProductionCompany[];
    budget: number;
    grossWorldwide: number;
    genres: string[];
    isAdult: boolean;
    runtimeMinutes: number;
    averageRating: number;
    numVotes: number;
    metascore: number;
    directors: Person[];
    writers: Person[];
    cast: CastMember[];
  }
}

export interface ProductionCompany {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  url: string;
  fullName: string;
}

export interface CastMember extends Person {
  job: string;
  characters: string[];
}

/*
* Types for API AKA response data from imdb232
*
*/

export interface ApiAkaResponse {
  data: {
    data: {
      title: {
        originalTitleText: {
          text: string;
        };
        akas: AkaConnection;
      };
    };
  };
}

export interface AkaConnection {
  __typename: string;
  edges: AkaEdge[];
  pageInfo: PageInfo;
  total: number;
}

export interface AkaEdge {
  node: AkaNode;
}

export interface AkaNode {
  attributes: string[];
  country: DisplayableCountry;
  language: DisplayableLanguage | null;
  displayableProperty: DisplayableTitleAkaProperty;
}

export interface DisplayableCountry {
  __typename: string;
  id: string;   // e.g., "US"
  text: string; // e.g., "United States"
}

export interface DisplayableLanguage {
  __typename: string;
  id: string;   // e.g., "en"
  text: string; // e.g., "English"
}

export interface DisplayableTitleAkaProperty {
  __typename: string;
  value: {
    id: string;
    plainText: string;
  };
}

export interface PageInfo {
  __typename: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}
