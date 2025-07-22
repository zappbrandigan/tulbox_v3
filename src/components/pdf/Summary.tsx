import { FileItem } from '@/types';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';
import { Panel, StatCard } from '../ui';

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
    <>
      <Panel>
        <Panel.Body className="flex flex-wrap gap-4 justify-start">
          <StatCard
            value={files.length}
            label="Files"
            bg="bg-gray-50 dark:bg-gray-800/30 w-24 flex-grow-0"
            text="text-gray-600 dark:text-gray-300"
          />
          <StatCard
            value={validFiles}
            label="Ready"
            bg="bg-emerald-50 dark:bg-emerald-900/30 w-24 flex-grow-0"
            text="text-emerald-600 dark:text-emerald-200"
          />
          <StatCard
            value={files.filter((f) => f.status === 'duplicate').length}
            label="Duplicates"
            bg="bg-amber-50 dark:bg-amber-900/30 w-24 flex-grow-0"
            text="text-amber-600 dark:text-amber-300"
          />
          <StatCard
            value={
              files.filter(
                (f) => f.status === 'invalid' || f.status === 'error'
              ).length
            }
            label="Issues"
            bg="bg-red-50 dark:bg-red-900/30 w-24 flex-grow-0"
            text="text-red-600 dark:text-red-300"
          />
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
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
        </Panel.Body>
      </Panel>
    </>
  );
};

export default Summary;
