import React from 'react';

interface PlotProps {
  plot?: string;
}

const Plot: React.FC<PlotProps> = ({ plot }) => {
  if (!plot) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Plot
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {plot.length > 500 ? `${plot.substring(0, 500)}. . .` : plot}
      </p>
    </div>
  );
};

export default Plot;
