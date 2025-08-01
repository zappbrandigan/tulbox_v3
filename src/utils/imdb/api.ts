import {
  IMDBProduction,
  IMDBSearchResult,
  productionType,
  ApiTitleSearchResponse,
  ApiProductionDetails,
  ApiAkaResponse,
  AkaEdge,
  DetectedLanguage,
  LanguageDetectionResponse,
  AKATitle,
} from '@/types';
import { transliterate } from 'transliteration';
import PosterPlaceHolder from '@/static/imdb.jpg';
import languageArticles from '@/utils/imdb/articles';
import axios from 'axios';

const uniqueByTitle = (arr: { text: string }[]): { text: string }[] => {
  const seen = new Set();
  return arr.filter((item) => {
    const trimmed = item.text.trim();
    if (!trimmed || seen.has(trimmed)) {
      return false;
    }
    seen.add(trimmed);
    return true;
  });
};

const reorderName = (name: string): string => {
  if (!name) return ''; // if director or cast name is missing
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name; // can't reorder if there's only one name

  const lastName = parts.pop(); // assume last word is the last name
  const firstAndMiddle = parts.join(' ');
  return `${lastName}, ${firstAndMiddle}`;
};

const seperateAticle = (akaTitle: string, languageCode: string) => {
  const articles = languageArticles[languageCode.toLowerCase()] || [];
  const lowerTitle = akaTitle.trim().toLowerCase();

  for (const article of articles) {
    if (lowerTitle.startsWith(article + ' ')) {
      return {
        article,
        title: akaTitle.slice(article.length).trimStart(),
      };
    }
    // Handle cases like "L'amour" in French
    if (article.endsWith("'") && lowerTitle.startsWith(article)) {
      return {
        article,
        title: akaTitle.slice(article.length).trimStart(),
      };
    }
  }

  return { article: '', title: akaTitle };
};

const searchIMDB = async (
  query: string,
  type: productionType,
  sessionId: string
): Promise<IMDBSearchResult[]> => {
  const options = {
    method: 'GET',
    url: `${
      import.meta.env.VITE_REQUEST_URL
    }/api/external/imdbMain/api/autocomplete`,
    params: { q: query },
    headers: { 'x-session-id': sessionId },
  };

  const results: ApiTitleSearchResponse = await axios.request(options);

  const responseData: IMDBSearchResult[] = results.data.d
    .map((result) => ({
      id: result.id,
      title: result.l,
      year: result.y || 'Unknown',
      type: result.qid || result.q,
      poster: result.i?.imageUrl || PosterPlaceHolder,
      stars: result.s,
    }))
    .filter((result) => !result.id.includes('nm')); // Remove people from title search results

  // Filter by type if specified
  if (type !== 'all') {
    return responseData.filter((result) => result.type === type);
  }

  return responseData;
};

const getProductionDetails = async (
  production: IMDBSearchResult,
  sessionId: string
): Promise<IMDBProduction> => {
  const productionDetailOptions = {
    method: 'GET',
    url: `${
      import.meta.env.VITE_REQUEST_URL
    }/api/external/imdbDetails/api/imdb/${production.id}`,
    headers: { 'x-session-id': sessionId },
  };

  const results: ApiProductionDetails = await axios.request(
    productionDetailOptions
  );

  const productionDetails: IMDBProduction = {
    id: results.data.id,
    title: results.data.originalTitle,
    imdbCode: results.data.id ?? production.id,
    type: results.data.type,
    language: results.data.spokenLanguages[0]?.toUpperCase(),
    originCountry: results.data.countriesOfOrigin[0] ?? '',
    productionCompanies:
      results.data.productionCompanies.length > 0
        ? results.data.productionCompanies
            .slice(0, Math.min(6, results.data.productionCompanies.length))
            .map((item) => item.name)
        : ['None Found'],
    releaseYear: results.data.startYear || production.year || 0,
    actors:
      results.data.cast
        .slice(0, Math.min(4, results.data.cast.length))
        .map((item) => reorderName(item.fullName)) || 'None Found',
    director: reorderName(results.data.directors[0]?.fullName) || 'None Found',
    plot: results.data.description || 'No description.',
    rating: results.data.averageRating || 0,
    poster: results.data.primaryImage || production.poster || PosterPlaceHolder,
  };
  if (!productionDetails) {
    throw new Error('Production not found');
  }
  return productionDetails;
};

const getAkas = async (
  result: IMDBSearchResult,
  sessionId: string
): Promise<AKATitle[]> => {
  const productionAkaOptions = {
    method: 'GET',
    url: `${
      import.meta.env.VITE_REQUEST_URL
    }/api/external/imdbMain/api/title/get-akas`,
    params: {
      tt: result.id,
      limit: '30',
    },
    headers: { 'x-session-id': sessionId },
  };

  const akaResults: ApiAkaResponse = await axios.request(productionAkaOptions);

  // isolate aka title strings and remove duplicates
  const akaTitles = akaResults.data.data.title.akas.edges.map(
    (edge: AkaEdge) => ({
      text: edge.node.displayableProperty.value.plainText,
    })
  );
  const uniqueAkaTitles = uniqueByTitle(akaTitles);

  if (uniqueAkaTitles.length === 0) {
    return [];
  }

  const akaTitleLanguageDetails: LanguageDetectionResponse = await axios.post(
    `${
      import.meta.env.VITE_REQUEST_URL
    }/api/external/langDetect/detect-language-batch`,
    {
      texts: uniqueAkaTitles,
    },
    {
      headers: {
        'x-session-id': sessionId,
      },
    }
  );

  const akas: AKATitle[] = akaTitleLanguageDetails.data.map(
    (item: DetectedLanguage) => {
      const akaTitle = item.detected_text;
      const languageCode = item.language_code;
      const { article, title } = seperateAticle(akaTitle, languageCode);
      const transliteratedTitle = transliterate(title);
      const type = languageCode === 'en' ? 'AT' : 'TT';
      return {
        title: akaTitle,
        transliterated: transliteratedTitle.toUpperCase(),
        article: article.toUpperCase(),
        language: languageCode.toUpperCase(),
        type: type,
      };
    }
  );

  if (!akas) {
    throw new Error('Error fetching AKAs');
  }

  return akas;
};

export { getAkas, getProductionDetails, searchIMDB };
