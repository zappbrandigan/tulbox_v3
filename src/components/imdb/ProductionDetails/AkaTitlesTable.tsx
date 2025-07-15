import { LoadingOverlay } from '@/components/ui';
import { AKATitle } from '@/types';
import { showToast } from '@/utils';
import { Globe } from 'lucide-react';

interface AkaTitlesTableProps {
  akaTitles: AKATitle[];
  isLoadingAkas: boolean;
}

const AkaTitlesTable: React.FC<AkaTitlesTableProps> = ({
  akaTitles,
  isLoadingAkas,
}) => {
  if (isLoadingAkas) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <LoadingOverlay message="Detecting AKA Languages..." />
      </div>
    );
  }

  if (!akaTitles) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        <Globe className="w-5 h-5 mr-2" />
        International Titles
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Transliterated Title', 'Article', 'Language', 'Type'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {akaTitles?.map((aka, index) => (
              <tr
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${aka.transliterated}\t${aka.article}\t${aka.type}\t${aka.language}`
                  );
                  showToast();
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer transition-colors"
              >
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-mono">
                  {aka.transliterated}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {aka.article}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {aka.language}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {aka.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AkaTitlesTable;
