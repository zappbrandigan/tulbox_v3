import React from 'react';

interface ToolHeaderProps {
  primaryText: string;
  secondaryText: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  primaryText,
  secondaryText,
}) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{primaryText}</h1>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">{secondaryText}</p>
    </div>
  );
};
