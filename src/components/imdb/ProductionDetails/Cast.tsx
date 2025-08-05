import { Copy, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface CastProps {
  actors: string[];
}

const Cast: React.FC<CastProps> = ({ actors }) => {
  const { showToast } = useToast();
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Cast
      </h3>
      <div className="space-y-2">
        {actors.map((actor, index) => (
          <>
            <div
              key={index}
              onClick={() => {
                navigator.clipboard.writeText(`${actor}`);
                showToast();
              }}
              className="group flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded hover:cursor-pointer transition-colors"
            >
              <User className="size-4 text-gray-500 dark:text-gray-400" />
              <span className="pl-2 text-gray-900 dark:text-gray-100">
                {actor}
              </span>
              <button className="opacity-0 ml-auto group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100">
                <Copy className="size-4" />
              </button>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default Cast;
