import { FileItem, SearchReplaceRule } from '../types';

export const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const validateFileName = (name: string): boolean => {
  // Check for invalid characters in file names
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(name) && name.trim().length > 0;
};

export const checkForDuplicates = (files: FileItem[]): FileItem[] => {
  const nameCounts = new Map<string, number>();
  
  // Count occurrences of each name
  files.forEach(file => {
    const count = nameCounts.get(file.currentName) || 0;
    nameCounts.set(file.currentName, count + 1);
  });

  // Update status based on duplicates and validation
  return files.map(file => ({
    ...file,
    status: !validateFileName(file.currentName) 
      ? 'invalid' 
      : nameCounts.get(file.currentName)! > 1 
        ? 'duplicate' 
        : 'valid'
  }));
};

export const checkFormatConvention = (files: FileItem[]): FileItem[] => {
  // TODO: Validate standard file name convention
  const separatorTokens = true
  
  // Update status based on file name convention and validation
  return files.map(file => ({
    ...file,
    status: !validateFileName(file.currentName) 
      ? 'invalid' 
      : separatorTokens
        ? 'valid' 
        : 'invalid'
  }));
};

export const applySearchReplace = (
  files: FileItem[], 
  rules: SearchReplaceRule[]
): FileItem[] => {
  return files.map(file => {
    let newName = file.currentName;
    
    rules.forEach(rule => {
      if (!rule.isEnabled) return;
      
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
      characterCount: newName.length
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