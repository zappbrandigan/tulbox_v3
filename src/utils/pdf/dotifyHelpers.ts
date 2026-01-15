import { FileItem } from '@/types';
import languageArticles from '../imdb/articles';

type DotifyStatus = 'valid' | 'modified' | 'dotified' | 'error';

export const articles = [
  ...languageArticles['en'],
  ...languageArticles['es'],
  ...languageArticles['fr'],
];

export const titleCase = (input: string): string => {
  if (!input) return input;
  const trimmedInput = input.trim();

  return trimmedInput
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;

      const parts = token.split(/([-\u2010-\u2015])/);

      const capPart = (seg: string): string => {
        if (!seg) return seg;

        let s = seg.toLowerCase();

        s = s.replace(
          /^([^A-Za-zÀ-ÖØ-öø-ÿ]*)([A-Za-zÀ-ÖØ-öø-ÿ])/,
          (_, prefix: string, letter: string) =>
            `${prefix}${letter.toUpperCase()}`
        );
        s = s.replace(
          /^([^A-Za-zÀ-ÖØ-öø-ÿ]*[A-Za-zÀ-ÖØ-öø-ÿ])([’'])([A-Za-zÀ-ÖØ-öø-ÿ])/,
          (_, head: string, apo: string, letter: string) =>
            `${head}${apo}${letter.toUpperCase()}`
        );
        return s;
      };

      for (let i = 0; i < parts.length; i++) {
        if (!/^[-\u2010-\u2015]$/.test(parts[i])) {
          parts[i] = capPart(parts[i]);
        }
      }
      return parts.join('');
    })
    .join('');
};

export const removeExtension = (title: string) => {
  const posFileExtension = title.search(/(\.pdf)$/i);
  return posFileExtension !== -1 ? title.substring(0, posFileExtension) : title;
};

export const formatEpNumToken = (
  epNum: string,
  status: DotifyStatus
): [string, DotifyStatus] => {
  const trimmed = epNum.trim();

  const match = trimmed.match(/^(ep\.?\s*no\.?)\s*(.+)$/i);

  if (match) {
    const remainder = match[2].trimStart();
    const normalized = `Ep No. ${remainder}`;
    if (normalized === trimmed) {
      return [trimmed, status];
    }
    return [normalized, 'modified'];
  }

  return [epNum, status];
};

export const removeAmp = (
  title: string,
  currentStatus: DotifyStatus
): [string, DotifyStatus] => {
  let status: FileItem['status'] = currentStatus;
  let epNumber = title;
  if (epNumber.search('&') !== -1) {
    epNumber = epNumber.replace('&', '-');
    status = 'modified';
  }
  return [epNumber, status];
};

export const capitalizeAB = (
  title: string,
  currentStatus: DotifyStatus
): [string, DotifyStatus] => {
  let result = null;
  let status: FileItem['status'] = currentStatus;
  const epNumber = title;
  const re = /\d+(a)|\d+(b)/g;
  const matches = epNumber.match(re);
  if (matches) {
    status = 'modified';
    const lastOcc = matches[matches.length - 1];
    const remIndex = epNumber.search(lastOcc) + lastOcc.length + 1;
    result = matches.map((part) => part.toUpperCase());
    const newNumber = `Ep No. ${result.join(' - ')} ${epNumber.substring(
      remIndex
    )}`.trim();
    return [newNumber, status];
  }
  return [epNumber, status];
};
