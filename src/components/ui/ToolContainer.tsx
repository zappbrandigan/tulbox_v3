import React from 'react';

interface ToolContainerProps {
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ children }) => {
  return (
    <main className="container flex-1 mx-auto px-4 sm:px-2 lg:px-4 py-8 transition-colors">
      <div className="space-y-8">{children}</div>
    </main>
  );
};

export default ToolContainer;
