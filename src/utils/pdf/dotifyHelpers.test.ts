import {
  titleCase,
  removeExtension,
  formatEpNumToken,
  removeAmp,
  capitalizeAB,
} from './dotifyHelpers';
import { describe, it, expect } from 'vitest';

describe('dotifyHelpers', () => {
  describe('titleCase', () => {
    it('returns empty strings as empty strings', () => {
      expect(titleCase('')).toBe('');
    });

    it('capitalizes a normal title', () => {
      expect(titleCase('this is a title')).toBe('This Is A Title');
    });

    it('capitalizes even if already uppercase', () => {
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('handles single-word titles', () => {
      expect(titleCase('something')).toBe('Something');
    });

    it('capitalizes first and last small words', () => {
      expect(titleCase('to kill a mockingbird')).toBe('To Kill A Mockingbird');
    });

    it('does not capitalize small words unless at start or end', () => {
      expect(titleCase('a clash of kings')).toBe('A Clash Of Kings');
      expect(titleCase('game of thrones')).toBe('Game Of Thrones');
    });

    it('preserves spacing between words (normalized)', () => {
      expect(titleCase('  the   long  night  ')).toBe('The   Long  Night');
    });

    it('handles punctuation in words', () => {
      expect(titleCase("o'clock special")).toBe("O'Clock Special");
      expect(titleCase("john's tale of war")).toBe("John's Tale Of War");
    });

    it('handles accented characters and unicode', () => {
      expect(titleCase("eleve et l'ecole")).toBe("Eleve Et L'Ecole");
    });

    it('handles small words in various positions', () => {
      expect(titleCase('the rise and fall of nations')).toBe(
        'The Rise And Fall Of Nations'
      );
      expect(titleCase('the rise and the fall of nations')).toBe(
        'The Rise And The Fall Of Nations'
      );
      expect(titleCase("the rise and the don't of nations")).toBe(
        "The Rise And The Don't Of Nations"
      );
    });
  });

  describe('removeExtension', () => {
    describe('removeExtension', () => {
      it('removes .pdf extension from the end', () => {
        expect(removeExtension('My Title.pdf')).toBe('My Title');
      });

      it('removes .PDF extension case-insensitively', () => {
        expect(removeExtension('Episode.PDF')).toBe('Episode');
      });

      it('does not remove .pdf in the middle of the title', () => {
        expect(removeExtension('not.a.pdf.title.txt')).toBe(
          'not.a.pdf.title.txt'
        );
      });

      it('does not remove .pdf if not at the end', () => {
        expect(removeExtension('file.pdf_backup')).toBe('file.pdf_backup');
      });

      it('leaves titles without extensions unchanged', () => {
        expect(removeExtension('Title Without Extension')).toBe(
          'Title Without Extension'
        );
      });

      it('leaves other extensions unchanged', () => {
        expect(removeExtension('Presentation.ppt')).toBe('Presentation.ppt');
      });

      it('removes .pdf even with whitespace before extension', () => {
        expect(removeExtension('My File .PDF')).toBe('My File ');
      });
    });
  });

  describe('formatEpNumToken', () => {
    it('returns the input unchanged if already normalized', () => {
      const [result, status] = formatEpNumToken('Ep No. 5', 'valid');
      expect(result).toBe('Ep No. 5');
      expect(status).toBe('valid');
    });

    it('fixes missing space after Ep No.', () => {
      const [result, status] = formatEpNumToken('Ep No.5', 'valid');
      expect(result).toBe('Ep No. 5');
      expect(status).toBe('modified');
    });

    it('fixes lowercase ep no with no space', () => {
      const [result, status] = formatEpNumToken('epno1', 'valid');
      expect(result).toBe('Ep No. 1');
      expect(status).toBe('modified');
    });

    it('fixes spacing and punctuation variations', () => {
      const [result, status] = formatEpNumToken('ep. no. 42', 'valid');
      expect(result).toBe('Ep No. 42');
      expect(status).toBe('modified');
    });

    it('fixes multiple spaces between ep and no', () => {
      const [result, status] = formatEpNumToken('Ep.     No.     99', 'valid');
      expect(result).toBe('Ep No. 99');
      expect(status).toBe('modified');
    });

    it('is case insensitive', () => {
      const [result, status] = formatEpNumToken('EP NO 100', 'valid');
      expect(result).toBe('Ep No. 100');
      expect(status).toBe('modified');
    });

    it('leaves unmatched strings unchanged', () => {
      const [result, status] = formatEpNumToken('Season 3', 'valid');
      expect(result).toBe('Season 3');
      expect(status).toBe('valid');
    });

    it('handles leading/trailing whitespace', () => {
      const [result, status] = formatEpNumToken('  ep no   7  ', 'valid');
      expect(result).toBe('Ep No. 7');
      expect(status).toBe('modified');
    });

    it('preserves extra text after ep number', () => {
      const [result, status] = formatEpNumToken('Ep.No.7b Final Cut', 'valid');
      expect(result).toBe('Ep No. 7b Final Cut');
      expect(status).toBe('modified');
    });
  });

  describe('removeAmp', () => {
    it('returns the original string if no ampersand is present', () => {
      const [result, status] = removeAmp('Ep No. 3', 'valid');
      expect(result).toBe('Ep No. 3');
      expect(status).toBe('valid');
    });

    it('replaces a single ampersand with a dash', () => {
      const [result, status] = removeAmp('Ep No. 3 & 4', 'valid');
      expect(result).toBe('Ep No. 3 - 4');
      expect(status).toBe('modified');
    });

    it('only replaces the first ampersand', () => {
      const [result, status] = removeAmp('Ep No. 3 & 4 & 5', 'valid');
      expect(result).toBe('Ep No. 3 - 4 & 5');
      expect(status).toBe('modified');
    });

    it('updates status even if already marked as modified', () => {
      const [result, status] = removeAmp('3 & 4', 'modified');
      expect(result).toBe('3 - 4');
      expect(status).toBe('modified');
    });

    it('leaves leading/trailing whitespace untouched', () => {
      const [result, status] = removeAmp(' 3 & 4 ', 'valid');
      expect(result).toBe(' 3 - 4 ');
      expect(status).toBe('modified');
    });
  });

  describe('capitalizeAB', () => {
    it('returns the input unchanged if there is no a/b suffix', () => {
      const [result, status] = capitalizeAB('Ep No. 105', 'valid');
      expect(result).toBe('Ep No. 105');
      expect(status).toBe('valid');
    });

    it('capitalizes a single a suffix', () => {
      const [result, status] = capitalizeAB('101a', 'valid');
      expect(result).toBe('Ep No. 101A');
      expect(status).toBe('modified');
    });

    it('capitalizes a single b suffix', () => {
      const [result, status] = capitalizeAB('102b', 'valid');
      expect(result).toBe('Ep No. 102B');
      expect(status).toBe('modified');
    });

    it('capitalizes both a and b suffixes and joins them with a dash', () => {
      const [result, status] = capitalizeAB('101a102b', 'valid');
      expect(result).toBe('Ep No. 101A - 102B');
      expect(status).toBe('modified');
    });

    it('capitalizes multiple suffixes and preserves trailing content', () => {
      const [result, status] = capitalizeAB('103a104b final cut', 'valid');
      expect(result).toBe('Ep No. 103A - 104B final cut');
      expect(status).toBe('modified');
    });

    it('updates status even if already modified', () => {
      const [result, status] = capitalizeAB('Ep No. 100a', 'modified');
      expect(result).toBe('Ep No. 100A');
      expect(status).toBe('modified');
    });

    it('handles spacing and trimming correctly', () => {
      const [result, status] = capitalizeAB(' 105a106b  ', 'valid');
      expect(result).toBe('Ep No. 105A - 106B');
      expect(status).toBe('modified');
    });
  });
});
