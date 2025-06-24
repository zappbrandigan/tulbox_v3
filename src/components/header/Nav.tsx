import React from "react";
import { ExternalLink } from "lucide-react";
import { TOOLS } from "@/constants/appTools";

interface NavProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
};

export const Nav: React.FC<NavProps> = ({ currentTool, onToolChange }) => {

  return (
    <nav className="hidden sm:flex space-x-1">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          disabled={tool.id === 'coming-soon'}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentTool === tool.id
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : tool.id === 'coming-soon'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {tool.icon} {tool.title}
        </button>
      ))}
      <a href="https://docs.tulbox.app" target="_blank" rel="noopender noreferrer">
        <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          Docs <ExternalLink className="inline pl-2" />
        </button>
      </a>
    </nav>
  );
};