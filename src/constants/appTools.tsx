import { FileText, Search, AudioLines, Zap } from 'lucide-react';

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
    id: 'imdb-search',
    title: 'IMDB Search',
    description: 'Search movies, TV shows, and games',
    icon: <Search className="inline pr-2" />,
  },
  {
    id: 'cwr-parser',
    title: 'CWR Parser',
    description: 'Parse CWR .v21 files',
    icon: <AudioLines className="inline pr-2" />,
  },
  {
    id: 'coming-soon',
    title: 'More Tools',
    description: 'Additional automation tools coming soon',
    icon: <Zap className="inline pr-2" />,
  }
];
