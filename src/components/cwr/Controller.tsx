import { CWR_TEMPLATES, getTemplateById } from '@/utils';
import { Download, Settings, Trash, Loader2 } from 'lucide-react';
import { DropdownSelector } from '../ui/DropDownSelector';
import { Panel } from '../ui';

interface TemplateBoxProps {
  selectedTemplate: string;
  setSelectedTemplate: (next: string) => void;
  isProcessing: boolean;
  isDownloading: boolean;
  handleFileRemove: () => void;
  handleExport: (format: 'csv') => void;
  reportHasData: boolean;
}

const Controller: React.FC<TemplateBoxProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  isProcessing,
  isDownloading,
  handleFileRemove,
  handleExport,
  reportHasData,
}) => {
  return (
    <Panel>
      <Panel.Header>
        <div className="flex items-center space-x-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {/* Settings & Template Dropdown */}
          <DropdownSelector
            id="template-menu"
            label="Output Template"
            icon={
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            }
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            options={CWR_TEMPLATES}
          />
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
      </Panel.Header>

      {/* Template Description */}
      <Panel.Body>
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
      </Panel.Body>
    </Panel>
  );
};

export default Controller;
