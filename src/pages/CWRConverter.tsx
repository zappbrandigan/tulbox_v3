import React, { useEffect, useState, useTransition } from 'react';
import { CircleXIcon, FileText } from 'lucide-react';
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
import { logUserEvent } from '@/utils/general/logEvent';
import { PageMeta } from '@/PageMeta';

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
    const maxSizeMB = 100; // limit in megabytes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setShowMemoryError(true);
      return;
    }

    try {
      const content = await file.text();
      setFile(file.name);
      setFileContent(content);
      setIsProcessing(true);
      setShowMemoryError(false);
      logUserEvent(
        'CWR File Added',
        {
          action: 'file-upload',
          target: 'cwr-converter',
          value: `${(file.size / 1024 / 1024).toFixed(2)} Mb`,
        },
        'cwr-converter'
      );
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing CWR file. Please check the file format.');
      setIsProcessing(false);
      logUserEvent(
        'CWR File Added',
        {
          action: 'file-upload',
          target: 'cwr-converter',
          value: `${(file.size / 1024 / 1024).toFixed(2)} Mb`,
        },
        'cwr-converter',
        'error'
      );
    }
  };

  const handleExport = (format: 'csv') => {
    if (!parseResult) return;

    const template = getTemplateById(selectedTemplate);
    if (!template) return;

    const baseFileName = parseResult.fileName.replace(/\.[^/.]+$/, '');
    const exportFileName = `${baseFileName}_${selectedTemplate.replace(
      /\s+/g,
      '_'
    )}`;
    logUserEvent(
      'CWR Template Selected',
      {
        action: 'report-view',
        target: 'cwr-converter',
        value: exportFileName,
      },
      'cwr-converter'
    );

    exportFile(reportData, template, exportFileName, format, setIsDownloading);
  };

  const handleFileRemove = () => {
    setFile('');
    setFileContent('');
    setParseResult(null);
    setReportData([]);
    setShowMemoryError(false);
    setSelectedTemplate('raw-viewer');
    setProgress(0);
  };

  const switchTemplate = (next: CWRTemplate['id']) => {
    if (next === selectedTemplate) return;

    logUserEvent(
      'CWR Template Selected',
      {
        action: 'report-view',
        target: 'cwr-converter',
        value: next,
      },
      'cwr-converter'
    );

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
    <>
      <PageMeta
        title="CWR Converter | TūlBOX"
        description="Seamlessly view and transform CWR files into customized, ready-to-use reports."
      />
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

            {/* Progress States */}
            {isProcessing ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Progress
                  progress={progress}
                  message={progress > 0.95 ? 'Loading Viewer' : 'Parsing File'}
                />
              </div>
            ) : isPending ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Progress progress={1} message="Rendering" />
              </div>
            ) : (
              <DragDropZone onFilesAdded={handleFileUpload} />
            )}

            {/* Memory Error Message */}
            {showMemoryError && (
              <div className="flex items-start gap-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300 p-4 rounded-lg transition-colors">
                <span className="flex-1">
                  File too large. Try a smaller file or make a request via the
                  links below for a CLI conversion.
                </span>
                <button
                  onClick={() => {
                    setShowMemoryError(false);
                    setFileContent('');
                  }}
                  className="ml-auto text-red-700 dark:text-red-300 hover:text-red-500 dark:hover:text-red-200"
                >
                  <CircleXIcon />
                </button>
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>
              All data is processed locally in your browser. It is neither
              stored nor transmitted, and is discarded when you refresh or exit
              the page.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CWRConverter;
