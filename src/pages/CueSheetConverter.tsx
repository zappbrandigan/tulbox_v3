import { LoadingOverlay, ToolHeader } from '@/components/ui';
import { logUserEvent } from '@/utils/general/logEvent';
import { PageMeta } from '@/PageMeta';
import { FileItem } from '@/types';
import { useState } from 'react';
import { DragDropZone } from '@/components/pdf';
import { checkForDuplicates, generateFileId } from '@/utils';
import { CheckCircle, Download, Settings, Table, Trash } from 'lucide-react';
import CUE_SHEET_FORMATS from '@/utils/cueSeet/templates';
import { extractTextFromPDF } from '@/utils/cueSeet/extract';
import { parseSoundmouseText } from '@/utils/cueSeet/transform';
import { CueRow } from '@/utils/cueSeet/types';
import React from 'react';
import { exportCueSheetCSV } from '@/utils/cueSeet/exportCueSheetCSV';

const CueSheetConverter: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>('sound-mouse');
  const [cueRows, setCueRows] = useState<CueRow[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    logUserEvent(
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
    exportCueSheetCSV(cueRows, currentTemplate, `${currentTemplate.id}.csv`);
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

    setCueRows(allRows);
    setWarnings(allWarnings);
    setIsProcessing(false);
  };

  const template = CUE_SHEET_FORMATS.find((f) => f.id === selectedTemplate);
  const uniqueWorks = new Set(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cueRows.map(({ fileName: _f, sequenceNumber: _s, duration: _d, ...rest }) =>
      JSON.stringify(rest)
    )
  );
  const uniqueWorkCount = uniqueWorks.size;

  return (
    <>
      <PageMeta
        title="Cue Sheet Converter | TūlBOX"
        description="Convert cue sheets from PDF files to CSV."
      />
      {files.length === 0 && (
        <ToolHeader
          primaryText="Cue Sheet Converter"
          secondaryText={`
            Upload cue sheet PDF files, and export the work data as a CSV.`}
          isBeta={true}
        />
      )}

      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Results
              </h3>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Parsed on {new Date().toDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="flex flex-col justify-center items-center text-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <div
                className="text-sm font-bold text-amber-600 dark:text-amber-300 truncate overflow-hidden whitespace-nowrap w-full max-w-[180px] sm:max-w-none"
                title={template?.name}
              >
                {template?.name}
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-400">
                Format
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {files.length}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-400">
                File Count
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                {cueRows.length}
              </div>
              <div className="text-sm text-emerald-800 dark:text-emerald-400">
                Rows
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                {uniqueWorkCount}
              </div>
              <div className="text-sm text-purlpe-800 dark:text-purple-400">
                Unique Rows
              </div>
            </div>

            <div
              onClick={() => setShowWarnings(true)}
              className="flex flex-col justify-center items-center text-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:cursor-pointer"
            >
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">
                {warnings.length}
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-400">
                Warnings
              </div>
            </div>
          </div>
        </div>
      )}

      {files.length === 0 && <DragDropZone onFilesAdded={handleFilesAdded} />}

      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Settings & Template Dropdown */}
            <div className="flex items-center space-x-4">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <label
                  htmlFor="template-menu"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Cue Sheet Format
                </label>
                <select
                  id="template-menu"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {CUE_SHEET_FORMATS.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                disabled={isProcessing}
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Trash className="w-4 h-4 mr-2" />
                Clear
              </button>
              {cueRows.length === 0 && (
                <button
                  disabled={isProcessing}
                  onClick={() => convertCueSheet()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Convert
                </button>
              )}
              {cueRows.length > 0 && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleExport()}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Template Description */}
          {(() => {
            return template ? (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {template.description}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {cueRows.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <Table className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Data Preview
          </h3>
        </div>
      )}

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
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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
      {showWarnings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 !mt-0">
          <div className="bg-white dark:bg-gray-900 w-auto max-w-[80vw] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-amber-700">Warnings</h2>
              <button
                onClick={() => setShowWarnings(false)}
                className="text-sm text-amber-600 hover:underline"
              >
                Close
              </button>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1 max-h-64 overflow-auto">
              {warnings.map((w, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: w }} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default CueSheetConverter;
