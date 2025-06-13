import { FileItem, fileStatus, SearchReplaceRule } from '../types';
import dotifyTitle from './dotify'

export const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const validateFileName = (name: string): boolean => {
  // Check for invalid characters in file names
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(name) && name.trim().length > 0;
};

export const checkForDuplicates = (files: FileItem[]): FileItem[] => {
  const nameCounts = files.reduce((map, file) => {
    map.set(file.currentName, (map.get(file.currentName) || 0) + 1);
    return map;
  }, new Map<string, number>());

  return files.map(file => {
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

export const applyCueSheetConvention = (filename: string): [string, fileStatus] => {
  return dotifyTitle(filename);
};

export const applySearchReplace = (
  files: FileItem[], 
  rules: SearchReplaceRule[]
): FileItem[] => {
  return files.map(file => {
    let newName = file.currentName;
    let status = file.status;
    
    rules.forEach(rule => {
      if (!rule.isEnabled) return;

      // Handle cue sheet template
      if (rule.replaceWith === 'CUE_SHEET_TEMPLATE') {
        const results = applyCueSheetConvention(newName);
        newName = Array.isArray(results) ? results[0] : results;
        if (newName !== file.currentName) {
          status = 'modified';
        } else {
          status = Array.isArray(results) ? results[1] as FileItem['status'] : file.status;
        }
        return;
      }
      
      try {
        if (rule.isRegex) {
          const regex = new RegExp(rule.searchPattern, 'g');
          newName = newName.replace(regex, rule.replaceWith);
        } else {
          newName = newName.replace(new RegExp(escapeRegExp(rule.searchPattern), 'g'), rule.replaceWith);
        }
      } catch {
        console.warn('Invalid regex pattern:', rule.searchPattern);
      }
    });

    return {
      ...file,
      currentName: newName,
      characterCount: newName.length,
      status: status
    };
  });
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const downloadRenamedFiles = async (files: FileItem[]): Promise<void> => {
  for (const fileItem of files) {
    if (fileItem.status !== 'valid') continue;
    
    try {
      // Create a new blob with the original file data
      const blob = new Blob([fileItem.file], { type: fileItem.file.type });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = ensurePdfExtension(fileItem.currentName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error downloading file:', fileItem.currentName, error);
    }
  }
};

const ensurePdfExtension = (filename: string): string => {
  if (!filename.toLowerCase().endsWith('.pdf')) {
    return `${filename}.pdf`;
  }
  return filename;
};