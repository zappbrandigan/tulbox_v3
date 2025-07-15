import { User } from 'lucide-react';
import { showToast } from '@/utils';

interface DirectorProps {
  director: string | null;
}

const Director: React.FC<DirectorProps> = ({ director }) => {
  if (!director) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center hover:cursor-pointer">
        <User className="w-5 h-5 mr-2" />
        Director
      </h3>
      <div
        onClick={() => {
          navigator.clipboard.writeText(`${director}`);
          showToast();
        }}
        className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded hover:cursor-pointer transition-colors"
      >
        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-gray-100">{director}</span>
      </div>
    </div>
  );
};

export default Director;
