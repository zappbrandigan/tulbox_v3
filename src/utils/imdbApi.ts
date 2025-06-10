import { IMDBProduction, IMDBSearchResult, productionType, ApiTitleSearchResponse, ApiProductionDetails, AKATitle, ApiAkaResponse, AkaEdge } from '../types';
import { transliterate } from 'transliteration';
import PosterPlaceHolder from '../static/imdb.jpg'
import axios from 'axios'
import LanguageDetect from 'languagedetect';

const uniqueByTitle = (arr: AKATitle[]): AKATitle[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item.title)) {
      return false;
    }
    seen.add(item.title);
    return true;
  });
};


export const searchIMDB = async (query: string, type: productionType): Promise<IMDBSearchResult[]> => {
  const options = {
    method: 'GET',
    url: 'https://imdb232.p.rapidapi.com/api/autocomplete',
    params: {q: query},
    headers: {
      'x-rapidapi-key': import.meta.env.VITE_API_KEY,
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
        'x-rapidapi-key': import.meta.env.VITE_API_KEY,
        'x-rapidapi-host': 'imdb236.p.rapidapi.com'
      }
  };
  const productionAkaOptions = {
    method: 'GET',
    url: 'https://imdb232.p.rapidapi.com/api/title/get-akas',
    params: {
      tt: result.id,
      limit: '25'
    },
    headers: {
      'x-rapidapi-key': import.meta.env.VITE_API_KEY,
      'x-rapidapi-host': 'imdb232.p.rapidapi.com'
    }
};
  const results: ApiProductionDetails = await axios.request(productionDetailOptions);
  const akaResults: ApiAkaResponse = await axios.request(productionAkaOptions);
  const lngDetector = new LanguageDetect();
  
  const akas: AKATitle[] = akaResults.data.data.title.akas.edges.map((title: AkaEdge) => ({
    title: title.node.displayableProperty.value.plainText,
    language: lngDetector.detect(title.node.displayableProperty.value.plainText)[0][0],
    transliterated: transliterate(title.node.displayableProperty.value.plainText),
    country: title.node.country?.id || 'Unknown'
  }));

  const uniqueAkas = uniqueByTitle(akas); 

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
      .map(item => item.fullName) || 'None',
    director: results.data.directors[0]?.fullName || 'None',
    plot: results.data.description || 'No description.',
    rating: results.data.averageRating || 0,
    poster: results.data.primaryImage || PosterPlaceHolder,
    akaTitle: uniqueAkas
  };
  if (!productionDetails) {
    throw new Error('Production not found');
  }
  return productionDetails;
};