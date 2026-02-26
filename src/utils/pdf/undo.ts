import type { FileItem } from '@/types';

export type ApplySnapshot = Record<
  string,
  Pick<FileItem, 'currentName' | 'characterCount' | 'status'>
>;

export const createApplySnapshot = (files: FileItem[]): ApplySnapshot =>
  Object.fromEntries(
    files.map((file) => [
      file.id,
      {
        currentName: file.currentName,
        characterCount: file.characterCount,
        status: file.status,
      },
    ])
  );

export const restoreFromApplySnapshot = (
  files: FileItem[],
  snapshot: ApplySnapshot
): FileItem[] =>
  files.map((file) => {
    const original = snapshot[file.id];
    if (!original) return file;
    return {
      ...file,
      currentName: original.currentName,
      characterCount: original.characterCount,
      status: original.status,
    };
  });

