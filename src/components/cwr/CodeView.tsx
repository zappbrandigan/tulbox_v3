import React, { useState, useEffect } from 'react';
import { RecordLine } from '../cwr/RecordLine';
import { CWRConverter } from '../../utils/cwrConverter';
import { CWRInitialParseResult } from '../../types/cwrTypes';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { Code } from 'lucide-react';


interface CodeViewProps {
  fileContent: string;
  file: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  parseResult: CWRInitialParseResult | null;
  setParseResult: React.Dispatch<React.SetStateAction<CWRInitialParseResult | null>>;
}

export const CodeView: React.FC<CodeViewProps> = ({ 
  fileContent, 
  file, 
  isProcessing, 
  setIsProcessing,
  parseResult,
  setParseResult
 }) => {
  const [lines, setLines] = useState<Map<string, string>[]>([]);

  useEffect(() => {
    setIsProcessing(true);
    console.log('viewer effect')
    
    setTimeout(() => {
      const result = CWRConverter.convertFile(fileContent, file); 
      const lines = CWRConverter.flattenRecords(result.transmission);
      setParseResult(result);
      setLines(lines);
      setIsProcessing(false);
    }, 500);

  }, [fileContent, file, setIsProcessing, setParseResult]);
  
  if (!parseResult) return null;

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {`Raw File Content (${parseResult?.recordCount} lines)`}
        </h3>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isProcessing ? (
          <LoadingOverlay message={"Rendering Raw Viewer..."} />
        ) : (
            <>
            {/* Header with record type legend */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">CWR File Records</h4>
                <span className="text-xs text-gray-500">
                  {parseResult?.recordCount} lines • {parseResult?.fileName}
                </span>
              </div>
            </div>

            {/* Code Section */}
            <div className="bg-gray-900 text-gray-100 overflow-hidden">
              <div className="max-h-[650px] overflow-auto">
                <div className="font-mono text-sm">
                  {lines.map((line, index) => {
                    const recordType = line.get('recordType') ?? '';
                    const spacingRecords = ['HDR', 'GRH', 'NWR', 'REV']; // space before these types
                    const addMarginTop = spacingRecords.includes(recordType);

                    return (
                      <div
                        key={index}
                        className={`flex transition-colors ${addMarginTop ? 'mt-3' : ''} hover:bg-gray-600`}
                      >
                        <div className="flex-shrink-0 w-12 px-3 py-1 text-gray-500 text-right border-r border-gray-700 bg-gray-800 select-none">
                          {index + 1}
                        </div>

                        <div className="flex-1 px-3 py-1 whitespace-nowrap">
                          <RecordLine line={line} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer with stats */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {parseResult?.recordCount} records • {parseResult?.transactionCount} transactions parsed
                </span>
                <span>
                  CWR v2.1 format
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </> 
  );
};