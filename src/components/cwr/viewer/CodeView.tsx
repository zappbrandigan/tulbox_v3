import React, { useState } from 'react';
import { Code } from 'lucide-react';
import { CWRConverterRecord, CWRParsedRecord } from 'cwr-parser/types';
import { getTemplateById } from '@/utils';
import Header from './Header';
import Footer from './Footer';
import ScrollArea from './ScrollArea';

interface CodeViewProps {
  lines: CWRParsedRecord<Map<string, string>>[] | undefined;
  selectedTemplate: string;
  parseResult: CWRConverterRecord | null;
}

const CodeView: React.FC<CodeViewProps> = ({
  lines,
  selectedTemplate,
  parseResult,
}) => {
  const template = getTemplateById(selectedTemplate);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

  if (!lines) return null;

  return (
    <>
      <div className="flex items-center space-x-2">
        <Code className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {`Raw File Content (${parseResult?.statistics?.totalRecords} lines)`}
        </h3>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Header
          setShowSearch={setShowSearch}
          setIsFullScreen={setIsFullScreen}
          setIsTooltipEnabled={setIsTooltipEnabled}
          isTooltipEnabled={isTooltipEnabled}
          totalRecords={parseResult?.statistics?.totalRecords ?? 0}
          fileName={parseResult?.fileName ?? 'Unknown'}
        />

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
          cwrFileVersion={parseResult?.version ?? '0.0.0'}
        />
      </div>
    </>
  );
};

export default CodeView;
