import React, { useEffect, useState, useTransition } from 'react';
import { FileText } from 'lucide-react';
import { exportFile, getTemplateById, trackEvent } from '@/utils';
import {
  DragDropZone,
  ParseSummary,
  TemplateBox,
  CodeView,
  TableView,
} from '@/components/cwr';
import { Progress, ToolHeader } from '@/components/ui';
import { CWRConverterRecord } from 'cwr-parser/types';
import { CWRTemplate } from '@/types';

const CWRConverter: React.FC = () => {
  const [file, setFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CWRConverterRecord | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<CWRTemplate['id']>('raw-viewer');
  const [reportData, setReportData] = useState<Map<string, string | number>[]>(
    []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMemoryError, setShowMemoryError] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleFileUpload = async (file: File) => {
    trackEvent('cwr_file_added', {
      size: `${(file.size / 1024 / 1024).toFixed(2)} Mb`,
    });
    const maxSizeMB = 150; // limit in megabytes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      alert(
        `This tool is currently in beta: maximum allowed file size is ${maxSizeMB}MB.`
      );
      return;
    }

    try {
      const content = await file.text();
      setFile(file.name);
      setFileContent(content);
      setIsProcessing(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing CWR file. Please check the file format.');
      setIsProcessing(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    trackEvent('cwr_file_exported', { format: format });

    if (!parseResult) return;

    const template = getTemplateById(selectedTemplate);
    if (!template) return;

    const baseFileName = parseResult.fileName.replace(/\.[^/.]+$/, '');
    const exportFileName = `${baseFileName}_${selectedTemplate.replace(
      /\s+/g,
      '_'
    )}`;

    exportFile(reportData, template, exportFileName, format, setIsDownloading);
  };

  const handleFileRemove = () => {
    setFile('');
    setFileContent('');
    setParseResult(null);
    setReportData([]);
    setSelectedTemplate('raw-viewer');
  };

  const switchTemplate = (next: CWRTemplate['id']) => {
    if (next === selectedTemplate) return;

    setIsProcessing(true);
    setProgress(0);

    requestAnimationFrame(() =>
      startTransition(() => setSelectedTemplate(next))
    );
  };

  useEffect(() => {
    trackEvent('screen_view', {
      firebase_screen: 'CWRConverter',
      firebase_screen_class: 'CWRConverter',
    });
  }, []);

  return (
    <div className="space-y-8">
      {!parseResult && (
        <>
          <ToolHeader
            primaryText="CWR File Converter"
            secondaryText={`
            Upload and parse Common Works Registration (.v21 or .v22) files.
            Inspect them with an enhanced raw viewer and export reports to CSV.
            `}
            isBeta={true}
          />
          {isProcessing ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <Progress
                progress={progress}
                message={progress > 0.95 ? 'Loading Viewer' : 'Parsing File'}
              />
            </div>
          ) : isPending ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <Progress progress={1} message="Rendering" />
            </div>
          ) : (
            <DragDropZone onFilesAdded={handleFileUpload} />
          )}

          {showMemoryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              File too large for this device’s available memory. Try a smaller
              file or run this on a more powerful machine.
            </div>
          )}
        </>
      )}

      {fileContent && <ParseSummary parseResult={parseResult} />}

      {fileContent && parseResult && (
        <TemplateBox
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={switchTemplate}
          isProcessing={isProcessing}
          isDownloading={isDownloading}
          handleFileRemove={handleFileRemove}
          handleExport={handleExport}
          reportHasData={reportData.length > 0}
        />
      )}

      {selectedTemplate === 'raw-viewer' && fileContent && (
        <CodeView
          file={file}
          fileContent={fileContent}
          selectedTemplate={selectedTemplate}
          parseResult={parseResult}
          setParseResult={setParseResult}
          isProcessing={isProcessing}
          onProgress={setProgress}
          onReady={() => setIsProcessing(false)}
          startTransition={startTransition}
          setShowMemoryError={setShowMemoryError}
        />
      )}

      {selectedTemplate !== 'raw-viewer' && fileContent && (
        <TableView
          fileName={file}
          fileContent={fileContent}
          selectedTemplate={selectedTemplate}
          reportData={reportData}
          setReportData={setReportData}
          isProcessing={isProcessing}
          progress={progress}
          onProgress={setProgress}
          onReady={() => setIsProcessing(false)}
        />
      )}

      {/* Empty State */}
      {parseResult &&
        parseResult.lines.length === 0 &&
        selectedTemplate !== 'raw-viewer' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Works Found
            </h3>
            <p className="text-gray-600">
              The CWR file was parsed successfully but no work registrations
              were found. Please check if the file contains valid work
              registration records.
            </p>
          </div>
        )}

      {!fileContent && (
        <div className="text-center py-12 text-gray-500">
          <p>
            All data is processed locally in your browser. It is neither stored
            nor transmitted, and is discarded when you refresh or exit the page.
          </p>
        </div>
      )}
    </div>
  );
};

export default CWRConverter;
