import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

type FileValidationFn = (file: File) => boolean;

interface Props {
  onFilesAdded: (files: File[] | File) => void;
  accept?: string;
  maxFiles?: number;
  allowMultiple?: boolean;
  validateFile?: FileValidationFn;
  title?: string;
  description?: string;
  note?: string;
  isVisible?: boolean;
}

const DragDropZone: React.FC<Props> = ({
  onFilesAdded,
  accept = '',
  maxFiles = 100,
  allowMultiple = true,
  validateFile = () => true,
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to browse',
  note = `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''}`,
  isVisible = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidation = useCallback(
    (files: FileList): File[] => {
      const filtered = Array.from(files).filter(validateFile);

      if (filtered.length === 0) {
        setError('Invalid file type.');
        return [];
      }

      if (filtered.length > maxFiles) {
        setError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed.`);
        return [];
      }

      setError(null);
      return filtered;
    },
    [validateFile, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = handleValidation(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesAdded(allowMultiple ? files : files[0]);
      }
    },
    [handleValidation, onFilesAdded, allowMultiple]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = handleValidation(e.target.files);
      e.target.value = '';
      if (files.length > 0) {
        onFilesAdded(allowMultiple ? files : files[0]);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${
            isDragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'
          }
          cursor-pointer group`}
      >
        <input
          type="file"
          title=""
          accept={accept}
          multiple={allowMultiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
            ${
              isDragOver
                ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 scale-110'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
            }
          `}
          >
            {isDragOver ? (
              <FileText className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDragOver
                ? `Drop your file${allowMultiple ? 's' : ''} here`
                : title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              {description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{note}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-300 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </span>
        </div>
      )}
    </div>
  );
};

export default DragDropZone;
