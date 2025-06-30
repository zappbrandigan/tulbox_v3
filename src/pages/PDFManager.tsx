import React, { useState } from 'react';
import DragDropZone from '@/components/pdf/DragDropZone';
import FileTable from '@/components/pdf/FileTable';
import SearchReplace from '@/components/pdf/SearchReplace';
import Summary from '@/components/pdf/Summary';
import { FileItem, SearchReplaceRule } from '@/types';
import {
  generateFileId,
  checkForDuplicates,
  applySearchReplace,
  downloadRenamedFiles,
} from '@/utils/fileHelpers';
import { ToolHeader } from '@/components/ui/ToolHeader';

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchReplaceRules, setSearchReplaceRules] = useState<
    SearchReplaceRule[]
  >([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map((file) => ({
      id: generateFileId(),
      originalName: file.name,
      currentName: file.name.replace(/\.pdf$/i, ''),
      file,
      characterCount: file.name.replace(/\.pdf$/i, '').length,
      status: 'valid',
      lastModified: new Date(file.lastModified),
    }));

    setFiles((prevFiles) => checkForDuplicates([...prevFiles, ...fileItems]));
  };

  const handleFileUpdate = (id: string, newName: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file) =>
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
    setFiles((prevFiles) => {
      const filteredFiles = prevFiles.filter((file) => file.id !== id);
      return checkForDuplicates(filteredFiles);
    });
  };

  const handleApplySearchReplace = () => {
    setFiles((prevFiles) => {
      const updatedFiles = applySearchReplace(prevFiles, searchReplaceRules);
      return checkForDuplicates(updatedFiles);
    });
  };

  const handleDownloadAll = async () => {
    const downloadableFiles = files.filter((file) =>
      ['valid', 'modified', 'dotified'].includes(file.status)
    );
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

  return (
    <div className="space-y-8">
      {files.length === 0 && (
        <ToolHeader
          primaryText="PDF File Manager"
          secondaryText={`
            Upload PDF files, rename them individually or in batches using search & replace rules, 
            then download your organized files.`}
        />
      )}

      {files.length === 0 && <DragDropZone onFilesAdded={handleFilesAdded} />}

      {/* Stats & Actions */}
      {files.length > 0 && (
        <Summary
          files={files}
          isDownloading={isDownloading}
          handleClearAll={handleClearAll}
          handleDownloadAll={handleDownloadAll}
        />
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
