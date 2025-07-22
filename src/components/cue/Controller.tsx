import { Download, Settings, Trash } from 'lucide-react';
import { Panel } from '../ui';
import { DropdownSelector } from '../ui/DropDownSelector';
import CUE_SHEET_FORMATS from '@/utils/cue/templates';
import { CueRow } from '@/utils/cue/types';

interface Props {
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
  isProcessing: boolean;
  cueRows: CueRow[];
  handleClearAll: () => void;
  handleExport: () => void;
  convertCueSheet: () => Promise<void>;
  isVisible: boolean;
}
const Controller: React.FC<Props> = ({
  selectedTemplate,
  setSelectedTemplate,
  isProcessing,
  cueRows,
  handleClearAll,
  handleExport,
  convertCueSheet,
  isVisible,
}) => {
  if (!isVisible) return null;
  const template = CUE_SHEET_FORMATS.find((f) => f.id === selectedTemplate);

  return (
    <Panel>
      <Panel.Header>
        <div className="flex items-center space-x-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <DropdownSelector
            id="cue-format"
            label="Cue Sheet Format"
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            options={CUE_SHEET_FORMATS}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            disabled={isProcessing}
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Trash className="w-4 h-4 mr-2" />
            Clear
          </button>
          {cueRows.length === 0 && (
            <button
              disabled={isProcessing}
              onClick={() => convertCueSheet()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Convert
            </button>
          )}
          {cueRows.length > 0 && (
            <button
              disabled={isProcessing}
              onClick={() => handleExport()}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </Panel.Header>

      {template && (
        <Panel.Body>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {template.description}
            </p>
          </div>
        </Panel.Body>
      )}
    </Panel>
  );
};

export default Controller;
