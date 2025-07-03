import React, { useState, useEffect, useRef } from 'react';
import { RecordLine } from '../cwr/RecordLine';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { Code } from 'lucide-react';
import { CWRConverterRecord, CWRParsedRecord } from 'cwr-parser/types';
import { getTemplateById } from '@/utils/cwrTemplates';
import ParserWorker from '@/workers/parserWorker?worker';

const ROW_HEIGHT = 24;
const PAGE_SIZE = 50;

interface CodeViewProps {
  fileContent: string;
  file: string;
  selectedTemplate: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  parseResult: CWRConverterRecord | null;
  setParseResult: React.Dispatch<
    React.SetStateAction<CWRConverterRecord | null>
  >;
}

export const CodeView: React.FC<CodeViewProps> = ({
  fileContent,
  file,
  selectedTemplate,
  isProcessing,
  setIsProcessing,
  parseResult,
  setParseResult,
}) => {
  const template = getTemplateById(selectedTemplate);
  const [lines, setLines] = useState<CWRParsedRecord<Map<string, string>>[]>(
    []
  );
  const [startIndex, setStartIndex] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const MIN_DURATION = 500; // ms
    const start = Date.now();
    setIsProcessing(true);

    const worker = new ParserWorker();
    worker.postMessage({ fileContent, file });

    worker.onmessage = (e) => {
      const result: CWRConverterRecord = e.data;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      setParseResult(result);
      setLines(result.lines);

      setTimeout(() => {
        setIsProcessing(false);
        worker.terminate();
      }, remaining);
    };

    return () => worker.terminate(); // Clean up if component unmounts
  }, [fileContent, file, setIsProcessing, setParseResult]);

  // Update visible lines on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = scrollContainerRef.current?.scrollTop || 0;
      const newIndex = Math.floor(scrollTop / ROW_HEIGHT);
      setStartIndex(newIndex);
    };

    const ref = scrollContainerRef.current;
    if (ref) {
      ref.addEventListener('scroll', onScroll);
    }

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', onScroll);
      }
    };
  }, []);

  if (!parseResult) return null;

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {`Raw File Content (${parseResult?.statistics?.totalRecords} lines)`}
        </h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isProcessing ? (
          <LoadingOverlay message={'Rendering Raw Viewer...'} />
        ) : (
          <>
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  CWR File Records
                </h4>
                <span className="text-xs text-gray-500">
                  {parseResult?.statistics?.totalRecords} lines •{' '}
                  {parseResult?.fileName}
                </span>
              </div>
            </div>

            {/* Virtualized Scroll Area */}
            <div className="bg-gray-900 text-gray-100 overflow-hidden">
              <div
                className="min-h-[600px] h-[73vh] overflow-auto"
                ref={scrollContainerRef}
                onScroll={() => {
                  const scrollTop = scrollContainerRef.current?.scrollTop || 0;
                  const newIndex = Math.floor(scrollTop / ROW_HEIGHT);
                  setStartIndex(newIndex);
                }}
              >
                <div
                  className="relative font-mono text-sm"
                  style={{ height: lines.length * ROW_HEIGHT }}
                >
                  <div
                    className="absolute top-0 left-0 right-0"
                    style={{
                      transform: `translateY(${startIndex * ROW_HEIGHT}px)`,
                    }}
                  >
                    {lines
                      .slice(startIndex, startIndex + PAGE_SIZE)
                      .map((line, i) => {
                        const actualIndex = startIndex + i;
                        const recordType = line.recordType ?? '';
                        const spacingRecords = [
                          'HDR',
                          'GRH',
                          'GRT',
                          'TRL',
                          'NWR',
                          'REV',
                          'ACK',
                        ];
                        const addMarginTop =
                          spacingRecords.includes(recordType);

                        return (
                          <div
                            key={actualIndex}
                            className={`flex transition-colors ${
                              addMarginTop ? 'mt-3' : ''
                            } hover:bg-gray-600`}
                            style={{ height: `${ROW_HEIGHT}px` }}
                          >
                            <div className="flex-shrink-0 w-12 px-3 py-1 text-gray-500 text-right border-r border-gray-700 bg-gray-800 select-none">
                              {actualIndex + 1}
                            </div>
                            <div className="flex-1 px-3 py-1 whitespace-nowrap">
                              <RecordLine line={line.data} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  <span className="text-emerald-500">
                    {parseResult?.statistics?.totalRecords}
                  </span>
                  {` records • `}
                  <span className="text-red-500">
                    {parseResult?.statistics?.errors.length}
                  </span>
                  {` errors • `}
                  <span className="text-amber-500">
                    {parseResult?.statistics?.warnings.length}
                  </span>
                  {` warnings`}
                </span>
                <span>
                  CWR v{Number(parseResult.version)} format •{' '}
                  {`${template?.name} `}
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
