import React, { useState, useEffect } from 'react';
import { generateReactKey } from '@/utils/generateReactKeys';
import { CWRTemplate, CWRTemplateField } from '@/types/cwrTypes';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { CWRParser } from 'cwr-parser';
import { templateReportGenerators } from '@/constants/templateRegistry';
import { getTemplateById } from '@/utils/cwrTemplates';
import { Table } from 'lucide-react';

interface TableViewProps {
  fileName: string;
  fileContent: string;
  selectedTemplate: string;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  reportData: Map<string, string | number>[];
  setReportData: React.Dispatch<React.SetStateAction<Map<string, string | number>[]>>;
}

export const TableView: React.FC<TableViewProps> = ({ 
  fileName,
  fileContent, 
  selectedTemplate, 
  isProcessing, 
  setIsProcessing,
  reportData,
  setReportData
}) => {
  const [template, setTemplate] = useState<CWRTemplate | undefined>(undefined);
  
  useEffect(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const parser = new CWRParser();
      const parsedData = parser.parseString(fileContent, fileName);
      const template = getTemplateById(selectedTemplate);
      const generator = template && templateReportGenerators[template.id];
      const result = generator ? generator(parsedData, template) : [];
      setTemplate(template)
      setReportData(result);
      setIsProcessing(false);
    }, 500);
  }, [fileContent, setIsProcessing, selectedTemplate, setReportData, fileName]);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Table className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {isProcessing ? (
        <LoadingOverlay message={"Rendering Template..."} />
      ) : !template || reportData.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No data to display. Try selecting a different template or uploading a file.
        </div>
      ) : (
        <>
        <div className="overflow-auto max-h-[660px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[660px]">
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
                  ))
                }
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors overflow-hidden">
                  {Array.from(record.entries()).map(([key, value]) => (
                    <td key={generateReactKey(key)} className="px-6 py-2 text-sm text-gray-900 max-w-xs truncate">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      </div>
    </>
  );
};