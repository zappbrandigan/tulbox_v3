import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { CWRInitialParseResult } from '@/types/cwrTypes';
import { getTemplateById } from '@/utils/cwrTemplates';
import { exportToCSV, exportToXLSX, exportToJSON } from '@/utils/exportHelpers';
import { CodeView } from '@/components/cwr/CodeView'
import { ParseSummary } from '@/components/cwr/ParseSummary';
import { DragDropZone } from '@/components/cwr/DragDropZone';
import { TableView } from '@/components/cwr/TableView';
import { ToolHeader } from '@/components/ui/ToolHeader';
import { TemplateBox } from '@/components/cwr/TemplateBox';


const CWRParserPage: React.FC = () => {
  const [file, setFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CWRInitialParseResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('raw-viewer');
  const [reportData, setReportData] = useState<Map<string, string | number>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
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

  const handleExport = (format: 'csv' | 'xlsx' | 'json') => {
    if (!parseResult) return;
    
    const template = getTemplateById(selectedTemplate);
    if (!template) return;

    const baseFileName = parseResult.fileName.replace(/\.[^/.]+$/, '');
    const exportFileName = `${baseFileName}_${template.name.replace(/\s+/g, '_')}`;

    if (format === 'csv') {
      exportToCSV(reportData, template, exportFileName);
    } else if (format === 'json') {
      exportToJSON(reportData, exportFileName);
    } else {
      exportToXLSX(reportData, template, exportFileName);
    }
  };

  const handleFileRemove = () => {
    setFile('');
    setFileContent('');
    setParseResult(null);
    setReportData([]);
    setSelectedTemplate('raw-viewer');
  };

  return (
    <div className="space-y-8">
      {!fileContent && (
        <>
          <ToolHeader 
            primaryText='CWR File Converter'
            secondaryText={`
            Upload and parse CWR (Common Works Registration) .v21 or .v22 files. 
            Extract work registrations, writer information, publisher data, and export to CSV or Excel formats.
            `}
          />
          <DragDropZone onFilesAdded={handleFileUpload} />
        </>
        )}

      {(fileContent) && 
        <ParseSummary parseResult={parseResult} />
      }

      {(fileContent) && parseResult && (
        <TemplateBox 
          selectedTemplate={selectedTemplate} 
          setSelectedTemplate={setSelectedTemplate} 
          handleFileRemove={handleFileRemove}
          handleExport={handleExport}
        />
      )}

      {/* Data Display */}
      {selectedTemplate === 'raw-viewer' && fileContent && (
        <CodeView 
          fileContent={fileContent} 
          file={file}
          isProcessing={isProcessing} 
          setIsProcessing={setIsProcessing}
          parseResult={parseResult}
          setParseResult={setParseResult}
        /> 
      )}

      {selectedTemplate !== 'raw-viewer' && fileContent &&(
        <TableView 
          fileContent={fileContent} 
          selectedTemplate={selectedTemplate} 
          isProcessing={isProcessing} 
          setIsProcessing={setIsProcessing}
          reportData={reportData}
          setReportData={setReportData}
        />
      )}

      {/* Empty State */}
      {parseResult && parseResult.transmission.groups.length === 0 && selectedTemplate !== 'raw-viewer' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Works Found</h3>
          <p className="text-gray-600">
            The CWR file was parsed successfully but no work registrations were found.
            Please check if the file contains valid work registration records.
          </p>
        </div>
      )}

      {!fileContent && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default CWRParserPage;