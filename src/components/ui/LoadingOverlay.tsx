import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-12 text-gray-600 dark:text-gray-300">
      <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-600 dark:text-blue-400" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
