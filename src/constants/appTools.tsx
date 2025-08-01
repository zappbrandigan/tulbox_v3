import { FileText, Search, AudioLines, Music2 } from 'lucide-react';

export type Tool = {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
};

export const TOOLS: Tool[] = [
  {
    id: 'pdf-manager',
    title: 'PDF Manager',
    description: 'Rename and organize PDF files',
    icon: <FileText className="inline pr-2" />,
  },
  {
    id: 'production-search',
    title: 'Production Search',
    description: 'Search movies, TV shows, and games',
    icon: <Search className="inline pr-2" />,
  },
  {
    id: 'cwr-converter',
    title: 'CWR Converter',
    description: 'Parse CWR .v21 files',
    icon: <AudioLines className="inline pr-2" />,
  },
  {
    id: 'cue-sheet-converter',
    title: 'Cue Sheet Converter',
    description: 'Converts PDF Cue Sheets to CSV',
    icon: <Music2 className="inline pr-2" />,
  },
];
