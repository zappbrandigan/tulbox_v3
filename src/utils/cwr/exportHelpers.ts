import { CWRTemplate } from '@/types';
import ExportWorker from '@/workers/exportWorker?worker';

const exportFile = (
  data: Map<string, string | number>[],
  template: CWRTemplate,
  fileName: string,
  format: 'csv' | 'json',
  setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const worker = new ExportWorker();

  const serialized = data.map((map) => Array.from(map.entries()));

  setIsDownloading(true);

  worker.postMessage({
    format,
    tableData: serialized,
    template,
    fileName,
  });

  worker.onmessage = (e) => {
    const { content, fileName, mimeType } = e.data;
    downloadFile(content, fileName, mimeType);

    setIsDownloading(false);
    worker.terminate();
  };

  worker.onerror = (err) => {
    console.error('Worker failed:', err);
    setIsDownloading(false);
    worker.terminate();
  };
};

const downloadFile = (
  content: string,
  fileName: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportFile;
