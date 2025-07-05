import { FileItem, fileStatus, SearchReplaceRule } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dotifyTitle from '@/utils/pdf/dotify';

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

const applyCueSheetConvention = (filename: string): [string, fileStatus] => {
  const cleanTitle = dotifyTitle(filename);
  return cleanTitle;
};

const applySearchReplace = (
  files: FileItem[],
  rules: SearchReplaceRule[]
): FileItem[] => {
  return files.map((file) => {
    let newName = file.currentName;
    let status = file.status;

    rules.forEach((rule) => {
      if (!rule.isEnabled) return;

      // Handle cue sheet template
      if (rule.replaceWith === 'CUE_SHEET_TEMPLATE') {
        const results = applyCueSheetConvention(newName);
        newName = Array.isArray(results) ? results[0] : results;
        if (newName !== file.currentName && results[1] !== 'dotified') {
          status = 'modified';
        } else {
          status = Array.isArray(results)
            ? (results[1] as FileItem['status'])
            : file.status;
        }
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
      status: status,
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
  applyCueSheetConvention,
  applySearchReplace,
  checkForDuplicates,
  validateFileName,
  generateFileId,
};
