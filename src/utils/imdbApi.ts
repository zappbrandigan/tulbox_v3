import { IMDBProduction, IMDBSearchResult, productionType, ApiTitleSearchResponse, ApiProductionDetails, ApiAkaResponse, AkaEdge, DetectedLanguage, LanguageDetectionResponse, AKATitle } from '../types';
import { transliterate } from 'transliteration';
import PosterPlaceHolder from '../static/imdb.jpg'
import { languageArticles } from './articles';
import axios from 'axios'


const uniqueByTitle = (arr: {text: string}[]): {text: string}[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item.text)) {
      return false;
    }
    seen.add(item.text);
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
        title: akaTitle.slice(article.length).trimStart()
      };
    }
    // Handle cases like "L'amour" in French
    if (article.endsWith("'") && lowerTitle.startsWith(article)) {
      return {
        article,
        title: akaTitle.slice(article.length).trimStart()
      };
    }
  }

  return { article: '', title: akaTitle };
};


export const searchIMDB = async (query: string, type: productionType): Promise<IMDBSearchResult[]> => {
  const options = {
    method: 'GET',
    url: 'https://imdb232.p.rapidapi.com/api/autocomplete',
    params: {q: query},
    headers: {
      'x-rapidapi-key': import.meta.env.VITE_API_KEY || process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'imdb232.p.rapidapi.com'
    }
  };

  const results: ApiTitleSearchResponse = await axios.request(options);

  const responseData: IMDBSearchResult[] = results.data.d
    .map(result => ({
      id: result.id,
      title: result.l,
      year: result.y || 'Unknown',
      type: result.qid || result.q,
      poster: result.i?.imageUrl || PosterPlaceHolder
    }))
    .filter(result => !result.id.includes('nm')); // Remove people from title search results

  // Filter by type if specified
  if (type !== 'all') {
    return responseData.filter(result => result.type === type);
  }
  
  return responseData;
};

export const getProductionDetails = async (result: IMDBSearchResult): Promise<IMDBProduction> => {
  const productionDetailOptions = {
    method: 'GET',
      url: `https://imdb236.p.rapidapi.com/api/imdb/${result.id}`,
      headers: {
        'x-rapidapi-key': import.meta.env.VITE_API_KEY || process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'imdb236.p.rapidapi.com'
      }
  };

  const results: ApiProductionDetails = await axios.request(productionDetailOptions);

  const productionDetails: IMDBProduction = {
    id: results.data.id,
    title: results.data.originalTitle,
    imdbCode: results.data.id,
    type: results.data.type,
    language: results.data.spokenLanguages[0]?.toUpperCase(),
    productionCompanies: results.data.productionCompanies.length > 0
      ?
      results.data.productionCompanies 
        .slice(0, Math.min(6, results.data.productionCompanies.length))
        .map(item => item.name) 
      :
      ['None Found'],
    releaseYear: results.data.startYear || 0,
    actors: results.data.cast
      .slice(0, Math.min(4, results.data.cast.length))
      .map(item => reorderName(item.fullName)) || 'None Found',
    director: reorderName(results.data.directors[0]?.fullName) || 'None Found',
    plot: results.data.description || 'No description.',
    rating: results.data.averageRating || 0,
    poster: results.data.primaryImage || PosterPlaceHolder,
  };
  if (!productionDetails) {
    throw new Error('Production not found');
  }
  return productionDetails;
};

export const getAkas = async (result: IMDBSearchResult): Promise<AKATitle[]> => {
  const productionAkaOptions = {
    method: 'GET',
    url: 'https://imdb232.p.rapidapi.com/api/title/get-akas',
    params: {
      tt: result.id,
      limit: '30'
    },
    headers: {
      'x-rapidapi-key': import.meta.env.VITE_API_KEY || process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'imdb232.p.rapidapi.com'
    }
  };

  const akaResults: ApiAkaResponse = await axios.request(productionAkaOptions);

    // isolate aka title strings and remove duplicates
  const akaTitles = akaResults
    .data.data.title.akas.edges.map((edge: AkaEdge) => ({
      text: edge.node.displayableProperty.value.plainText
    }));
  const uniqueAkaTitles = uniqueByTitle(akaTitles);

  const akaTitleLanguageDetails: LanguageDetectionResponse = await axios.post(
    'https://lang-detect-memr.onrender.com/detect-language-batch',
    {
      texts: uniqueAkaTitles
    }
  )

  const akas: AKATitle[] = akaTitleLanguageDetails.data.map((item: DetectedLanguage) => {
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
      type: type
    }
  });
  
  if (!akas) {
    throw new Error('Error fetching AKAs');
  }

  return akas;
};