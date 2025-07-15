import { CWR_TEMPLATES, getTemplateById } from '@/utils';
import { Download, Settings, Trash, Loader2 } from 'lucide-react';

interface TemplateBoxProps {
  selectedTemplate: string;
  setSelectedTemplate: (next: string) => void;
  isProcessing: boolean;
  isDownloading: boolean;
  handleFileRemove: () => void;
  handleExport: (format: 'csv' | 'json') => void;
  reportHasData: boolean;
}

const TemplateBox: React.FC<TemplateBoxProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  isProcessing,
  isDownloading,
  handleFileRemove,
  handleExport,
  reportHasData,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        {/* Settings & Template Dropdown */}
        <div className="flex items-center space-x-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <div>
            <label
              htmlFor="template-menu"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Output Template
            </label>
            <select
              id="template-menu"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {CWR_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            disabled={isProcessing || isDownloading}
            onClick={handleFileRemove}
            className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Trash className="w-4 h-4 mr-2" />
            Clear
          </button>

          {selectedTemplate !== 'raw-viewer' && (
            <button
              disabled={isProcessing || isDownloading || !reportHasData}
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Template Description */}
      {(() => {
        const template = getTemplateById(selectedTemplate);
        return template ? (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {template.description}
            </p>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default TemplateBox;
