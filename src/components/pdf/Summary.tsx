import { FileItem } from '@/types';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';

interface SummaryProps {
  files: FileItem[];
  isDownloading: boolean;
  handleClearAll: () => void;
  handleDownloadAll: () => Promise<void>;
}

const Summary: React.FC<SummaryProps> = ({
  files,
  isDownloading,
  handleClearAll,
  handleDownloadAll,
}) => {
  const validFiles = files.filter((file) =>
    ['valid', 'modified', 'dotified'].includes(file.status)
  ).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg min-w-[100px]">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {files.length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-200">
              Total Files
            </div>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900 rounded-lg min-w-[100px]">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
              {validFiles}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-200">
              Ready
            </div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900 rounded-lg min-w-[100px]">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">
              {files.filter((f) => f.status === 'duplicate').length}
            </div>
            <div className="text-sm text-amber-600 dark:text-amber-200">
              Duplicates
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg min-w-[100px]">
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">
              {
                files.filter(
                  (f) => f.status === 'invalid' || f.status === 'error'
                ).length
              }
            </div>
            <div className="text-sm text-red-600 dark:text-red-200">Issues</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={validFiles === 0 || isDownloading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download {validFiles > 0 ? `(${validFiles})` : 'All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
