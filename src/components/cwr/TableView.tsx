import React, { useState, useEffect, useRef, useTransition } from 'react';
import { getTemplateById, trackEvent } from '@/utils';
import { CWRTemplateField } from '@/types';
import { Table } from 'lucide-react';
import ReportWorker from '@/workers/reportWorker?worker';
import { Progress } from '@/components/ui';

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
  onProgress: (pct: number) => void;
  onReady: () => void;
}

const TableView: React.FC<Props> = ({
  fileName,
  fileContent,
  selectedTemplate,
  reportData,
  setReportData,
  isProcessing,
  progress,
  onProgress,
  onReady,
}) => {
  const [startIndex, setStartIndex] = useState(0);

  const [isPending, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fileContent) return;
    trackEvent('cwr_report_viewed', { report: selectedTemplate });

    const MIN_DURATION = 500;
    const start = Date.now();

    onProgress(0);
    setReportData([]); // clear old rows

    const worker = new ReportWorker();
    worker.postMessage({
      type: 'generate',
      fileContent,
      fileName,
      selectedTemplate,
      chunk: 4_000,
    });

    worker.onmessage = (e) => {
      const { type } = e.data as { type: string };
      if (type === 'progress') {
        onProgress(Math.min(e.data.pct, 0.99));
        return;
      }

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
        });

        setTimeout(() => {
          onProgress(100);
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
        <Table className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isProcessing ? (
          <Progress
            progress={progress}
            message={progress > 0.95 ? 'Loading Table' : 'Generating Report'}
          />
        ) : isPending ? (
          <Progress progress={1} message="Rendering" />
        ) : !template || reportData.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No data to display. Try selecting a different template or uploading
            a file.
          </div>
        ) : (
          <>
            <div
              className="overflow-auto max-h-[82vh]"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              <table className="min-w-full table-fixed">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    {template.fields.map((field: CWRTemplateField) => (
                      <th
                        key={field.label}
                        style={{ minWidth: field.width, maxWidth: field.width }}
                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide`}
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {startIndex > 0 && (
                    <tr style={{ height: `${startIndex * ROW_HEIGHT}px` }}>
                      <td colSpan={template.fields.length}></td>
                    </tr>
                  )}

                  {visibleData.map((record, index) => (
                    <tr
                      key={startIndex + index}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      {template.fields.map((field) => (
                        <td
                          key={field.label}
                          style={{
                            minWidth: field.width,
                            maxWidth: field.width,
                          }}
                          className="px-6 py-2 text-sm text-gray-900 min-w-xs max-w-xs truncate"
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

            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  <span className="text-emerald-500">{reportData.length}</span>
                  {` rows • `}
                  <span className="text-red-500">{0}</span>
                  {` errors • `}
                  <span className="text-amber-500">{0}</span>
                  {` warnings`}
                </span>
                <span>
                  <span>{template.name}</span>{' '}
                  <span className="text-blue-500">v{template.version}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TableView;
