import React from 'react';

interface ToolContainerProps {
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ children }) => {
  return (
    <main className="container flex-1 mx-auto px-4 sm:px-2 lg:px-4 py-8 transition-colors">
      <div className="space-y-8">{children}</div>

      {/* <div
        id="clipboard-toast"
        className="hidden fixed right-6 bottom-6 z-50 px-5 py-3 border-l-4 border-blue-500 bg-white dark:bg-gray-900 dark:text-gray-100 shadow-xl rounded-lg text-sm flex items-center gap-2 transition-all duration-300"
      >
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
          i
        </div>
        <p>Copied to clipboard.</p>
      </div> */}
    </main>
  );
};

export default ToolContainer;
