import React from 'react';

const DocsLink = React.forwardRef<HTMLAnchorElement, { onClick?: () => void }>(
  ({ onClick }, ref) => {
    return (
      <a
        ref={ref}
        href="https://docs.tulbox.app"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="w-full flex items-center px-4 py-2 text-sm rounded transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Docs
      </a>
    );
  }
);

DocsLink.displayName = 'DocsLink'; // required for React DevTools

export default DocsLink;
