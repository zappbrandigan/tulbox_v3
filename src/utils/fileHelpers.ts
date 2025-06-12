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

const formatCueSheetName = (sections: {
  section1: string;
  section2?: string;
  section3: string;
}): string => {
  if (sections.section2) {
    return `${sections.section1}   ${sections.section2}  ${sections.section3}`;
  } else {
    return `${sections.section1}   ${sections.section3}`;
  }
};

export const applyCueSheetConvention = (filename: string): string => {
  // Remove .pdf extension for processing
  const nameWithoutExt = filename.replace(/\.pdf$/i, '');
  
  // Parse the filename to extract sections
  // This is a simplified parser - in practice, you might need more sophisticated parsing
  const sections = parseFilenameForCueSheet(nameWithoutExt);
  
  // Apply cue sheet formatting
  let formattedName = formatCueSheetName(sections);
  
  // Enforce 60 character limit
  if (formattedName.length > 60) {
    formattedName = truncateCueSheetName(sections);
  }
  
  return formattedName;
};

const parseFilenameForCueSheet = (filename: string): {
  section1: string;
  section2?: string;
  section3: string;
} => {
  // This is a basic parser - you might want to enhance this based on your specific needs
  // For now, we'll assume the filename needs to be restructured
  
  // Extract episode number if present
  const episodeMatch = filename.match(/(\d{4,8})$/);
  const episodeNumber = episodeMatch ? episodeMatch[1] : '12345678';
  
  // Remove episode number from filename for processing
  const withoutEpisode = filename.replace(/\d{4,8}$/, '').trim();
  
  // Split remaining text - this is simplified logic
  const parts = withoutEpisode.split(/\s+/);
  
  if (parts.length >= 2) {
    return {
      section1: parts[0].toUpperCase(),
      section2: toTitleCase(parts.slice(1).join(' ')),
      section3: `Ep No. ${episodeNumber}`
    };
  } else {
    return {
      section1: parts[0]?.toUpperCase() || 'UNTITLED',
      section3: `Ep No. ${episodeNumber}`
    };
  }
};

const truncateCueSheetName = (sections: {
  section1: string;
  section2?: string;
  section3: string;
}): string => {
  let { section1, section2, section3 } = sections;
  
  // Calculate base length (section1 + section3 + separators)
  const baseLength = section1.length + section3.length + (section2 ? 5 : 3); // 3 or 5 spaces
  
  // If we have section2, try truncating it first
  if (section2) {
    const availableForSection2 = 60 - baseLength;
    if (availableForSection2 < section2.length) {
      if (availableForSection2 >= 6) { // Minimum 3 chars + "..."
        section2 = section2.substring(0, availableForSection2 - 3) + '...';
      } else {
        // Remove section2 entirely if we can't fit at least 3 chars
        section2 = undefined;
      }
    }
  }
  
  // Recalculate and check if we still need to truncate section1
  const currentLength = section1.length + (section2 ? section2.length + 5 : 0) + section3.length + (section2 ? 0 : 3);
  
  if (currentLength > 60) {
    const availableForSection1 = 60 - (section2 ? section2.length + 5 : 3) - section3.length;
    if (availableForSection1 >= 6) { // Minimum 3 chars + "..."
      section1 = section1.substring(0, availableForSection1 - 3) + '...';
    }
  }
  
  return formatCueSheetName({ section1, section2, section3 });
};

const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const applySearchReplace = (
  files: FileItem[], 
  rules: SearchReplaceRule[]
): FileItem[] => {
  return files.map(file => {
    let newName = file.currentName;
    
    rules.forEach(rule => {
      if (!rule.isEnabled) return;

      // Handle cue sheet template
      if (rule.replaceWith === 'CUE_SHEET_TEMPLATE') {
        newName = applyCueSheetConvention(file.originalName);
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