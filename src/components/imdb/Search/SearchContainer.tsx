import React from 'react';

interface SearchContainerProps {
  children: React.ReactNode;
}

const SearchContainer: React.FC<SearchContainerProps> = ({ children }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mx-auto p-6 xl:w-[70%]">
      {children}
    </div>
  );
};

export default SearchContainer;
