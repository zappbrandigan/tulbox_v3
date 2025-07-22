import { LoadingOverlay, ToolHeader } from '@/components/ui';
import { logUserEvent } from '@/utils/general/logEvent';
import { PageMeta } from '@/PageMeta';
import { FileItem } from '@/types';
import { useState } from 'react';
import { DragDropZone } from '@/components/pdf';
import { checkForDuplicates, generateFileId } from '@/utils';
import { AlertCircle, Table } from 'lucide-react';
import CUE_SHEET_FORMATS from '@/utils/cueSeet/templates';
import { extractTextFromPDF } from '@/utils/cueSeet/extract';
import { parseSoundmouseText } from '@/utils/cueSeet/transform';
import { CueRow } from '@/utils/cueSeet/types';
import React from 'react';
import { exportCueSheetCSV } from '@/utils/cueSeet/exportCueSheetCSV';
import { useSessionId } from '@/context/sessionContext';
import WarningModal from '@/components/ui/WarningModal';
import Controller from '@/components/cue/Controller';
import { Summary } from '@/components/cue';
import ResultHeader from '@/components/ui/ResultHeader';

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

  const handleFilesAdded = (newFiles: File[]) => {
    logUserEvent(
      sessionId,
      'User added files',
      {
        action: 'file-upload',
        target: 'cue-sheet-converter',
        value: newFiles.length,
      },
      'cue-sheet-converter'
    );

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

      {files.length === 0 && <DragDropZone onFilesAdded={handleFilesAdded} />}

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

      {isProcessing && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <LoadingOverlay message="Processing..." />
        </div>
      )}

      {cueRows.length > 0 &&
        (() => {
          const maxWriters = Math.max(
            ...cueRows.map((row) => row.writers.length)
          );

          return (
            <>
              <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-auto max-h-[82vh] rounded-t-xl">
                  <table className="min-w-full table-fixed text-sm text-left">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold">
                      <tr>
                        {template?.fields.map((field) => (
                          <th
                            key={field.key}
                            style={{
                              minWidth: field.width,
                              maxWidth: field.width,
                            }}
                            className={`px-4 py-3 whitespace-nowrap w-[${field.width}px]`}
                          >
                            {field.label}
                          </th>
                        ))}

                        {template?.repeatGroup &&
                          Array.from({ length: maxWriters }).map((_, i) => (
                            <React.Fragment key={`writer-block-${i}`}>
                              {template.repeatGroup.subfields.map((sub) => (
                                <th
                                  key={`${sub.key}-${i}`}
                                  style={{
                                    minWidth: sub.width,
                                    maxWidth: sub.width,
                                  }}
                                  className={`px-4 py-3 whitespace-nowrap w-[${sub.width}px]`}
                                >
                                  {sub.label} {i + 1}
                                </th>
                              ))}
                            </React.Fragment>
                          ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {cueRows.map((row, rowIndex) => (
                        <tr key={`cue-row-${rowIndex}`}>
                          {template?.fields.map((field) => (
                            <td
                              key={field.key}
                              style={{
                                minWidth: field.width,
                                maxWidth: field.width,
                              }}
                              className={`px-4 py-2 truncate whitespace-pre uppercase w-[${field.width}px]`}
                            >
                              {String(row[field.key as keyof typeof row] ?? '')}
                            </td>
                          ))}

                          {template?.repeatGroup &&
                            Array.from({ length: maxWriters }).map((_, i) => {
                              const writer = row.writers[i];
                              return (
                                <React.Fragment key={`writer-data-${i}`}>
                                  {template.repeatGroup.subfields.map((sub) => (
                                    <td
                                      key={`${sub.key}-${i}-${rowIndex}`}
                                      style={{
                                        minWidth: sub.width,
                                        maxWidth: sub.width,
                                      }}
                                      className={`px-4 py-2 truncate uppercase w-[${sub.width}px]`}
                                    >
                                      {writer?.[
                                        sub.key as keyof typeof writer
                                      ] ?? ''}
                                    </td>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 rounded-b-xl">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>
                      <span className="text-emerald-500">{files.length}</span>
                      {` ${files.length > 1 ? 'files' : 'file'} • `}
                      <span className="text-blue-500">{cueRows.length}</span>
                      {` rows`}
                      {warnings.length > 0 && (
                        <>
                          {` • `}
                          <span
                            onClick={() => setShowWarnings(true)}
                            className="ml-1 px-1.5 py-0.5 text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300 rounded hover:text-amber-700 hover:underline cursor-pointer transition"
                            title="Click to view warnings"
                          >
                            ⚠ {warnings.length} warning
                            {warnings.length !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </span>
                    <span>
                      <span>{template?.name} Converter</span>{' '}
                      <span className="text-blue-500">
                        v{template?.version}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
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
    </>
  );
};

export default CueSheetConverter;
