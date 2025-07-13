import React, { useState, useEffect } from 'react';
import { LoadingOverlay } from '@/components/ui';
import { Code } from 'lucide-react';
import { CWRConverterRecord, CWRParsedRecord } from 'cwr-parser/types';
import { getTemplateById } from '@/utils';
import ParserWorker from '@/workers/parserWorker?worker';
import Header from './Header';
import Footer from './Footer';
import ScrollArea from './ScrollArea';

// const ROW_HEIGHT = 24;
// const PAGE_SIZE = 50;

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

const CodeView: React.FC<CodeViewProps> = ({
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

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

    return () => worker.terminate();
  }, [fileContent, file, setIsProcessing, setParseResult]);

  if (!parseResult) return null;

  return (
    <>
      <div className="flex items-center space-x-2">
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
            <Header
              setShowSearch={setShowSearch}
              setIsFullScreen={setIsFullScreen}
              setIsTooltipEnabled={setIsTooltipEnabled}
              isTooltipEnabled={isTooltipEnabled}
              totalRecords={parseResult?.statistics?.totalRecords ?? 0}
              fileName={parseResult?.fileName}
            />

            {/* Virtualized Scroll Area */}
            <ScrollArea
              lines={lines}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              isTooltipEnabled={isTooltipEnabled}
              setIsTooltipEnabled={setIsTooltipEnabled}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />

            <Footer
              totalRecords={parseResult?.statistics?.totalRecords ?? 0}
              errorCount={parseResult?.statistics?.errors.length ?? 0}
              warningCount={parseResult?.statistics?.warnings.length ?? 0}
              templateName={template?.name ?? 'Unknown'}
              templateVersion={template?.version ?? '0.0.0'}
              cwrFileVersion={parseResult.version ?? '0.0.0'}
            />
          </>
        )}
      </div>
    </>
  );
};

export default CodeView;
