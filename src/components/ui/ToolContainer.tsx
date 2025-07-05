import React from 'react';

interface ToolContainerProps {
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ children }) => {
  return (
    <main className="container flex-1 mx-auto px-4 sm:px-2 lg:px-4 py-8">
      {children}
      <div
        id="clipboard-toast"
        className="hidden fixed right-10 bottom-10 px-5 py-4 border-r-8 border-blue-500 bg-white drop-shadow-lg"
      >
        <p className="text-sm">
          <span className="mr-2 inline-block px-3 py-1 rounded-full bg-blue-500 text-white font-extrabold">
            i
          </span>
          Copied to clipboard.
        </p>
      </div>
    </main>
  );
};

export default ToolContainer;
