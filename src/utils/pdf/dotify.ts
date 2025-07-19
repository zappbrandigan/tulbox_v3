import { FileItem } from '@/types';

const titleCase = (title: string): string => {
  const titleWords = title.toLowerCase().split(' ');
  const newTitle = titleWords.map(
    (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return newTitle.join(' ');
};

const removeExtension = (title: string) => {
  const posFileExtension = title.search(/(\.pdf)$/i);
  return posFileExtension !== -1 ? title.substring(0, posFileExtension) : title;
};

const getTokens = (title: string) => {
  let prodTitle, epTitle, epNumber, tokens;
  try {
    [prodTitle, tokens] = title.split('   '); // three spaces
    [epTitle, epNumber] = tokens.split('  '); // two spaces
    if (!prodTitle || !epTitle || !epNumber) throw TypeError; // if a token is missing
  } catch {
    throw TypeError;
  }
  return [prodTitle, epTitle, epNumber];
};

const trimWhiteSpace = (
  prodTitle: string,
  epTitle: string,
  epNumber: string,
  currentStatus: FileItem['status']
): [string, string, string, FileItem['status']] => {
  let status: FileItem['status'] = currentStatus;
  const newPd = prodTitle.trim();
  const newEp = epTitle.trim();
  const newNum = epNumber.trim();
  if (newPd !== prodTitle || newEp !== epTitle || newNum !== epNumber)
    status = 'modified';
  return [newPd, newEp, newNum, status];
};

const moveArticles = (
  prodTitle: string,
  epTitle: string,
  currentStatus: FileItem['status']
): [string, string, FileItem['status']] => {
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

  status = art.length ? 'modified' : currentStatus;

  art = articles.filter((art) =>
    epTitle.toLowerCase().startsWith(art.toLowerCase())
  );
  epTitle = art.length
    ? `${epTitle.substring(art[0].length)}, ${art[0].trim()}`
    : epTitle;

  status = art.length ? 'modified' : status;

  return [prodTitle, epTitle, status];
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

const buildFullTitle = (
  prodTitle: string,
  epTitle: string,
  epNumber: string
): string => {
  return `${prodTitle.toUpperCase()}   ${titleCase(epTitle)}  ${epNumber}`;
};

const dotify = (
  cleanTitle: string,
  prodTitle: string,
  epTitle: string,
  epNumber: string,
  currentStatus: FileItem['status']
): [string, FileItem['status']] => {
  let status: FileItem['status'] = currentStatus;
  const endings = ['.', ',', '!', '?', "'"];
  let dotifyEpTitle = false;
  let dotifyProdTitle = false;
  let stopCount = 50;

  while (prodTitle.length + epTitle.length + epNumber.length > stopCount) {
    if (epTitle.length > 3) {
      epTitle = epTitle.substring(0, epTitle.length - 1);
      dotifyEpTitle = true;
    } else {
      prodTitle = prodTitle.substring(0, prodTitle.length - 1);
      dotifyProdTitle = true;
      stopCount = 45;
    }
  }

  epTitle = epTitle.trim(); // if shortened string ends with space char
  prodTitle = prodTitle.trim();

  if (endings.includes(epTitle[epTitle.length - 1]))
    epTitle = epTitle.substring(0, epTitle.length - 1); // don't end on special char

  if (dotifyEpTitle) {
    status = 'dotified';
    epTitle += '. . .';
  }
  if (dotifyProdTitle) {
    status = 'dotified';
    prodTitle += '. . .';
  }
  if (!dotifyEpTitle && !dotifyProdTitle) {
    status = 'modified';
    return [cleanTitle, status]; // dots in title but not dotified
  }

  const newTitle = buildFullTitle(prodTitle, epTitle, epNumber);
  return [newTitle, status];
};

const dotifyTitle = (title: string): [string, FileItem['status']] => {
  let prodTitle, epTitle, epNumber;
  let status: FileItem['status'] = 'valid';
  let cleanTitle = removeExtension(title);

  try {
    [prodTitle, epTitle, epNumber] = getTokens(cleanTitle);
  } catch {
    status = 'error';
    return [title, status];
  }

  [prodTitle, epTitle, epNumber, status] = trimWhiteSpace(
    prodTitle,
    epTitle,
    epNumber,
    status
  );
  [prodTitle, epTitle, status] = moveArticles(prodTitle, epTitle, status);
  [epNumber, status] = removeAmp(epNumber, status);
  [epNumber, status] = capitalizeAB(epNumber, status);

  cleanTitle = buildFullTitle(prodTitle, epTitle, epNumber);

  if (cleanTitle.length > 60 || epTitle.search(/(\.\.\.)$/) !== -1) {
    return dotify(cleanTitle, prodTitle, epTitle, epNumber, status);
  } else if (epTitle.search(/(\s\.\s\.\s\.)$/) !== -1) {
    epTitle = `${epTitle.substring(
      0,
      epTitle.search(/(\s\.\s\.\s\.)$/)
    )}${epTitle.substring(epTitle.search(/(\s\.\s\.\s\.)$/) + 1)}`;
    cleanTitle = buildFullTitle(prodTitle, epTitle, epNumber);
    status = 'modified';
  }
  return [cleanTitle, status];
};

export default dotifyTitle;
