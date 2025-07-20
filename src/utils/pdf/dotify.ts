import {
  articles,
  removeExtension,
  removeAmp,
  capitalizeAB,
  formatEpNumToken,
  titleCase,
} from './dotifyHelpers';

export interface TitleParts {
  prodTitle: string;
  epTitle?: string | null;
  epNum: string;
}

export type DotifyStatus = 'valid' | 'modified' | 'dotified' | 'error';

export interface DotifyResult {
  title: string;
  status: DotifyStatus;
}

function parseTokens(
  input: string,
  hasEpisodeTitle: boolean
): TitleParts | null {
  try {
    const [prod, rest] = input.split('   ');
    if (!prod || !rest) return null;

    if (hasEpisodeTitle) {
      const [ep, num] = rest.split('  ');
      if (!ep || !num) return null;
      return { prodTitle: prod, epTitle: ep, epNum: num };
    }

    return { prodTitle: prod, epNum: rest };
  } catch {
    return null;
  }
}

function normalizeParts(
  parts: TitleParts,
  track: (s: DotifyStatus | null) => void
): TitleParts {
  let { prodTitle, epTitle, epNum } = parts;

  const trim = (s: string | null | undefined): string | null | undefined => {
    if (s === null) return null;
    if (s === undefined) return undefined;
    return s.trim();
  };

  const newProd = trim(prodTitle);
  const newEp = trim(epTitle);
  const newNum = trim(epNum);

  if (newProd !== prodTitle || newEp !== epTitle || newNum !== epNum) {
    track('modified');
  }
  console.log(newEp, epTitle);

  prodTitle = newProd!;
  epTitle = newEp;
  epNum = newNum!;

  prodTitle = moveArticle(prodTitle, track);
  if (epTitle) epTitle = moveArticle(epTitle, track);

  let resultStatus: DotifyStatus;

  [epNum, resultStatus] = formatEpNumToken(epNum, 'valid');
  if (resultStatus === 'modified') track('modified');

  [epNum, resultStatus] = removeAmp(epNum, 'valid');
  if (resultStatus === 'modified') track('modified');

  [epNum, resultStatus] = capitalizeAB(epNum, 'valid');
  if (resultStatus === 'modified') track('modified');

  return { prodTitle, epTitle, epNum };
}

function moveArticle(
  title: string,
  track: (s: DotifyStatus | null) => void
): string {
  const matchedArticle = articles.find((a) =>
    title.toLowerCase().startsWith(`${a.toLowerCase()}${a === "l'" ? '' : ' '}`)
  );

  if (!matchedArticle) return title;

  const prefixLength =
    matchedArticle === "l'" ? matchedArticle.length : matchedArticle.length + 1;

  const originalArticle = title.substring(0, prefixLength);
  const remainder = title.substring(prefixLength).trim();

  const newTitle = `${remainder}, ${originalArticle.trim()}`;
  if (newTitle !== title) track('modified');
  return `${remainder}, ${originalArticle.trim()}`;
}

function sanitizeDotification(
  parts: TitleParts,
  track: (s: DotifyStatus | null) => void
): TitleParts {
  const dotVariants = [
    /\.{3,}/g, // "..."
    /\s?\.\s?\.\s?\./g, // " . . ." or " . . ." or even ". . ."
  ];

  const clean = (text: string) =>
    dotVariants.reduce((acc, rx) => acc.replace(rx, '. . .'), text);

  const { prodTitle, epTitle, epNum } = parts;

  const cleanedProd = clean(prodTitle);
  const cleanedEp = epTitle ? clean(epTitle) : epTitle;

  if (cleanedProd !== prodTitle || cleanedEp !== epTitle) {
    track('modified');
  }

  return {
    prodTitle: cleanedProd,
    epTitle: cleanedEp,
    epNum,
  };
}

function getFullTitleLength(
  parts: TitleParts,
  options: { addDotsToProd?: boolean; addDotsToEp?: boolean } = {}
): number {
  const prod = parts.prodTitle.trim();
  const ep = parts.epTitle?.trim() ?? '';
  const num = parts.epNum.trim();

  const prodDotPad = options.addDotsToProd && !prod.endsWith('. . .') ? 5 : 0;
  const epDotPad = options.addDotsToEp && !ep.endsWith('. . .') ? 5 : 0;

  const baseLength = prod.length + prodDotPad + 3 + num.length;

  return parts.epTitle
    ? baseLength + ep.length + epDotPad + 2 // +2 for ep/num separator
    : baseLength;
}

function removeTrailingPunct(s: string): string {
  const trailing = [',', '.', "'", '!'];
  while (trailing.includes(s.at(-1)!)) {
    s = s.slice(0, -1).trimEnd();
  }
  return s;
}

function dotifyIfOverflow(parts: TitleParts): TitleParts {
  const maxLength = 60;
  let { prodTitle, epTitle } = parts;
  const { epNum } = parts;

  let epTruncated = false;
  let prodTruncated = false;

  while (
    getFullTitleLength(
      { prodTitle, epTitle, epNum },
      {
        addDotsToEp: epTruncated,
        addDotsToProd: !epTitle || prodTruncated,
      }
    ) > maxLength
  ) {
    if (epTitle && epTitle.length > 3) {
      epTitle = epTitle.slice(0, -1).trimEnd();
      epTruncated = true;
    } else {
      prodTitle = prodTitle.slice(0, -1).trimEnd();
      prodTruncated = true;
    }
  }
  if (epTruncated && epTitle && !epTitle.endsWith('. . .')) {
    epTitle = removeTrailingPunct(epTitle).trimEnd() + '. . .';
  }
  if (prodTruncated && !prodTitle.endsWith('. . .')) {
    prodTitle = removeTrailingPunct(prodTitle).trimEnd() + '. . .';
  }

  return {
    prodTitle: prodTitle.trim(),
    epTitle: epTitle?.trim(),
    epNum,
  };
}

function buildTitle({ prodTitle, epTitle, epNum }: TitleParts): string {
  return epTitle
    ? `${prodTitle.toUpperCase()}   ${titleCase(epTitle)}  ${epNum}`
    : `${prodTitle.toUpperCase()}   ${epNum}`;
}

function dotifyTitleGeneric(
  title: string,
  hasEpisodeTitle: boolean
): DotifyResult {
  const cleanTitle = removeExtension(title);
  let status: DotifyStatus = 'valid';

  const parts = parseTokens(cleanTitle, hasEpisodeTitle);
  if (!parts) return { title, status: 'error' };

  const normalized = normalizeParts(parts, (s) => (status = s ?? status));
  const sanitized = sanitizeDotification(
    normalized,
    (s) => (status = s ?? status)
  );
  let finalParts = sanitized;

  if (getFullTitleLength(finalParts) > 60) {
    finalParts = dotifyIfOverflow(sanitized);
    status = 'dotified';
  }

  const finalTitle = buildTitle(finalParts);

  return { title: finalTitle, status };
}

export default dotifyTitleGeneric;

export const __test__ = {
  parseTokens,
  normalizeParts,
  moveArticle,
  sanitizeDotification,
  getFullTitleLength,
  removeTrailingPunct,
  dotifyIfOverflow,
  buildTitle,
};
