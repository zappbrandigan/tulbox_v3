import { describe, it, expect, vi } from 'vitest';
import dotifyTitleGeneric, { TitleParts } from './dotify';
import { __test__ } from './dotify';
const {
  parseTokens,
  normalizeParts,
  moveArticle,
  sanitizeDotification,
  getFullTitleLength,
} = __test__;

describe('dotifyTitleGeneric', () => {
  const run = (input: string, hasEp: boolean) =>
    dotifyTitleGeneric(input, hasEp);

  it('returns error status on invalid format', () => {
    let result = run('INVALID TITLE', true);
    expect(result.status).toBe('error');

    result = run('INVALID  DELIMITER  Ep No. 1', true);
    expect(result.status).toBe('error');
  });

  it('cleans up extra whitespace', () => {
    const input = ' The Witcher   The End Begins  Ep No. 1 ';
    const { title, status } = run(input, true);
    expect(title).toBe('WITCHER, THE   End Begins, The  Ep No. 1');
    expect(status).toBe('modified');
  });

  it('ensures space between Ep No. and what follows', () => {
    const input = 'Witcher   End Begins  Ep No.1';
    const { title, status } = run(input, true);
    expect(title).toBe('WITCHER   End Begins  Ep No. 1');
    expect(status).toBe('modified');
  });

  it('leaves valid Ep No. unchages', () => {
    const input = 'WITCHER   End Begins  Ep No. 1';
    const { title, status } = run(input, true);
    expect(title).toBe('WITCHER   End Begins  Ep No. 1');
    expect(status).toBe('valid');
  });

  it('moves leading articles in both titles', () => {
    const input = ' The Fall   An End of Something  Ep No. 2';
    const { title } = run(input, true);
    expect(title).toBe('FALL, THE   End Of Something, An  Ep No. 2');
  });

  it('normalizes malformed ellipses in ep title', () => {
    const input = 'Weird Show   Cliffhanger....  Ep No. 3';
    const { title, status } = run(input, true);
    expect(title).toBe('WEIRD SHOW   Cliffhanger. . .  Ep No. 3');
    expect(status).toBe('modified');
  });

  it('normalizes malformed ellipses in prod title', () => {
    const input = 'My Show...   Finale  Ep No. 4';
    const { title, status } = run(input, true);
    expect(title).toBe('MY SHOW. . .   Finale  Ep No. 4');
    expect(status).toBe('modified');
  });

  it('dotifies ep title when total length exceeds 60', () => {
    const input =
      'The Series That Would Never End   The Episode Title That Is Way Too Long  Ep No. 123';
    const { title, status } = run(input, true);
    expect(status).toBe('dotified');
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toBe(
      'SERIES THAT WOULD NEVER END, THE   Episode. . .  Ep No. 123'
    ); // should end with ellipses
  });

  it('dotifies prod title if ep title is already minimal', () => {
    const input =
      'Extremely Long Production Title That Must Be Trimmed   End  Ep No. 10';
    const { title, status } = run(input, true);
    expect(status).toBe('dotified');
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).contains('. . .');
  });

  it('handles titles with no episode title (hasEp = false)', () => {
    const input =
      'A Really Really Long Production Title Without Episode   Ep No. 999999';
    const { title, status } = run(input, false);
    expect(title).toBe(
      'REALLY REALLY LONG PRODUCTION TITLE WIT. . .   Ep No. 999999'
    );
    expect(status).toBe('dotified');
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('handles titles with no episode title and no changes', () => {
    const input = '50, THE   Ep No. 9999';
    const { title, status } = run(input, false);
    expect(title).toBe('50, THE   Ep No. 9999');
    expect(status).toBe('valid');
  });

  it('preserves correct spacing and format when no changes needed', () => {
    const input = 'DARK, THE   The Cave  Ep No. 7';
    const { title, status } = run(input, true);
    expect(title).toBe('DARK, THE   Cave, The  Ep No. 7');
    expect(status).toBe('modified');
  });

  it('ensures spacing after "Ep No."', () => {
    const input = 'OZARK   The Plan  Ep No.7';
    const { title, status } = run(input, true);
    expect(title).toBe('OZARK   Plan, The  Ep No. 7');
    expect(status).toBe('modified');
  });

  it('fixes incorrect ellipsis with no spacing', () => {
    const input = 'Legendary Tales...   Chapter One  Ep No. 1';
    const { title, status } = run(input, true);
    expect(title).toBe('LEGENDARY TALES. . .   Chapter One  Ep No. 1');
    expect(status).toBe('modified');
  });

  it('leaves status as valid if not changes necessary with episode title', () => {
    const input =
      'LEGENDARY TALES   Chapter One of the thing i, here and here  Ep No. 1';
    const { title, status } = run(input, true);
    expect(title).toBe(
      'LEGENDARY TALES   Chapter One Of The Thing I. . .  Ep No. 1'
    );
    expect(status).toBe('dotified');
  });

  it('removes extra symbols before . . .', () => {
    const input = 'LEGENDARY TALES   Chapter One  Ep No. 1';
    const { title, status } = run(input, true);
    expect(title).toBe('LEGENDARY TALES   Chapter One  Ep No. 1');
    expect(status).toBe('valid');
  });
});

describe('parseTokens', () => {
  it('parses a full title with episode title', () => {
    const input = 'MY SHOW   Episode Title  Ep No. 123';
    const result = parseTokens(input, true);
    expect(result).toEqual({
      prodTitle: 'MY SHOW',
      epTitle: 'Episode Title',
      epNum: 'Ep No. 123',
    });
  });

  it('parses a title without episode title', () => {
    const input = 'MY SHOW   Ep No. 123';
    const result = parseTokens(input, false);
    expect(result).toEqual({
      prodTitle: 'MY SHOW',
      epNum: 'Ep No. 123',
    });
  });

  it('returns null if triple-space delimiter is missing', () => {
    const input = 'MY SHOW Ep No. 123';
    const result = parseTokens(input, false);
    expect(result).toBeNull();
  });

  it('returns null if double-space delimiter is missing when ep title is expected', () => {
    const input = 'MY SHOW   JustOneChunk';
    const result = parseTokens(input, true);
    expect(result).toBeNull();
  });

  it('returns null if episode or number is missing when ep title is expected', () => {
    const input = 'MY SHOW   Episode Only';
    const result = parseTokens(input, true);
    expect(result).toBeNull();
  });

  it('returns null if production or remainder is missing', () => {
    expect(parseTokens('   Ep No. 123', false)).toBeNull();
    expect(parseTokens('MY SHOW   ', false)).toBeNull();
  });
});

describe('normalizeParts', () => {
  it('trims whitespace and returns modified', () => {
    const parts = {
      prodTitle: '  THE SHOW  ',
      epTitle: '  the ep title  ',
      epNum: '  ep no. 123  ',
    };
    const track = vi.fn();

    const result = normalizeParts(parts, track);

    expect(result).toEqual({
      prodTitle: 'SHOW, THE',
      epTitle: 'Ep Title, The',
      epNum: 'Ep No. 123',
    });

    expect(track).toHaveBeenCalledWith('modified');
  });

  it('does not modify already clean values', () => {
    const parts = {
      prodTitle: 'SHOW, THE',
      epTitle: 'Ep, A',
      epNum: 'Ep No. 123',
    };
    const track = vi.fn();

    const result = normalizeParts(parts, track);

    expect(result).toEqual(parts);
    expect(track).not.toHaveBeenCalled();
  });

  it('removes & from epNum and capitalizes trailing a/b', () => {
    const parts = {
      prodTitle: 'My Show',
      epTitle: 'An Episode',
      epNum: 'ep no. 101a & 101b',
    };
    const track = vi.fn();

    const result = normalizeParts(parts, track);

    expect(result.epNum).toBe('Ep No. 101A - 101B');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('handles case where epTitle is null', () => {
    const parts = {
      prodTitle: 'THE SHOW',
      epTitle: null,
      epNum: 'Ep No. 456',
    };
    const track = vi.fn();

    const result = normalizeParts(parts, track);

    expect(result).toEqual({
      prodTitle: 'SHOW, THE',
      epTitle: null,
      epNum: 'Ep No. 456',
    });

    expect(track).toHaveBeenCalledWith('modified');
  });

  it('does not throw if epTitle is undefined', () => {
    const parts = {
      prodTitle: 'THE SHOW',
      epTitle: undefined,
      epNum: 'Ep No. 789',
    };
    const track = vi.fn();

    const result = normalizeParts(parts, track);

    expect(result).toEqual({
      prodTitle: 'SHOW, THE',
      epTitle: undefined,
      epNum: 'Ep No. 789',
    });

    expect(track).toHaveBeenCalledWith('modified');
  });
});

describe('moveArticle', () => {
  it('moves a standard English article to the end', () => {
    const track = vi.fn();
    const result = moveArticle('The Office', track);
    expect(result).toBe('Office, The');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it("handles the French-style article 'L'' without extra space", () => {
    const track = vi.fn();
    const result = moveArticle("L'Eleve", track);
    expect(result).toBe("Eleve, L'");
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('returns string unchanged if no article is present', () => {
    const track = vi.fn();
    const result = moveArticle('Breaking Bad', track);
    expect(result).toBe('Breaking Bad');
    expect(track).not.toHaveBeenCalled();
  });

  it('is case-insensitive when matching articles', () => {
    const track = vi.fn();
    const result = moveArticle('a Series of Events', track);
    expect(result).toBe('Series of Events, a');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('trims leading space after article is moved', () => {
    const track = vi.fn();
    const result = moveArticle('An  Adventure', track);
    expect(result).toBe('Adventure, An');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('does not mistakenly match partial words', () => {
    const track = vi.fn();
    const result = moveArticle('Angel in the Morning', track);
    expect(result).toBe('Angel in the Morning');
    expect(track).not.toHaveBeenCalled();
  });

  it('handles single-word article-only titles safely', () => {
    const track = vi.fn();
    const result = moveArticle('The', track);
    expect(result).toBe('The');
    expect(track).not.toHaveBeenCalledWith();
  });
});

describe('sanitizeDotification', () => {
  it('returns titles unchanged if no dot variants are present', () => {
    const parts: TitleParts = {
      prodTitle: 'The Office',
      epTitle: 'Final Day',
      epNum: 'Ep No. 1001',
    };

    const track = vi.fn();
    const result = sanitizeDotification(parts, track);

    expect(result).toEqual(parts);
    expect(track).not.toHaveBeenCalled();
  });

  it('normalizes ... to . . . in prodTitle', () => {
    const parts: TitleParts = {
      prodTitle: 'The Office...',
      epTitle: 'Final Day',
      epNum: 'Ep No. 1001',
    };

    const track = vi.fn();
    const result = sanitizeDotification(parts, track);

    expect(result.prodTitle).toBe('The Office. . .');
    expect(result.epTitle).toBe('Final Day');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('normalizes "...", " . . ." and other spacing issues in epTitle', () => {
    const parts: TitleParts = {
      prodTitle: 'The Office',
      epTitle: 'Final . . .Day',
      epNum: 'Ep No. 1001',
    };

    const track = vi.fn();
    const result = sanitizeDotification(parts, track);

    expect(result.epTitle).toContain('. . .');
    expect(result.epTitle).not.toContain(' . . .');
    expect(result.epTitle).not.toContain('...');
    expect(track).toHaveBeenCalledWith('modified');
  });

  it('handles null epTitle without error', () => {
    const parts: TitleParts = {
      prodTitle: 'Liar...',
      epTitle: null,
      epNum: 'Ep No. 99',
    };

    const track = vi.fn();
    const result = sanitizeDotification(parts, track);

    expect(result.prodTitle).toBe('Liar. . .');
    expect(result.epTitle).toBeNull();
    expect(track).toHaveBeenCalledWith('modified');
  });
});

describe('getFullTitleLength', () => {
  it('returns correct length for a basic title with epTitle', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show',
      epTitle: 'Pilot',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts);
    expect(len).toBe(7 + 3 + 5 + 2 + 8);
  });

  it('returns correct length for a title without epTitle', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts);
    expect(len).toBe(7 + 3 + 8);
  });

  it('adds 5 to prodTitle if addDotsToProd and does not end in . . .', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts, { addDotsToProd: true });
    expect(len).toBe(7 + 3 + 8 + 5);
  });

  it('does not add 5 if prodTitle already ends in . . .', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show. . .',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts, { addDotsToProd: true });
    expect(len).toBe(12 + 3 + 8);
  });

  it('adds 5 to epTitle if addDotsToEp and does not end in . . .', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show',
      epTitle: 'Pilot',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts, { addDotsToEp: true });
    expect(len).toBe(7 + 3 + 5 + 2 + 8 + 5);
  });

  it('does not add 5 to epTitle if it already ends in . . .', () => {
    const parts: TitleParts = {
      prodTitle: 'My Show',
      epTitle: 'Pilot. . .',
      epNum: 'Ep No. 1',
    };

    const len = getFullTitleLength(parts, { addDotsToEp: true });
    expect(len).toBe(7 + 3 + 10 + 2 + 8);
  });

  it('trims surrounding whitespace from all parts', () => {
    const parts: TitleParts = {
      prodTitle: '  My Show  ',
      epTitle: '  Pilot  ',
      epNum: '  Ep No. 1  ',
    };

    const len = getFullTitleLength(parts);
    expect(len).toBe(7 + 3 + 5 + 2 + 8);
  });
});
