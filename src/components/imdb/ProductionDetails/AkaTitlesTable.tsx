import { LoadingOverlay } from '@/components/ui';
import { AKATitle } from '@/types';
import { useToast } from '@/stores/toast';
import { Copy, Globe } from 'lucide-react';
import { useSortableData } from '@/hooks';
import SortableHeader from '@/components/ui/SortableHeader';

interface AkaTitlesTableProps {
  akaTitles: AKATitle[];
  isLoadingAkas: boolean;
}

interface AkaTableItem {
  transliterated: string;
  article: string;
  type: string;
  language: string;
}

const AkaTitlesTable: React.FC<AkaTitlesTableProps> = ({
  akaTitles,
  isLoadingAkas,
}) => {
  const { toast } = useToast();
  const {
    sortedItems: sortedAkas,
    sortConfig,
    requestSort,
  } = useSortableData<
    AkaTableItem,
    'transliterated' | 'article' | 'type' | 'language'
  >(akaTitles);
  if (isLoadingAkas) {
    return <LoadingOverlay message="Detecting AKA Languages..." />;
  }

  if (akaTitles.length === 0 || !akaTitles) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          International Titles
        </h3>
        <div className="flex justify-center text-gray-500 dark:text-gray-400 text-sm italic">
          No Alternative Titles Found
        </div>
      </div>
    );
  }

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
              <SortableHeader
                label="Transliterated Title"
                columnKey="transliterated"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label="Article"
                columnKey="article"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label="Language"
                columnKey="language"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label="Type"
                columnKey="type"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-medium">
            {sortedAkas?.map((aka, index) => (
              <tr
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${aka.transliterated}\t${aka.article}\t${aka.type}\t${aka.language}`
                  );
                  toast({
                    description: 'Copied to clipboard!',
                    variant: 'success',
                  });
                }}
                className="group hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer transition-colors"
              >
                <td className="px-6 py-2 text-xs text-gray-700 dark:text-gray-200">
                  {aka.transliterated}
                </td>
                <td className="px-6 py-2 text-xs text-gray-700 dark:text-gray-200">
                  {aka.article}
                </td>
                <td className="px-6 py-2 text-xs text-gray-700 dark:text-gray-200">
                  {aka.language}
                </td>
                <td className="flex px-6 py-2 text-xs text-gray-700 dark:text-gray-200">
                  <span>{aka.type}</span>
                  <button className="opacity-0 ml-auto group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100">
                    <Copy className="size-4" />
                  </button>
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
