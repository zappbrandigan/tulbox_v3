import React from 'react';

export const Footer: React.FC = () => {
  const version = __APP_VERSION__;
  const updated = new Date(__APP_UPDATED__).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const commit = __APP_COMMIT__;

  return (
    <footer className="w-full py-3 text-xs text-gray-500 flex flex-col items-center space-y-1">
      <div className="text-gray-400">
        v{version} • {commit.substring(0, 6)}
      </div>
      <div className="text-gray-400">Last Updated {updated}</div>
      <a
        href="mailto:brandon@tulbox.app"
        className="text-blue-500 hover:underline"
      >
        Send Feedback/Requests
      </a>
    </footer>
  );
};
