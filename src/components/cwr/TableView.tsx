import React, { useState, useEffect, useRef, useTransition } from 'react';
import { getTemplateById } from '@/utils';
import { CWRTemplateField } from '@/types';
import { Table } from 'lucide-react';
import ReportWorker from '@/workers/reportWorker?worker';
import { LoadingOverlay, Panel, WarningModal } from '@/components/ui';

const ROW_HEIGHT = 36;
const PAGE_SIZE = 50;

interface Props {
  fileName: string;
  fileContent: string;
  selectedTemplate: string;
  reportData: Map<string, string | number>[];
  setReportData: React.Dispatch<
    React.SetStateAction<Map<string, string | number>[]>
  >;
  isProcessing: boolean;
  progress: number;
  onReady: () => void;
}

const TableView: React.FC<Props> = ({
  fileName,
  fileContent,
  selectedTemplate,
  reportData,
  setReportData,
  isProcessing,
  onReady,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);

  const [isPending, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fileContent) return;

    const MIN_DURATION = 500;
    const start = Date.now();

    // onProgress(0);
    setReportData([]); // clear old rows

    const worker = new ReportWorker();
    worker.postMessage({
      type: 'generate',
      fileContent,
      selectedTemplate,
    });

    worker.onmessage = (e) => {
      const { type } = e.data as { type: string };

      if (type === 'error') {
        console.error('Worker Error:', e.data.error);
        onReady();
        worker.terminate();
        return;
      }

      if (type === 'done') {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_DURATION - elapsed);

        startTransition(() => {
          setReportData(e.data.reportData);
          setWarnings(e.data.warnings);
        });

        setTimeout(() => {
          onReady();
          worker.terminate();
        }, remaining);
      }
    };

    return () => worker.terminate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent, fileName, selectedTemplate]);

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    const newIndex = Math.floor(scrollTop / ROW_HEIGHT);
    setStartIndex(newIndex);
  };

  const template = getTemplateById(selectedTemplate);
  const visibleData = reportData.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Table className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Data Preview
        </h3>
      </div>

      {isProcessing ? (
        <LoadingOverlay />
      ) : isPending ? (
        <LoadingOverlay />
      ) : !template || reportData.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No data to display. Try selecting a different template or uploading a
          file.
        </div>
      ) : (
        <Panel className="!p-0 overflow-hidden">
          <div
            className="overflow-auto max-h-[82vh] scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            <table className="min-w-full table-fixed">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {template.fields.map((field: CWRTemplateField) => (
                    <th
                      key={field.label}
                      style={{ minWidth: field.width, maxWidth: field.width }}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {startIndex > 0 && (
                  <tr style={{ height: `${startIndex * ROW_HEIGHT}px` }}>
                    <td colSpan={template.fields.length}></td>
                  </tr>
                )}

                {visibleData.map((record, index) => (
                  <tr
                    key={startIndex + index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {template.fields.map((field) => (
                      <td
                        key={field.label}
                        style={{
                          minWidth: field.width,
                          maxWidth: field.width,
                        }}
                        className="px-6 py-2 text-sm text-gray-900 dark:text-gray-100 truncate"
                      >
                        {record.get(field.key)}
                      </td>
                    ))}
                  </tr>
                ))}

                {startIndex + PAGE_SIZE < reportData.length && (
                  <tr
                    style={{
                      height: `${
                        (reportData.length - startIndex - PAGE_SIZE) *
                        ROW_HEIGHT
                      }px`,
                    }}
                  >
                    <td colSpan={template.fields.length}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>
                <span className="text-emerald-500">{reportData.length}</span>
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
                <span>{template.name}</span>{' '}
                <span className="text-blue-500">v{template.version}</span>
              </span>
            </div>
          </div>
        </Panel>
      )}
      <WarningModal
        warnings={warnings}
        showWarnings={showWarnings}
        setShowWarnings={setShowWarnings}
      />
    </>
  );
};

export default TableView;
