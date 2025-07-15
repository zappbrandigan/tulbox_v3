import { User, Users } from 'lucide-react';
import { showToast } from '@/utils';

interface CastProps {
  actors: string[];
}

const Cast: React.FC<CastProps> = ({ actors }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Cast
      </h3>
      <div className="space-y-2">
        {actors.map((actor, index) => (
          <div
            key={index}
            onClick={() => {
              navigator.clipboard.writeText(`${actor}`);
              showToast();
            }}
            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded hover:cursor-pointer transition-colors"
          >
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{actor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cast;
