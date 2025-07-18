import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface IMDBCodeProps {
  imdbCode: string;
}

const IMDBCode: React.FC<IMDBCodeProps> = ({ imdbCode }) => {
  const { showToast } = useToast();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div
        onClick={() => {
          navigator.clipboard.writeText(`${imdbCode.substring(1)}`);
          showToast();
        }}
        className="flex items-center space-x-2"
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">
          IMDB Code:
        </span>
        <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono hover:cursor-pointer text-gray-800 dark:text-gray-100">
          {imdbCode}
        </code>
      </div>
      <a
        href={`https://www.imdb.com/title/${imdbCode}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        View on IMDB
        <ExternalLink className="inline w-5 h-5 text-gray-600 dark:text-gray-300" />
      </a>
    </div>
  );
};

export default IMDBCode;
