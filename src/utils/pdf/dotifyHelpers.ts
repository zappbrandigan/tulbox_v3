import { FileItem } from '@/types';
import languageArticles from '../imdb/articles';

export const articles = [
  ...languageArticles['en'],
  ...languageArticles['es'],
  ...languageArticles['fr'],
];

export const titleCase = (title: string): string => {
  const titleWords = title.toLowerCase().split(' ');
  const newTitle = titleWords.map(
    (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return newTitle.join(' ');
};

export const removeExtension = (title: string) => {
  const posFileExtension = title.search(/(\.pdf)$/i);
  return posFileExtension !== -1 ? title.substring(0, posFileExtension) : title;
};

export const removeAmp = (
  title: string,
  currentStatus: FileItem['status']
): [string, FileItem['status']] => {
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
  currentStatus: FileItem['status']
): [string, FileItem['status']] => {
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
