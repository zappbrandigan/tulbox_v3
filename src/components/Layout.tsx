import React from 'react';
import { FileText, Zap, PocketKnife, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentTool: string;
  onToolChange: (tool: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentTool, onToolChange }) => {
  const tools = [
    {
      id: 'pdf-manager',
      title: 'PDF Manager',
      description: 'Rename and organize PDF files',
      icon: FileText,
    },
    {
      id: 'imdb-search',
      title: 'IMDB Search',
      description: 'Search movies, TV shows, and games',
      icon: Search,
    },
    {
      id: 'coming-soon',
      title: 'More Tools',
      description: 'Additional automation tools coming soon',
      icon: Zap,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <PocketKnife className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Tu&#x305;lBOX
              </h1>
            </div>
            <nav className="hidden sm:flex space-x-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  disabled={tool.id === 'coming-soon'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : tool.id === 'coming-soon'
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tool.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;