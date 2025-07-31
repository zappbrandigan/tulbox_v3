import React, { useState } from 'react';
import { logUserEvent } from '@/utils/general/logEvent';
import { PageMeta } from '@/PageMeta';
import { FileItem } from '@/types';
import { checkForDuplicates, generateFileId } from '@/utils';
import { AlertCircle, MousePointer2, Table } from 'lucide-react';
import CUE_SHEET_FORMATS from '@/utils/cue/templates';
import { extractTextFromPDF } from '@/utils/cue/extract';
import { parseSoundmouseText } from '@/utils/cue/transform';
import { CueRow } from '@/utils/cue/types';
import { exportCueSheetCSV } from '@/utils/cue/exportCueSheetCSV';
import { useSessionId } from '@/context/sessionContext';
import { Summary, Controller, CueTable } from '@/components/cue';
import {
  ResultHeader,
  WarningModal,
  ToolHeader,
  LoadingOverlay,
  DragDropZone,
  Disclaimer,
  Panel,
} from '@/components/ui';

const CueSheetConverter: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>('sound-mouse');
  const [cueRows, setCueRows] = useState<CueRow[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isError, setIsError] = useState(false);

  const sessionId = useSessionId();

  const handleFilesAdded = (newFiles: File[] | File) => {
    const files = Array.isArray(newFiles) ? newFiles : [newFiles];
    logUserEvent(
      sessionId,
      'User added files',
      {
        action: 'file-upload',
        target: 'cue-sheet-converter',
        value: files.length,
      },
      'cue-sheet-converter'
    );

    const fileItems: FileItem[] = files.map((file) => ({
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

  const handleClearAll = () => {
    setFiles([]);
    setCueRows([]);
    setWarnings([]);
  };

  const handleExport = () => {
    const currentTemplate = CUE_SHEET_FORMATS.find(
      (f) => f.id === selectedTemplate
    )!;
    try {
      exportCueSheetCSV(cueRows, currentTemplate, `${currentTemplate.id}.csv`);
      logUserEvent(
        sessionId,
        'Cue Sheet CSV Downloaded',
        {
          action: 'file-download',
          target: 'cue-sheet-converter',
          value: cueRows.length,
        },
        'cue-sheet-converter'
      );
    } catch (error) {
      logUserEvent(
        sessionId,
        'Error: Cue Sheet CSV Downloaded',
        {
          action: 'file-download',
          target: 'cue-sheet-converter',
          value: String(error),
        },
        'cue-sheet-converter',
        'error'
      );
      console.error('Export Error:', error);
    }
  };

  const convertCueSheet = async () => {
    setIsProcessing(true);
    const allRows: CueRow[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
      const pdfText = await extractTextFromPDF(file.file);
      const { rows, warnings } = parseSoundmouseText(pdfText, file.currentName);
      allRows.push(...rows);
      allWarnings.push(...warnings);
    }

    if (allRows.length === 0) setIsError(true);
    setCueRows(allRows);
    setWarnings(allWarnings);
    setIsProcessing(false);
    logUserEvent(
      sessionId,
      'Cue Sheet Converted',
      {
        action: 'cue-sheet-conversion',
        target: 'cue-sheet-converter',
        value: `Format: ${selectedTemplate}`,
      },
      'cue-sheet-converter'
    );
  };

  const template = CUE_SHEET_FORMATS.find((f) => f.id === selectedTemplate);
  const uniqueWorkCount = new Set(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cueRows.map(({ fileName: _f, sequenceNumber: _s, duration: _d, ...rest }) =>
      JSON.stringify(rest)
    )
  ).size;

  return (
    <>
      <PageMeta
        title="Cue Sheet Converter | TūlBOX"
        description="Convert cue sheets from PDF files to CSV."
      />
      <ToolHeader
        primaryText="Cue Sheet Converter"
        secondaryText={`
            Upload cue sheet PDF files, and export the work data as a CSV.`}
        isVisible={files.length === 0}
        isBeta={true}
      />

      <Summary
        template={template?.name ?? ''}
        fileCount={files.length}
        rowCount={cueRows.length}
        uniqueCount={uniqueWorkCount}
        warningCount={warnings.length}
        setShowWarnings={setShowWarnings}
      />

      <DragDropZone
        onFilesAdded={handleFilesAdded}
        accept=".pdf"
        maxFiles={25}
        allowMultiple={true}
        validateFile={(file) =>
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf')
        }
        title="Upload PDF Files"
        description="Drag and drop your PDF files here, or click to browse"
        note="Maximum 25 files • PDF format only"
        isVisible={files.length === 0}
      />

      <Controller
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        isProcessing={isProcessing}
        cueRows={cueRows}
        handleClearAll={handleClearAll}
        handleExport={handleExport}
        convertCueSheet={convertCueSheet}
        isVisible={files.length > 0}
      />

      <ResultHeader
        icon={Table}
        text="Data Preview"
        isVisible={cueRows.length > 0}
      />

      {isProcessing && <LoadingOverlay message="Processing..." />}

      {files.length > 0 &&
        cueRows.length === 0 &&
        !isProcessing &&
        !isError && (
          <Panel>
            <div className="flex flex-col items-center justify-center text-center px-6 py-16  text-gray-500 dark:text-gray-400">
              <MousePointer2 className="text-gray-500 dark:text-gray-400 size-10 mb-6 font-normal" />
              <p className="text-lg font-medium mb-2">
                Select a Cue Sheet Format
              </p>
              <p className="text-sm max-w-md">
                Choose a parsing template to begin converting your cue sheet.
              </p>
            </div>
          </Panel>
        )}

      <CueTable
        cueRows={cueRows}
        template={template}
        files={files}
        warnings={warnings}
        setShowWarnings={setShowWarnings}
      />

      <WarningModal
        warnings={warnings}
        showWarnings={showWarnings}
        setShowWarnings={setShowWarnings}
      />

      {!isProcessing && files.length > 0 && isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Parsing Error
          </h3>
          <p className="text-sm leading-relaxed">
            A parsing issue occurred. Please double-check that the selected
            format matches the structure of your cue sheet.
          </p>
        </div>
      )}

      <Disclaimer isVisible={files.length === 0} />
    </>
  );
};

export default CueSheetConverter;
