import React, { useEffect, useState } from "react";
import { Code } from "lucide-react";
import { CWRConverterRecord } from "cwr-parser/types";
import Header from "./Header";
import Footer from "./Footer";
import ScrollArea from "./ScrollArea";
import ParserWorker from "@/workers/parserWorker?worker";

interface Props {
  file: string;
  fileContent: string;
  selectedTemplate: string;
  parseResult: CWRConverterRecord | null;
  setParseResult: React.Dispatch<
    React.SetStateAction<CWRConverterRecord | null>
  >;
  isProcessing: boolean;
  startTransition: React.TransitionStartFunction;
  onProgress: (pct: number) => void;
  onReady: () => void;
  setShowMemoryError: React.Dispatch<React.SetStateAction<boolean>>;
}

const CodeView: React.FC<Props> = ({
  file,
  fileContent,
  selectedTemplate,
  parseResult,
  setParseResult,
  isProcessing,
  startTransition,
  onProgress,
  onReady,
  setShowMemoryError,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

  useEffect(() => {
    if (!fileContent) return;

    if (parseResult) {
      onProgress(100);
      onReady();
      return;
    }

    const MIN_DURATION = 300;
    const startTime = Date.now();

    onProgress(0);
    // setParseResult(null);

    const worker = new ParserWorker();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    worker.postMessage({ type: "parse", fileContent, file, chunk: 1_500 });

    worker.onmessage = (e) => {
      switch (e.data.type) {
        case "progress":
          onProgress(Math.min(e.data.pct, 99));
          break;

        case "error":
          worker.terminate();
          setShowMemoryError(true);
          onReady();
          return;

        case "done": {
          const elapsed = Date.now() - startTime;
          const delay = Math.max(0, MIN_DURATION - elapsed);

          timeoutId = setTimeout(() => {
            startTransition(() => {
              setParseResult(e.data.result);
            });
            onProgress(100);
            onReady();
          }, delay);
          worker.terminate();
          break;
        }
      }
    };

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      worker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, fileContent]);

  if (!parseResult) return null;

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {`Raw File Content (${parseResult?.statistics?.totalRecords} lines)`}
        </h3>
      </div>

      {/* Scrollable Container */}
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {!isProcessing && (
          <>
            <Header
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              isTooltipEnabled={isTooltipEnabled}
              setIsTooltipEnabled={setIsTooltipEnabled}
              totalRecords={parseResult?.statistics?.totalRecords ?? 0}
              fileName={parseResult?.fileName ?? "Unknown"}
            />

            <ScrollArea
              lines={parseResult?.lines ?? []}
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
              templateId={selectedTemplate}
              cwrFileVersion={parseResult?.version ?? "0.0.0"}
            />
          </>
        )}
      </div>
    </>
  );
};

export default CodeView;
