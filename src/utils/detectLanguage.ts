import { LanguageIdentifier, loadModule } from 'cld3-asm';

const cldFactory = await loadModule();

export async function detectLanguageCode(text: string): Promise<string> {

  const detector: LanguageIdentifier = cldFactory.create(0, 1000);
  const result = detector.findLanguage(text);
  if (result && result.language !== 'und' && result.probability > 0.5) {
    detector.dispose();
    if (result.language == 'gl') {
      return 'PT'; // trouble detecting this language
    }
    return result.language; // returns ISO 639-1 code like "en", "fr"
  }

  return 'unknown';
}
