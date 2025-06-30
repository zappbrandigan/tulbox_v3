import { CWR_TEMPLATES, getTemplateById } from '@/utils/cwrTemplates';
import { Download, Settings, Trash } from 'lucide-react';
import React, { useRef } from 'react';

interface TemplateBoxProps {
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
  handleFileRemove: () => void;
  handleExport: (format: 'csv' | 'json' | 'xlsx') => void;
}

export const TemplateBox: React.FC<TemplateBoxProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  handleFileRemove,
  handleExport,
}) => {
  const selectRef = useRef(null);

  const handleSelect = (value: string) => {
    setSelectedTemplate(value);
    if (selectRef.current) {
      (selectRef.current as HTMLSelectElement).blur();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleSelect(e.target.value)}
              ref={selectRef}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CWR_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleFileRemove()}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Trash className="w-4 h-4 mr-2" />
            Clear
          </button>

          {selectedTemplate !== 'raw-viewer' && (
            <>
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Template Description */}
      {(() => {
        const template = getTemplateById(selectedTemplate);
        return template ? (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{template.description}</p>
          </div>
        ) : null;
      })()}
    </div>
  );
};
