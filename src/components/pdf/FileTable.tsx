import React, { useState } from 'react';
import { Edit3, Check, X, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { FileItem } from '@/types';
import { trackEvent } from '@/utils';

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
    trackEvent('pdf_edit_inline', { filename: file.currentName });
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
    const base = 'transition-all duration-200 hover:bg-gray-50';
    switch (status) {
      case 'valid':
        return `${base} border-l-4 border-l-emerald-500`;
      case 'dotified':
        return `${base} border-l-4 border-l-blue-500`;
      case 'invalid':
        return `${base} border-l-4 border-l-red-500 bg-red-50/30`;
      case 'duplicate':
        return `${base} border-l-4 border-l-amber-500 bg-amber-50/30`;
      default:
        return base;
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>
          All data is processed locally in your browser. It is neither stored
          nor transmitted, and is discarded when you refresh or exit the page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Original Name
              </th> */}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Current Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Characters
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-y-gray-200">
            {files.map((file) => (
              <tr key={file.id} className={getRowClassName(file.status)}>
                {/* <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {file.originalName}
                </td> */}
                <td className="px-6 py-4 text-sm">
                  {editingId === file.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 group">
                      <span className="flex-1 font-medium text-gray-900 whitespace-pre">
                        {file.currentName}
                      </span>
                      <button
                        onClick={() => startEditing(file)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {file.characterCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <span
                      className={`text-sm font-medium ${
                        file.status === 'valid'
                          ? 'text-emerald-700'
                          : file.status === 'invalid'
                          ? 'text-red-700'
                          : file.status === 'dotified'
                          ? 'text-blue-700'
                          : file.status === 'modified'
                          ? 'text-green-700'
                          : file.status === 'error'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
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
