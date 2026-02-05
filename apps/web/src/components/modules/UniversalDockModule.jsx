"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, File, Image as ImageIcon, FileText, Copy } from "lucide-react";

export default function UniversalDockModule({ data = {}, onDataUpdate }) {
  const [droppedFiles, setDroppedFiles] = useState(data.files || []);
  const [isDragging, setIsDragging] = useState(false);
  const [clipboardContent, setClipboardContent] = useState(
    data.clipboard || "",
  );
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!dropZoneRef.current?.contains(document.activeElement)) return;

      e.preventDefault();
      const text = e.clipboardData.getData("text");
      const files = Array.from(e.clipboardData.files);

      if (text) {
        setClipboardContent(text);
        onDataUpdate({
          ...data,
          clipboard: text,
          lastUpdated: new Date().toISOString(),
        });
      }

      if (files.length > 0) {
        handleFiles(files);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [data, onDataUpdate]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const fileData = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      path: URL.createObjectURL(file),
    }));

    const updated = [...droppedFiles, ...fileData];
    setDroppedFiles(updated);
    onDataUpdate({
      files: updated,
      clipboard: clipboardContent,
      lastUpdated: new Date().toISOString(),
    });
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (type.startsWith("text/")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center gap-2 text-teal-600">
        <Upload className="h-5 w-5" />
        <h3 className="font-semibold text-sm">Universal Dock</h3>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <Upload
          className={`h-12 w-12 mb-2 ${isDragging ? "text-teal-500" : "text-gray-400"}`}
        />
        <p className="text-sm font-medium text-gray-600">
          Drop files here or Ctrl+V
        </p>
        <p className="text-xs text-gray-400 mt-1">Files, images, or text</p>
      </div>

      {/* Clipboard Content */}
      {clipboardContent && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Copy className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">
              Clipboard Content
            </span>
          </div>
          <pre className="text-xs text-gray-700 overflow-auto max-h-20">
            {clipboardContent}
          </pre>
        </div>
      )}

      {/* Files List */}
      {droppedFiles.length > 0 && (
        <div className="max-h-40 overflow-auto space-y-2">
          {droppedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
            >
              <div className="text-gray-500">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const UniversalDockModuleConfig = {
  handles: {
    inputs: [],
    outputs: [
      { id: "files", position: "right", label: "Files" },
      { id: "clipboard", position: "right", label: "Clipboard" },
    ],
  },
};
