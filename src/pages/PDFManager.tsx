import React, { useEffect, useState } from 'react';
import { Summary, SearchReplace, FileTable } from '@/components/pdf';
import { FileItem, SearchReplaceRule } from '@/types';
import {
  generateFileId,
  checkForDuplicates,
  applySearchReplace,
  downloadRenamedFiles,
  trackEvent,
} from '@/utils';
import { ToolHeader, DragDropZone, Disclaimer } from '@/components/ui';
import { logUserEvent } from '@/utils/general/logEvent';
import { PageMeta } from '@/PageMeta';
import { useSessionId } from '@/context/sessionContext';

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchReplaceRules, setSearchReplaceRules] = useState<
    SearchReplaceRule[]
  >([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const sessionId = useSessionId();

  const handleFilesAdded = (files: File[] | File) => {
    const actualFiles = Array.isArray(files) ? files : [files];
    logUserEvent(
      sessionId,
      'User added files',
      {
        action: 'file-upload',
        target: 'pdf-manager',
        value: actualFiles.length,
      },
      'pdf-manager'
    );

    const fileItems: FileItem[] = actualFiles.map((file) => ({
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
    logUserEvent(
      sessionId,
      'Search and Replace Applied',
      {
        action: 'search-replace',
        target: 'pdf-manager',
        value: JSON.stringify(searchReplaceRules),
      },
      'pdf-manager'
    );

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
      logUserEvent(
        sessionId,
        'PDF File Downloaded',
        {
          action: 'file-download',
          target: 'pdf-manager',
          value: downloadableFiles.length,
        },
        'pdf-manager'
      );
    } catch (error) {
      logUserEvent(
        sessionId,
        'Error: PDF Download',
        {
          action: 'file-download',
          target: 'pdf-manager',
          value: String(error),
        },
        'pdf-manager',
        'error'
      );
      console.error('Error downloading files:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearAll = () => {
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
    <>
      <PageMeta
        title="PDF Manager | TūlBOX"
        description="Batch rename PDF files using RegEx and quick templates."
      />
      <ToolHeader
        primaryText="PDF File Manager"
        secondaryText={`
            Upload PDF files, rename them individually or in batches using search & replace rules, 
            then download your organized files.`}
        isVisible={files.length === 0}
      />

      <DragDropZone
        onFilesAdded={handleFilesAdded}
        accept=".pdf"
        maxFiles={200}
        allowMultiple={true}
        validateFile={(file) =>
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf')
        }
        title="Upload PDF Files"
        description="Drag and drop your PDF files here, or click to browse"
        note="Maximum 200 files • PDF format only"
        isVisible={files.length === 0}
      />

      <Summary
        files={files}
        isDownloading={isDownloading}
        handleClearAll={handleClearAll}
        handleDownloadAll={handleDownloadAll}
      />

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

      <Disclaimer isVisible={files.length === 0} />
    </>
  );
};

export default PDFManager;
