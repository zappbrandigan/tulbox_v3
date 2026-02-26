import React, { useEffect, useMemo, useRef, useState } from "react";
import { Summary, SearchReplace, FileTable } from "@/components/pdf";
import { FileItem, SearchReplaceRule } from "@/types";
import {
  generateFileId,
  checkForDuplicates,
  applySearchReplace,
  downloadRenamedFiles,
  trackEvent,
} from "@/utils";
import {
  ToolHeader,
  DragDropZone,
  Disclaimer,
  LoadingOverlay,
} from "@/components/ui";
import { logUserEvent } from "@/utils/general/logEvent";
import { PageMeta } from "@/PageMeta";
import { useSession } from "@/stores/session";
import { usePDFManagerStore } from "@/stores/pdfManager";
import {
  clearStoredFiles,
  deleteStoredFile,
  getStoredFile,
  putStoredFile,
} from "@/utils/pdf/storage";
import type { HighlightSegment } from "@/utils/pdf/fileHelpers";
import {
  computeSearchReplacePreviewPayload,
  isLatestPreviewWorkerResult,
  type PreviewFile,
  type SearchReplacePreview,
} from "@/utils/pdf/searchReplacePreview";
import {
  createApplySnapshot,
  restoreFromApplySnapshot,
  type ApplySnapshot,
} from "@/utils/pdf/undo";

type PreviewWorkerIn = {
  type: "compute";
  requestId: number;
  files: PreviewFile[];
  rules: SearchReplaceRule[];
};

type PreviewWorkerOut =
  | {
      type: "result";
      requestId: number;
      preview: SearchReplacePreview;
      previewNameMap: Record<string, string>;
      currentHighlightSegmentsMap: Record<string, HighlightSegment[]>;
      previewHighlightSegmentsMap: Record<string, HighlightSegment[]>;
    }
  | { type: "error"; requestId: number; error: string };

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isHydratingFiles, setIsHydratingFiles] = useState(false);
  const [lastApplySnapshot, setLastApplySnapshot] =
    useState<ApplySnapshot | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const sessionId = useSession((s) => s.sessionId);
  const filesMeta = usePDFManagerStore((s) => s.filesMeta);
  const setFilesMeta = usePDFManagerStore((s) => s.setFilesMeta);
  const searchReplaceRules = usePDFManagerStore((s) => s.searchReplaceRules);
  const setSearchReplaceRules = usePDFManagerStore(
    (s) => s.setSearchReplaceRules,
  );
  const clearStore = usePDFManagerStore((s) => s.clearAll);
  const hasHydrated = usePDFManagerStore((s) => s.hasHydrated);

  const previewFallback = useMemo(
    () =>
      computeSearchReplacePreviewPayload(
        files.map((file) => ({
          id: file.id,
          currentName: file.currentName,
          status: file.status,
        })),
        [],
      ),
    [files],
  );

  const [previewData, setPreviewData] = useState(previewFallback);
  const previewDebounceMs = 120;

  const toMeta = (items: FileItem[]) =>
    items.map((item) => ({
      id: item.id,
      originalName: item.originalName,
      currentName: item.currentName,
      characterCount: item.characterCount,
      status: item.status,
      lastModified: item.lastModified.getTime(),
    }));

  const handleFilesAdded = async (files: File[] | File) => {
    const actualFiles = Array.isArray(files) ? files : [files];
    logUserEvent(
      sessionId,
      "User added files",
      {
        action: "file-upload",
        target: "pdf-manager",
        value: actualFiles.length,
      },
      "pdf-manager",
    );

    const fileItems: FileItem[] = actualFiles.map((file) => ({
      id: generateFileId(),
      originalName: file.name,
      currentName: file.name.replace(/\.pdf$/i, ""),
      file,
      characterCount: file.name.replace(/\.pdf$/i, "").length,
      status: "valid",
      lastModified: new Date(file.lastModified),
    }));

    setIsUploadingFiles(true);
    try {
      for (let i = 0; i < fileItems.length; i += 1) {
        const fileItem = fileItems[i];
        await putStoredFile(fileItem.id, fileItem.file);
      }
    } finally {
      setIsUploadingFiles(false);
    }

    setFiles((prevFiles) => {
      const nextFiles = checkForDuplicates([...prevFiles, ...fileItems]);
      setFilesMeta(toMeta(nextFiles));
      return nextFiles;
    });
    setLastApplySnapshot(null);
  };

  const handleFileUpdate = (id: string, newName: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file) =>
        file.id === id
          ? {
              ...file,
              currentName: newName,
              characterCount: newName.length,
            }
          : file,
      );
      const nextFiles = checkForDuplicates(updatedFiles);
      setFilesMeta(toMeta(nextFiles));
      return nextFiles;
    });
    setLastApplySnapshot(null);
  };

  const handleFileRemove = (id: string) => {
    setFiles((prevFiles) => {
      const filteredFiles = prevFiles.filter((file) => file.id !== id);
      const nextFiles = checkForDuplicates(filteredFiles);
      setFilesMeta(toMeta(nextFiles));
      return nextFiles;
    });
    deleteStoredFile(id);
    setLastApplySnapshot(null);
  };

  const handleApplySearchReplace = () => {
    logUserEvent(
      sessionId,
      "Search and Replace Applied",
      {
        action: "search-replace",
        target: "pdf-manager",
        value: JSON.stringify(searchReplaceRules),
      },
      "pdf-manager",
    );

    setFiles((prevFiles) => {
      const snapshot = createApplySnapshot(prevFiles);
      setLastApplySnapshot(snapshot);
      const updatedFiles = applySearchReplace(prevFiles, searchReplaceRules);
      const nextFiles = checkForDuplicates(updatedFiles);
      setFilesMeta(toMeta(nextFiles));
      return nextFiles;
    });
    setIsPreviewVisible(false);
  };

  const handleUndoLastApply = () => {
    if (!lastApplySnapshot) return;
    setFiles((prevFiles) => {
      const restoredFiles = restoreFromApplySnapshot(
        prevFiles,
        lastApplySnapshot,
      );
      const nextFiles = checkForDuplicates(restoredFiles);
      setFilesMeta(toMeta(nextFiles));
      return nextFiles;
    });
    setLastApplySnapshot(null);
    setIsPreviewVisible(false);
  };

  const handleDownloadAll = async () => {
    const downloadableFiles = files.filter((file) =>
      ["valid", "modified", "dotified"].includes(file.status),
    );
    if (downloadableFiles.length === 0) return;

    setIsDownloading(true);
    try {
      await downloadRenamedFiles(downloadableFiles);
      logUserEvent(
        sessionId,
        "PDF File Downloaded",
        {
          action: "file-download",
          target: "pdf-manager",
          value: downloadableFiles.length,
        },
        "pdf-manager",
      );
    } catch (error) {
      logUserEvent(
        sessionId,
        "Error: PDF Download",
        {
          action: "file-download",
          target: "pdf-manager",
          value: String(error),
        },
        "pdf-manager",
        "error",
      );
      console.error("Error downloading files:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    clearStore();
    clearStoredFiles();
    setLastApplySnapshot(null);
  };

  useEffect(() => {
    trackEvent("screen_view", {
      firebase_screen: "PDFManager",
      firebase_screen_class: "PDFManager",
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated || filesMeta.length === 0) return;

    let isCancelled = false;
    const hydrateFiles = async () => {
      setIsHydratingFiles(true);
      const hydrated: FileItem[] = [];
      for (let i = 0; i < filesMeta.length; i += 1) {
        const meta = filesMeta[i];
        const storedFile = await getStoredFile(meta.id);
        if (!storedFile) continue;
        hydrated.push({
          ...meta,
          file: storedFile,
          lastModified: new Date(storedFile.lastModified),
        });
      }

      if (isCancelled) return;
      const nextFiles = checkForDuplicates(hydrated);
      setFiles(nextFiles);
      if (nextFiles.length !== filesMeta.length) {
        setFilesMeta(toMeta(nextFiles));
      }
      setIsHydratingFiles(false);
    };

    hydrateFiles();
    return () => {
      isCancelled = true;
      setIsHydratingFiles(false);
    };
  }, [filesMeta, hasHydrated, setFilesMeta]);

  useEffect(() => {
    if (searchReplaceRules.length === 0) {
      setIsPreviewVisible(false);
    }
  }, [searchReplaceRules]);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/searchReplacePreviewWorker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<PreviewWorkerOut>) => {
      const message = event.data;
      if (!isLatestPreviewWorkerResult(requestIdRef.current, message.requestId))
        return;
      if (message.type === "result") {
        setPreviewData({
          preview: message.preview,
          previewNameMap: message.previewNameMap,
          currentHighlightSegmentsMap: message.currentHighlightSegmentsMap,
          previewHighlightSegmentsMap: message.previewHighlightSegmentsMap,
        });
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) {
      setPreviewData(previewFallback);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      const message: PreviewWorkerIn = {
        type: "compute",
        requestId,
        files: files.map((file) => ({
          id: file.id,
          currentName: file.currentName,
          status: file.status,
        })),
        rules: searchReplaceRules,
      };
      workerRef.current?.postMessage(message);
    }, previewDebounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [files, searchReplaceRules, previewFallback]);

  const isHydrationPending = !hasHydrated || isHydratingFiles;
  const hideEmptyState = isUploadingFiles || isHydrationPending;

  return (
    <>
      <PageMeta
        title="PDF Manager | TūlBOX"
        description="Batch rename PDF files using RegEx and quick templates."
      />
      <ToolHeader
        primaryText="PDF File Manager"
        secondaryText={`
            Upload PDF files, rename them individually or in batches using search & replace rules, 
            then download your organized files.`}
        isVisible={files.length === 0 && !hideEmptyState}
      />

      {isUploadingFiles && <LoadingOverlay message="Loading Files..." />}

      {!isUploadingFiles && !hasHydrated && files.length === 0 && (
        <LoadingOverlay message="Restoring your previous files..." />
      )}

      {!isUploadingFiles &&
        hasHydrated &&
        isHydratingFiles &&
        files.length === 0 && (
          <LoadingOverlay message="Restoring your previous files" />
        )}

      <DragDropZone
        onFilesAdded={handleFilesAdded}
        accept=".pdf"
        maxFiles={200}
        allowMultiple={true}
        validateFile={(file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf")
        }
        title="Upload PDF Files"
        description="Drag and drop your PDF files here, or click to browse"
        note="Maximum 200 files • PDF format only"
        isVisible={files.length === 0 && !hideEmptyState}
      />

      <Summary
        files={files}
        isDownloading={isDownloading}
        handleClearAll={handleClearAll}
        handleDownloadAll={handleDownloadAll}
      />

      {/* Search & Replace */}
      {files.length > 0 && (
        <SearchReplace
          rules={searchReplaceRules}
          preview={previewData.preview}
          onRulesChange={setSearchReplaceRules}
          onApply={handleApplySearchReplace}
          onUndo={handleUndoLastApply}
          canUndo={!!lastApplySnapshot}
          isPreviewVisible={isPreviewVisible}
          onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
        />
      )}

      {/* File Table */}
      <FileTable
        files={files}
        rules={searchReplaceRules}
        previewNameMap={previewData.previewNameMap}
        currentHighlightSegmentsMap={previewData.currentHighlightSegmentsMap}
        previewHighlightSegmentsMap={previewData.previewHighlightSegmentsMap}
        isPreviewVisible={isPreviewVisible}
        onFileUpdate={handleFileUpdate}
        onFileRemove={handleFileRemove}
      />

      <Disclaimer isVisible={files.length === 0 && !hideEmptyState} />
    </>
  );
};

export default PDFManager;
