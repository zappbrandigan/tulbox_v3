import React, { useState } from "react";
import {
  Edit3,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Layers2,
  Download,
  ClipboardCopy,
} from "lucide-react";
import { FileItem } from "@/types";
import { logUserEvent } from "@/utils/general/logEvent";
import { ensurePdfExtension } from "@/utils";
import { useSession } from "@/stores/session";
import SortableHeader from "../ui/SortableHeader";
import { useSortableData } from "@/hooks";
import { useToast } from "@/stores/toast";

interface FileTableProps {
  files: FileItem[];
  onFileUpdate: (id: string, newName: string) => void;
  onFileRemove: (id: string) => void;
}

const FileTable: React.FC<FileTableProps> = ({
  files,
  onFileUpdate,
  onFileRemove,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const {
    sortedItems: sortedFiles,
    sortConfig,
    requestSort,
  } = useSortableData<FileItem, "currentName" | "characterCount" | "status">(
    files,
  );

  const { toast } = useToast();
  const sessionId = useSession((s) => s.sessionId);

  const startEditing = (file: FileItem) => {
    logUserEvent(sessionId, "PDF Files Inline Edit", {
      action: "ui-interaction",
      target: "file-edit",
    });
    setEditingId(file.id);
    setEditValue(file.currentName);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onFileUpdate(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const GetStatusText = (status: FileItem["status"]) => {
    const base = "text-sm font-medium";
    switch (status) {
      case "valid":
        return (
          <>
            <CheckCircle className="w-5 h-5 text-green-800 dark:text-green-200" />
            <span className={`${base} text-green-800 dark:text-green-200`}>
              Valid
            </span>
          </>
        );
      case "invalid":
        return (
          <>
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className={`${base} text-red-600 dark:text-red-400`}>
              Invalid Name
            </span>
          </>
        );
      case "duplicate":
        return (
          <>
            <Layers2 className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <span className={`${base} text-amber-600 dark:text-amber-500`}>
              Duplicate Name
            </span>
          </>
        );
      case "dotified":
        return (
          <>
            <CheckCircle className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <span className={`${base} text-blue-700 dark:text-blue-400`}>
              Dotified
            </span>
          </>
        );
      case "modified":
        return (
          <>
            <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            <span className={`${base} text-green-700 dark:text-green-400`}>
              Modified
            </span>
          </>
        );
      default:
        return (
          <>
            <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
            <span className={`${base} text-red-700 dark:text-red-400`}>
              Error
            </span>
          </>
        );
    }
  };

  const getRowClassName = (status: FileItem["status"]) => {
    const base =
      "transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800 last:border-b-0";

    switch (status) {
      case "valid":
        return `${base} border-l-4 border-l-green-800 dark:border-l-green-200`;
      case "modified":
        return `${base} border-l-4 border-l-green-500 dark:border-l-green-500`;
      case "dotified":
        return `${base} border-l-4 border-l-blue-500 dark:border-l-blue-500`;
      case "invalid":
        return `${base} border-l-4 border-l-red-500 dark:border-l-red-500`;
      case "error":
        return `${base} border-l-4 border-l-red-700 dark:border-l-red-400`;
      case "duplicate":
        return `${base} border-l-4 border-l-amber-600 dark:border-l-amber-500`;
      default:
        return base;
    }
  };

  const downloadFile = (selectedFile: FileItem) => {
    const blob = new Blob([selectedFile.file], {
      type: selectedFile.file.type,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ensurePdfExtension(selectedFile.currentName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      description: "File downloaded!",
      variant: "success",
    });
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <SortableHeader
                label="Current Name"
                columnKey="currentName"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label="Characters"
                columnKey="characterCount"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <SortableHeader
                label="Status"
                columnKey="status"
                sortConfig={sortConfig}
                onSort={requestSort}
              />
              <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedFiles.map((file) => (
              <tr key={file.id} className={getRowClassName(file.status)}>
                <td className="px-6 py-2 text-sm w-[60%]">
                  {editingId === file.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        id={file.originalName}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 text-emerald-600 hover:text-emerald-400 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditing(file)}
                      className="flex items-center space-x-2 hover:cursor-pointer group"
                    >
                      <span className="flex-1 font-medium text-gray-900 dark:text-white whitespace-pre">
                        {file.currentName}
                      </span>
                      <button
                        onClick={() => startEditing(file)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  ${
                      file.characterCount > 60
                        ? "bg-red-200 dark:bg-red-500 text-red-800 dark:text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {file.characterCount}
                  </span>
                </td>
                <td className="px-6 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {GetStatusText(file.status)}
                  </div>
                </td>
                <td className="flex space-x-4 px-2 py-2 text-sm">
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove file"
                  >
                    <X className="size-5" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(file.currentName);
                      toast({
                        description: "Copied to cliboard!",
                        variant: "success",
                      });
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Copy filename"
                  >
                    <ClipboardCopy className="size-5" />
                  </button>
                  <button
                    onClick={() => downloadFile(file)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Download file"
                  >
                    <Download className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;
