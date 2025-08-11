import { SortConfig } from '@/types';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

interface SortableHeaderProps<T extends string> {
  label: string;
  columnKey: T;
  sortConfig: SortConfig<T> | null;
  onSort: (key: T) => void;
}

const SortableHeader = <T extends string>({
  label,
  columnKey,
  sortConfig,
  onSort,
}: SortableHeaderProps<T>) => {
  const isActive = sortConfig?.key === columnKey;
  const direction = sortConfig?.direction;

  return (
    <th
      scope="col"
      onClick={() => onSort(columnKey)}
      aria-sort={
        isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none relative group ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-300'
      }`}
    >
      <div className="inline-flex items-center space-x-1">
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="size-4" />
          ) : (
            <ArrowDown className="size-4" />
          )
        ) : (
          <ArrowUpDown className="size-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
