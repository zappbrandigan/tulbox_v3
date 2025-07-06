import React from 'react';

interface SearchContainerProps {
  children: React.ReactNode;
}

const SearchContainer: React.FC<SearchContainerProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mx-auto p-6 xl:w-[70%]">
      {children}
    </div>
  );
};

export default SearchContainer;
