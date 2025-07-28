const commonReplacements = [
  {
    name: 'Cue Sheet T1',
    desc: 'Cue sheet template for file names with episode titles',
    search: '.*',
    replace: 'CUE_SHEET',
    regex: true,
  },
  {
    name: 'Cue Sheet T2',
    desc: 'Cue sheet template for file names with out episode titles',
    search: '.*',
    replace: 'CUE_SHEET_NO_EP',
    regex: true,
  },
  {
    name: 'Date Conversion 1',
    desc: 'Swap day/month of date, e.g. 011425 → 14012025',
    search: '(\\d{2})(\\d{2})(\\d{2})',
    replace: '$2$120$3',
    regex: true,
  },
  {
    name: 'Date Conversion 2',
    desc: 'Swap day/month of date., e.g. 01142025 → 14012025',
    search: '(\\d{2})(\\d{2})(\\d{4})',
    replace: '$2$1$3',
    regex: true,
  },
  {
    name: 'Add "Ep No."',
    desc: 'Add "Ep No. " to the last numeric sequence, e.g. 011425 → Ep No. 011425',
    search: '(\\d+)$',
    replace: 'Ep No. $1',
    regex: true,
  },
  {
    name: 'Reorder Tokens',
    desc: 'Common reordering of file name pieces, e.g. Prod Title - 104 - Ep Title → Prod Title   Ep Title  Ep No. 104',
    search: '^(.+)\\s-\\s(\\d+)\\s-\\s(.+)$',
    replace: '$1   $3  Ep No. $2',
    regex: true,
  },
  {
    name: 'Zero Pad Episode Suffix',
    desc: 'Pad episode number, e.g. Ep No. 113 → Ep No. 1013',
    search: '(\\d{2}$)',
    replace: '0$1',
    regex: true,
  },
  { name: 'Replace Dashes', search: '-', replace: '_', regex: false },
  { name: 'Replace Spaces', search: ' ', replace: '-', regex: false },
];

export default commonReplacements;
