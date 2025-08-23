import { FileItem, SearchReplaceRule } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dotifyTitleGeneric from './dotify';
import { useToastStore } from '@/stores/toast';

const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const validateFileName = (name: string): boolean => {
  // Check for invalid characters in file names
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(name) && name.trim().length > 0;
};

const checkForDuplicates = (files: FileItem[]): FileItem[] => {
  const nameCounts = files.reduce((map, file) => {
    map.set(file.currentName, (map.get(file.currentName) || 0) + 1);
    return map;
  }, new Map<string, number>());

  return files.map((file) => {
    if (!validateFileName(file.currentName)) {
      return { ...file, status: 'invalid' };
    }
    if (nameCounts.get(file.currentName)! > 1) {
      return { ...file, status: 'duplicate' };
    }
    if (['dotified', 'modified', 'error'].includes(file.status)) {
      return file;
    }
    return { ...file, status: 'valid' };
  });
};

const applySearchReplace = (
  files: FileItem[],
  rules: SearchReplaceRule[]
): FileItem[] => {
  return files.map((file) => {
    let newName = file.currentName;
    let newStatus = file.status;

    rules.forEach((rule) => {
      if (!rule.isEnabled) return;

      // Handle cue sheet template
      if (rule.replaceWith === 'CUE_SHEET') {
        const { title, status } = dotifyTitleGeneric(newName, true);
        newName = title;
        newStatus = status;
        return;
      }
      if (rule.replaceWith === 'CUE_SHEET_NO_EP') {
        const { title, status } = dotifyTitleGeneric(newName, false);
        newName = title;
        newStatus = status;
        return;
      }

      try {
        const flags = rule.isCaseInsensitive ? 'gi' : 'g';
        if (rule.isRegex) {
          const regex = new RegExp(rule.searchPattern, flags);
          newName = newName.replace(regex, rule.replaceWith);
        } else {
          newName = newName.replace(
            new RegExp(escapeRegExp(rule.searchPattern), flags),
            rule.replaceWith
          );
        }
      } catch {
        console.log('Invalid regex.');
      }
    });

    return {
      ...file,
      currentName: newName,
      characterCount: newName.length,
      status: newStatus,
    };
  });
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const downloadRenamedFiles = async (files: FileItem[]): Promise<void> => {
  const zip = new JSZip();

  for (const fileItem of files) {
    if (!['valid', 'modified', 'dotified'].includes(fileItem.status)) continue;

    try {
      const blob = new Blob([fileItem.file], { type: fileItem.file.type });
      zip.file(ensurePdfExtension(fileItem.currentName), blob);
    } catch (error) {
      console.error('Error downloading file:', fileItem.currentName, error);
      useToastStore.getState().toast({
        description: 'Error: failed to download file.',
        variant: 'error',
      });
    }
  }

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'dotified.zip');
    useToastStore.getState().toast({
      description: 'File downloaded!',
      variant: 'success',
    });
  } catch {
    useToastStore.getState().toast({
      description: 'Error: failed to download file.',
      variant: 'error',
    });
  }
};

const ensurePdfExtension = (filename: string): string => {
  if (!filename.toLowerCase().endsWith('.pdf')) {
    return `${filename}.pdf`;
  }
  return filename;
};

export {
  ensurePdfExtension,
  downloadRenamedFiles,
  escapeRegExp,
  applySearchReplace,
  checkForDuplicates,
  validateFileName,
  generateFileId,
};
