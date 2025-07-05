import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { exportFile, getTemplateById, trackEvent } from '@/utils';
import {
  DragDropZone,
  ParseSummary,
  TemplateBox,
  CodeView,
  TableView,
} from '@/components/cwr';
import { ToolHeader } from '@/components/ui';
import { CWRConverterRecord } from 'cwr-parser/types';

const CWRParserPage: React.FC = () => {
  const [file, setFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CWRConverterRecord | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>('raw-viewer');
  const [reportData, setReportData] = useState<Map<string, string | number>[]>(
    []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
    const exportFileName = `${baseFileName}_${template.name.replace(
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

  useEffect(() => {
    trackEvent('screen_view', {
      firebase_screen: 'CWRConverter',
      firebase_screen_class: 'CWRConverter',
    });
  }, []);

  return (
    <div className="space-y-8">
      {!fileContent && (
        <>
          <ToolHeader
            primaryText="CWR File Converter"
            secondaryText={`
            Upload and parse Common Works Registration (.v21 or .v22) files.
            Inspect them with an enhanced raw viewer and export reports to CSV.
            `}
            isBeta={true}
          />
          <DragDropZone onFilesAdded={handleFileUpload} />
        </>
      )}

      {fileContent && <ParseSummary parseResult={parseResult} />}

      {fileContent && parseResult && (
        <TemplateBox
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          isProcessing={isProcessing}
          isDownloading={isDownloading}
          handleFileRemove={handleFileRemove}
          handleExport={handleExport}
        />
      )}

      {/* Data Display */}
      {selectedTemplate === 'raw-viewer' && fileContent && (
        <CodeView
          file={file}
          fileContent={fileContent}
          selectedTemplate={selectedTemplate}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          parseResult={parseResult}
          setParseResult={setParseResult}
        />
      )}

      {selectedTemplate !== 'raw-viewer' && fileContent && (
        <TableView
          fileName={file}
          fileContent={fileContent}
          selectedTemplate={selectedTemplate}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          reportData={reportData}
          setReportData={setReportData}
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

export default CWRParserPage;
