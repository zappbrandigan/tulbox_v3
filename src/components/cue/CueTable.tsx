import { CueSheetTemplate, FileItem } from '@/types';
import { CueRow } from '@/utils/cue/types';
import React from 'react';
interface Props {
  cueRows: CueRow[];
  template: CueSheetTemplate | undefined;
  files: FileItem[];
  warnings: string[];
  setShowWarnings: React.Dispatch<React.SetStateAction<boolean>>;
}

const CueTable: React.FC<Props> = ({
  cueRows,
  template,
  files,
  warnings,
  setShowWarnings,
}) => {
  if (cueRows.length === 0) return null;
  const maxWriters = Math.max(...cueRows.map((row) => row.writers.length));
  return (
    <>
      <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-auto max-h-[82vh] rounded-t-xl">
          <table className="min-w-full table-fixed text-sm text-left">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold">
              <tr>
                {template?.fields.map((field) => (
                  <th
                    key={field.key}
                    style={{
                      minWidth: field.width,
                      maxWidth: field.width,
                    }}
                    className={`px-4 py-3 whitespace-nowrap w-[${field.width}px]`}
                  >
                    {field.label}
                  </th>
                ))}

                {template?.repeatGroup &&
                  Array.from({ length: maxWriters }).map((_, i) => (
                    <React.Fragment key={`writer-block-${i}`}>
                      {template.repeatGroup.subfields.map((sub) => (
                        <th
                          key={`${sub.key}-${i}`}
                          style={{
                            minWidth: sub.width,
                            maxWidth: sub.width,
                          }}
                          className={`px-4 py-3 whitespace-nowrap w-[${sub.width}px]`}
                        >
                          {sub.label} {i + 1}
                        </th>
                      ))}
                    </React.Fragment>
                  ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {cueRows.map((row, rowIndex) => (
                <tr key={`cue-row-${rowIndex}`}>
                  {template?.fields.map((field) => (
                    <td
                      key={field.key}
                      style={{
                        minWidth: field.width,
                        maxWidth: field.width,
                      }}
                      className={`px-4 py-2 truncate whitespace-pre uppercase w-[${field.width}px]`}
                    >
                      {String(row[field.key as keyof typeof row] ?? '')}
                    </td>
                  ))}

                  {template?.repeatGroup &&
                    Array.from({ length: maxWriters }).map((_, i) => {
                      const writer = row.writers[i];
                      return (
                        <React.Fragment key={`writer-data-${i}`}>
                          {template.repeatGroup.subfields.map((sub) => (
                            <td
                              key={`${sub.key}-${i}-${rowIndex}`}
                              style={{
                                minWidth: sub.width,
                                maxWidth: sub.width,
                              }}
                              className={`px-4 py-2 truncate uppercase w-[${sub.width}px]`}
                            >
                              {writer?.[sub.key as keyof typeof writer] ?? ''}
                            </td>
                          ))}
                        </React.Fragment>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>
              <span className="text-emerald-500">{files.length}</span>
              {` ${files.length > 1 ? 'files' : 'file'} • `}
              <span className="text-blue-500">{cueRows.length}</span>
              {` rows`}
              {warnings.length > 0 && (
                <>
                  {` • `}
                  <span
                    onClick={() => setShowWarnings(true)}
                    className="ml-1 px-1.5 py-0.5 text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300 rounded hover:text-amber-700 hover:underline cursor-pointer transition"
                    title="Click to view warnings"
                  >
                    ⚠ {warnings.length} warning
                    {warnings.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </span>
            <span>
              <span>{template?.name} Converter</span>{' '}
              <span className="text-blue-500">v{template?.version}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CueTable;
