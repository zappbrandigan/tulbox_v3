import { FileItem } from '@/types';

const removeExtension = (title: string) => {
  const posFileExtension = title.search(/(\.pdf)$/i);
  return posFileExtension !== -1 ? title.substring(0, posFileExtension) : title;
};

const getTokens = (title: string) => {
  let prodTitle, epNumber;
  try {
    [prodTitle, epNumber] = title.split('   '); // three spaces
    if (!prodTitle || !epNumber) throw TypeError; // if a token is missing
  } catch {
    throw TypeError;
  }
  return [prodTitle, epNumber];
};

const trimWhiteSpace = (
  prodTitle: string,
  epNumber: string,
  currentStatus: FileItem['status']
): [string, string, FileItem['status']] => {
  let status: FileItem['status'] = currentStatus;
  const newPd = prodTitle.trim();
  const newNum = epNumber.trim();
  if (newPd !== prodTitle || newNum !== epNumber) status = 'modified';
  return [newPd, newNum, status];
};

const moveArticles = (
  prodTitle: string,
  currentStatus: FileItem['status']
): [string, FileItem['status']] => {
  const articles = [
    'El ',
    'Il ',
    'Lo ',
    'La ',
    'Los ',
    'Las ',
    "L'",
    'The ',
    'An ',
    'A ',
    'Un ',
    'Una ',
  ];
  let art = null;
  let status: FileItem['status'] = currentStatus;

  art = articles.filter((art) =>
    prodTitle.toLowerCase().startsWith(art.toLowerCase())
  );
  prodTitle = art.length
    ? `${prodTitle.substring(art[0].length)}, ${art[0].toUpperCase().trim()}`
    : prodTitle;

  status = art.length > 0 ? 'modified' : currentStatus;

  return [prodTitle, status];
};

const removeAmp = (
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

const capitalizeAB = (
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

const buildFullTitle = (prodTitle: string, epNumber: string): string => {
  return `${prodTitle.toUpperCase()}   ${epNumber}`;
};

const dotify = (
  cleanTitle: string,
  prodTitle: string,
  epNumber: string,
  currentStatus: FileItem['status']
): [string, FileItem['status']] => {
  let status: FileItem['status'] = currentStatus;
  const endings = ['.', ',', '!', '?', "'"];
  let dotifyProdTitle = false;
  const stopCount = 55;
  const tokenSize = 3;

  while (prodTitle.length + epNumber.length + tokenSize > stopCount) {
    prodTitle = prodTitle.substring(0, prodTitle.length - 1);
    dotifyProdTitle = true;
  }
  if (endings.includes(prodTitle[prodTitle.length - 1]))
    prodTitle = prodTitle.substring(0, prodTitle.length - 1); // don't end on special char

  prodTitle = prodTitle.trim();

  if (dotifyProdTitle) {
    status = 'dotified';
    prodTitle += '. . .';
  } else {
    status = 'modified';
    return [cleanTitle, status]; // dots in title but not dotified
  }

  const newTitle = buildFullTitle(prodTitle, epNumber);
  return [newTitle, status];
};

const dotifyTitleNoEp = (title: string): [string, FileItem['status']] => {
  let prodTitle, epNumber;
  let status: FileItem['status'] = 'valid';
  let cleanTitle = removeExtension(title);

  try {
    [prodTitle, epNumber] = getTokens(cleanTitle);
  } catch {
    status = 'error';
    return [title, status];
  }

  [prodTitle, epNumber, status] = trimWhiteSpace(prodTitle, epNumber, status);
  [prodTitle, status] = moveArticles(prodTitle, status);
  [epNumber, status] = removeAmp(epNumber, status);
  [epNumber, status] = capitalizeAB(epNumber, status);

  cleanTitle = buildFullTitle(prodTitle, epNumber);

  if (cleanTitle.length > 60 || prodTitle.search(/(\.\.\.)$/) !== -1) {
    return dotify(cleanTitle, prodTitle, epNumber, status);
  } else if (prodTitle.search(/(\s\.\s\.\s\.)$/) !== -1) {
    prodTitle = `${prodTitle.substring(
      0,
      prodTitle.search(/(\s\.\s\.\s\.)$/)
    )}${prodTitle.substring(prodTitle.search(/(\s\.\s\.\s\.)$/) + 1)}`;
    cleanTitle = buildFullTitle(prodTitle, epNumber);
    status = 'modified';
  }
  return [cleanTitle, status];
};

export default dotifyTitleNoEp;
