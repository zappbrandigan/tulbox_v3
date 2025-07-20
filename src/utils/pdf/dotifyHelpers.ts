import { FileItem } from '@/types';
import languageArticles from '../imdb/articles';

type DotifyStatus = 'valid' | 'modified' | 'dotified' | 'error';

const SMALL_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'nor',
  'for',
  'so',
  'yet',
  'at',
  'around',
  'by',
  'after',
  'along',
  'for',
  'from',
  'of',
  'on',
  'to',
  'with',
  'without',
  'in',
  'over',
  'under',
]);

export const articles = [
  ...languageArticles['en'],
  ...languageArticles['es'],
  ...languageArticles['fr'],
];

export const titleCase = (input: string): string => {
  const words = input.trim().split(/\s+/);
  const len = words.length;

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();

      const isFirstOrLast = index === 0 || index === len - 1;
      const needsCap = isFirstOrLast || !SMALL_WORDS.has(lower);

      return needsCap ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(' ');
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
