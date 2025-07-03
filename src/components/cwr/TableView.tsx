import React, { useState, useEffect, useRef } from 'react';
import { generateReactKey } from '@/utils/generateReactKeys';
import { CWRTemplate, CWRTemplateField } from '@/types';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { Table } from 'lucide-react';
import ReportWorker from '@/workers/reportWorker?worker';
import { analytics } from '@/firebase';
import { logEvent } from 'firebase/analytics';

const ROW_HEIGHT = 36;
const PAGE_SIZE = 50;

interface TableViewProps {
  fileName: string;
  fileContent: string;
  selectedTemplate: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  reportData: Map<string, string | number>[];
  setReportData: React.Dispatch<
    React.SetStateAction<Map<string, string | number>[]>
  >;
}

export const TableView: React.FC<TableViewProps> = ({
  fileName,
  fileContent,
  selectedTemplate,
  isProcessing,
  setIsProcessing,
  reportData,
  setReportData,
}) => {
  const [template, setTemplate] = useState<CWRTemplate | undefined>(undefined);
  const [startIndex, setStartIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEvent(analytics, 'cwr_report_viewed', { report: selectedTemplate });
    const MIN_DURATION = 500; // ms
    const start = Date.now();
    setIsProcessing(true);

    const worker = new ReportWorker();
    worker.postMessage({ fileContent, fileName, selectedTemplate });

    worker.onmessage = (e) => {
      const { template, reportData, error } = e.data;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      if (error) {
        console.error('Worker Error:', error);
        setIsProcessing(false);
        worker.terminate();
        return;
      }

      setTemplate(template);
      setReportData(reportData);

      setTimeout(() => {
        setIsProcessing(false);
        worker.terminate();
      }, remaining);
    };

    return () => worker.terminate();
  }, [fileContent, fileName, selectedTemplate, setIsProcessing, setReportData]);

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    const newIndex = Math.floor(scrollTop / ROW_HEIGHT);
    setStartIndex(newIndex);
  };

  const visibleData = reportData.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Table className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isProcessing ? (
          <LoadingOverlay message={'Rendering Template...'} />
        ) : !template || reportData.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No data to display. Try selecting a different template or uploading
            a file.
          </div>
        ) : (
          <>
            <div
              className="overflow-auto min-h-[650px] h-[82vh]"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    {template.fields.map((field: CWRTemplateField) => (
                      <th
                        key={field.label}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Top Spacer */}
                  {startIndex > 0 && (
                    <tr style={{ height: `${startIndex * ROW_HEIGHT}px` }}>
                      <td colSpan={template.fields.length}></td>
                    </tr>
                  )}

                  {/* Visible Rows */}
                  {visibleData.map((record, index) => (
                    <tr
                      key={startIndex + index}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      {Array.from(record.entries()).map(([key, value]) => (
                        <td
                          key={generateReactKey(key)}
                          className="px-6 py-2 text-sm text-gray-900 max-w-xs truncate"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Bottom Spacer */}
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
                  {` records • `}
                  <span className="text-red-500">{0}</span>
                  {` errors • `}
                  <span className="text-amber-500">{0}</span>
                  {` warnings`}
                </span>
                <span>
                  <span>{template.name}</span>{' '}
                  <span className="text-blue-500">v{template?.version}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
