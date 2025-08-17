export type Tool = {
  id: string;
  title: string;
  description: string;
  path: string;
};

export const TOOLS: Tool[] = [
  {
    id: 'pdf-manager',
    title: 'PDF Manager',
    description: 'Rename and organize PDF files',
    path: 'pdf',
  },
  {
    id: 'production-search',
    title: 'Production Search',
    description: 'Search movies, TV shows, and games',
    path: 'search',
  },
  {
    id: 'cwr-converter',
    title: 'CWR Converter',
    description: 'Parse CWR .v21 files',
    path: 'cwr',
  },
  {
    id: 'cue-sheet-converter',
    title: 'Cue Sheet Converter',
    description: 'Converts PDF Cue Sheets to CSV',
    path: 'cues',
  },
];
