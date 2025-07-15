import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { CWRConverterRecord } from 'cwr-parser/types';

interface SummaryProps {
  parseResult: CWRConverterRecord | null;
}

const ParseSummary: React.FC<SummaryProps> = ({ parseResult }) => {
  if (!parseResult) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Parse Results
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Parsed on {new Date().toDateString()}
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Sender */}
        <div className="flex flex-col justify-center items-center text-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <div
            className="text-sm font-bold text-amber-600 dark:text-amber-300 truncate overflow-hidden whitespace-nowrap w-full max-w-[180px] sm:max-w-none"
            title={parseResult.lines[0].data.get('senderName')}
          >
            {parseResult.lines[0].data.get('senderName')}
          </div>
          <div className="text-sm text-amber-800 dark:text-amber-400">
            Sender
          </div>
        </div>

        {/* New Works */}
        <div className="flex flex-col justify-center items-center text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            {parseResult.statistics?.recordCounts.NWR}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-400">
            New Works
          </div>
        </div>

        {/* Revised Works */}
        <div className="flex flex-col justify-center items-center text-center p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {parseResult.statistics?.recordCounts.REV}
          </div>
          <div className="text-sm text-emerald-800 dark:text-emerald-400">
            Revised Works
          </div>
        </div>

        {/* Total Records */}
        <div className="flex flex-col justify-center items-center text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            {parseResult.statistics?.totalRecords}
          </div>
          <div className="text-sm text-purple-800 dark:text-purple-400">
            Total Records
          </div>
        </div>
      </div>

      {/* Errors */}
      {(parseResult.statistics?.errors?.length ?? 0) > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300" />
            <h4 className="font-medium text-red-900 dark:text-red-200">
              Parse Errors ({parseResult.statistics?.errors?.length ?? 0})
            </h4>
          </div>
          <div className="max-h-32 overflow-y-auto">
            {parseResult.statistics?.errors.map((error, index) => (
              <div
                key={index}
                className="text-sm text-red-700 dark:text-red-300 mb-1"
              >
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParseSummary;
