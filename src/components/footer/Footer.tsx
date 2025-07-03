import React from 'react';

export const Footer: React.FC = () => {
  const version = __APP_VERSION__;
  const updated = new Date(__APP_UPDATED__).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const commit = __APP_COMMIT__.substring(0, 6);

  return (
    <footer className="w-full py-3 text-xs text-gray-500 flex flex-col items-center space-y-1">
      <div className="text-gray-400">
        v{version} • {commit}
      </div>
      <div className="text-gray-400">Last Updated {updated}</div>
      <span>
        <a
          href={`mailto:brandon@tulbox.app?subject=Bug/Feedback:%20v${version}-${commit}`}
          className="text-blue-500 hover:underline"
        >
          Feedback/Bug Report
        </a>
        {` • `}
        <a
          href={`mailto:brandon@tulbox.app?subject=Request:%20v${version}-${commit}`}
          className="text-blue-500 hover:underline"
        >
          Requests
        </a>
      </span>
    </footer>
  );
};
