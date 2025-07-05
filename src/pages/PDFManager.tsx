import React, { useEffect, useState } from 'react';
import {
  DragDropZone,
  Summary,
  SearchReplace,
  FileTable,
} from '@/components/pdf';
import { FileItem, SearchReplaceRule } from '@/types';
import {
  generateFileId,
  checkForDuplicates,
  applySearchReplace,
  downloadRenamedFiles,
  trackEvent,
} from '@/utils';
import { ToolHeader } from '@/components/ui';

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchReplaceRules, setSearchReplaceRules] = useState<
    SearchReplaceRule[]
  >([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    trackEvent('pdf_files_added', { count: newFiles.length });

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
    trackEvent('pdf_search_replace_applied', {
      rulesCount: searchReplaceRules.length,
      rule: searchReplaceRules,
    });

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

    trackEvent('pdf_download_started', {
      count: downloadableFiles.length,
    });

    setIsDownloading(true);
    try {
      await downloadRenamedFiles(downloadableFiles);
      trackEvent('pdf_download_success', {
        count: downloadableFiles.length,
      });
    } catch (error) {
      trackEvent('pdf_download_error', { error: error });
      console.error('Error downloading files:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearAll = () => {
    trackEvent('pdf_clear_all', {
      fileCount: files.length,
      rulesCount: searchReplaceRules.length,
    });
    setFiles([]);
    setSearchReplaceRules([]);
  };

  useEffect(() => {
    trackEvent('screen_view', {
      firebase_screen: 'PDFManager',
      firebase_screen_class: 'PDFManager',
    });
  }, []);

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
