import { SortConfig } from '@/types';
import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSortableData<TItem, TKey extends keyof TItem>(
  items: TItem[],
  initialSort: SortConfig<TKey> | null = null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<TKey> | null>(
    initialSort
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase() as any;
      if (typeof bVal === 'string') bVal = bVal.toLowerCase() as any;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  const requestSort = (key: TKey) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' }
    );
  };

  return { sortedItems, sortConfig, requestSort };
}
