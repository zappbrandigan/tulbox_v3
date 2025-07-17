import React, { useState } from 'react';
import { Edit3, Check, X, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { FileItem } from '@/types';
import { logUserEvent } from '@/utils/general/logEvent';

interface FileTableProps {
  files: FileItem[];
  onFileUpdate: (id: string, newName: string) => void;
  onFileRemove: (id: string) => void;
}

const FileTable: React.FC<FileTableProps> = ({
  files,
  onFileUpdate,
  onFileRemove,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (file: FileItem) => {
    logUserEvent('PDF Files Inline Edit', {
      action: 'ui-interaction',
      target: 'file-edit',
      value: file.currentName,
    });
    setEditingId(file.id);
    setEditValue(file.currentName);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onFileUpdate(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'dotified':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'modified':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'invalid':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'duplicate':
        return <Copy className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'valid':
        return 'Valid';
      case 'invalid':
        return 'Invalid name';
      case 'duplicate':
        return 'Duplicate name';
      case 'dotified':
        return 'Dotified';
      case 'modified':
        return 'Modified';
      case 'error':
        return 'Error';
      default:
        return 'Error';
    }
  };

  const getRowClassName = (status: FileItem['status']) => {
    const base =
      'transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800';

    switch (status) {
      case 'valid':
        return `${base} border-l-4 border-l-emerald-500 dark:border-l-emerald-400`;
      case 'dotified':
        return `${base} border-l-4 border-l-blue-500 dark:border-l-blue-400`;
      case 'invalid':
        return `${base} border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-500/10`;
      case 'duplicate':
        return `${base} border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-500/10`;
      default:
        return base;
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>
          All data is processed locally in your browser. It is neither stored
          nor transmitted, and is discarded when you refresh or exit the page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Current Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Characters
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {files.map((file) => (
              <tr key={file.id} className={getRowClassName(file.status)}>
                <td className="px-6 py-4 text-sm">
                  {editingId === file.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 text-emerald-600 hover:text-emerald-400 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 group">
                      <span className="flex-1 font-medium text-gray-900 dark:text-white whitespace-pre">
                        {file.currentName}
                      </span>
                      <button
                        onClick={() => startEditing(file)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {file.characterCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <span
                      className={`text-sm font-medium ${
                        file.status === 'valid'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : file.status === 'invalid'
                          ? 'text-red-700 dark:text-red-400'
                          : file.status === 'dotified'
                          ? 'text-blue-700 dark:text-blue-400'
                          : file.status === 'modified'
                          ? 'text-green-700 dark:text-green-400'
                          : file.status === 'error'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;
