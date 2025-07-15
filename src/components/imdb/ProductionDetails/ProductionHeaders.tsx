import { IMDBProduction, productionType } from '@/types';
import { Calendar, Languages, Globe, Star } from 'lucide-react';
import React from 'react';

interface ProductionHeaderProps {
  selectedProduction: IMDBProduction;
  getTypeIcon: (type: productionType) => JSX.Element;
}

const ProductionHeader: React.FC<ProductionHeaderProps> = ({
  selectedProduction,
  getTypeIcon,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 dark:from-blue-700 dark:to-indigo-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getTypeIcon(selectedProduction.type)}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white dark:bg-white/30">
              {selectedProduction.type}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {selectedProduction.title}
          </h2>
          <div className="flex items-center space-x-4 text-blue-100 dark:text-blue-200">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{selectedProduction.releaseYear}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Languages className="w-4 h-4" />
              <span>{selectedProduction.language}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>{selectedProduction.originCountry}</span>
            </div>
            {selectedProduction.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{selectedProduction.rating}/10</span>
              </div>
            )}
          </div>
        </div>
        {selectedProduction.poster && (
          <img
            src={selectedProduction.poster}
            alt={selectedProduction.title}
            className="w-24 h-36 object-cover rounded-lg shadow-lg"
          />
        )}
      </div>
    </div>
  );
};

export default ProductionHeader;
