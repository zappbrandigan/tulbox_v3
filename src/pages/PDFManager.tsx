import React, { useState } from 'react';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import DragDropZone from '../components/DragDropZone';
import FileTable from '../components/FileTable';
import SearchReplace from '../components/SearchReplace';
import { FileItem, SearchReplaceRule } from '../types';
import { generateFileId, checkForDuplicates, applySearchReplace, downloadRenamedFiles } from '../utils/fileHelpers';

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchReplaceRules, setSearchReplaceRules] = useState<SearchReplaceRule[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: generateFileId(),
      originalName: file.name,
      currentName: file.name.replace(/\.pdf$/i, ''),
      file,
      characterCount: file.name.replace(/\.pdf$/i, '').length,
      status: 'valid',
      lastModified: new Date(file.lastModified),
    }));

    setFiles(prevFiles => checkForDuplicates([...prevFiles, ...fileItems]));
  };

  const handleFileUpdate = (id: string, newName: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.map(file =>
        file.id === id
          ? {
              ...file,
              currentName: newName,
              characterCount: newName.length,
            }
          : file
      );
      return checkForDuplicates(updatedFiles);
    });
  };

  const handleFileRemove = (id: string) => {
    setFiles(prevFiles => {
      const filteredFiles = prevFiles.filter(file => file.id !== id);
      return checkForDuplicates(filteredFiles);
    });
  };

  const handleApplySearchReplace = () => {
    setFiles(prevFiles => {
      const updatedFiles = applySearchReplace(prevFiles, searchReplaceRules);
      return checkForDuplicates(updatedFiles);
    });
  };

  const handleDownloadAll = async () => {
    const downloadableFiles = files.filter(file => ['valid', 'modified', 'dotified'].includes(file.status));
    if (downloadableFiles.length === 0) return;

    setIsDownloading(true);
    try {
      await downloadRenamedFiles(downloadableFiles);
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setSearchReplaceRules([]);
  };

  const validFiles = files.filter(file => ['valid', 'modified', 'dotified'].includes(file.status)).length;
  const totalFiles = files.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      {files.length === 0 && 
        (<div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PDF File Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload PDF files, rename them individually or in batches using search & replace rules, 
            then download your organized files.
          </p>
        </div>)
      }

      {/* Upload Zone */}
      {files.length === 0 && (<DragDropZone onFilesAdded={handleFilesAdded} />)}

      {/* Stats & Actions */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalFiles}</div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{validFiles}</div>
                <div className="text-sm text-gray-600">Ready to Download</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {files.filter(f => f.status === 'duplicate').length}
                </div>
                <div className="text-sm text-gray-600">Duplicates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {files.filter(f => f.status === 'invalid').length}
                </div>
                <div className="text-sm text-gray-600">Invalid</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={validFiles === 0 || isDownloading}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
      )}

      {/* Search & Replace */}
      {files.length > 0 && (
        <SearchReplace
          rules={searchReplaceRules}
          onRulesChange={setSearchReplaceRules}
          onApply={handleApplySearchReplace}
        />
      )}

      {/* File Table */}
      <FileTable
        files={files}
        onFileUpdate={handleFileUpdate}
        onFileRemove={handleFileRemove}
      />
    </div>
  );
};

export default PDFManager;