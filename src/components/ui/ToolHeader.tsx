import { FlaskConical } from 'lucide-react';
import React from 'react';

interface ToolHeaderProps {
  primaryText: string;
  secondaryText: string;
  isBeta?: boolean;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  primaryText,
  secondaryText,
  isBeta = false,
}) => {
  return isBeta ? (
    <div className="text-center">
      <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 mb-4">
        {primaryText}
        <span className="flex items-center gap-1 text-sm text-blue-500">
          (Beta)
          <FlaskConical className="w-4 h-4" aria-hidden="true" />
        </span>
      </h1>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">{secondaryText}</p>
    </div>
  ) : (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{primaryText}</h1>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">{secondaryText}</p>
    </div>
  );
};
