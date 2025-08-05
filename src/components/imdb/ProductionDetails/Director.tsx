import { Copy, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface DirectorProps {
  director: string | null;
}

const Director: React.FC<DirectorProps> = ({ director }) => {
  const { showToast } = useToast();
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
        className="group flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded hover:cursor-pointer transition-colors"
      >
        <User className="size-4 text-gray-500 dark:text-gray-400" />
        <span className="pl-2 text-gray-900 dark:text-gray-100">
          {director}
        </span>
        <button className="opacity-0 ml-auto group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100">
          <Copy className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default Director;
