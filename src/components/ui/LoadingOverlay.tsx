import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-12 text-gray-600">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
