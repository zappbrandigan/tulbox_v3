import React from 'react';
import { PocketKnife } from 'lucide-react';

interface BrandProps {
  appName: string;
}

const Brand: React.FC<BrandProps> = ({ appName }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
        <PocketKnife className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        {appName}
      </h1>
    </div>
  );
};

export default Brand;
