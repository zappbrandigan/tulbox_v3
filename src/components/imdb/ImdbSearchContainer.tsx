import React from "react";

interface ImdbSearchContainerProps {
  children: React.ReactNode
}

export const ImdbSearchContainer: React.FC<ImdbSearchContainerProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mx-auto p-6 xl:w-[70%]">
      {children}
    </div>
  );
};