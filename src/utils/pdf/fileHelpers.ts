import { FileItem, SearchReplaceRule } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dotifyTitleGeneric from './dotify';

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
        if (rule.isRegex) {
          const regex = new RegExp(rule.searchPattern, 'g');
          newName = newName.replace(regex, rule.replaceWith);
        } else {
          newName = newName.replace(
            new RegExp(escapeRegExp(rule.searchPattern), 'g'),
            rule.replaceWith
          );
        }
      } catch {
        console.warn('Invalid regex pattern:', rule.searchPattern);
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
      // Create a new blob with the original file data
      const blob = new Blob([fileItem.file], { type: fileItem.file.type });

      // Add file to zip
      zip.file(ensurePdfExtension(fileItem.currentName), blob);

      // Small delay between processing files to avoid browser blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error downloading file:', fileItem.currentName, error);
    }
  }

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'dotified.zip');
  } catch {
    console.log('Error. Please reload and try again.');
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
  // applyCueSheetConventionOne,
  // applyCueSheetConventionTwo,
  applySearchReplace,
  checkForDuplicates,
  validateFileName,
  generateFileId,
};
