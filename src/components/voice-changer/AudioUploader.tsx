"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileAudio, X, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { validateAudioFile } from "@/lib/validation";
import { ALLOWED_EXTENSIONS } from "@/types/voice";

interface AudioUploaderProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop audio file uploader with validation.
 * Accepts mp3, wav, and m4a files up to 25MB.
 */
export function AudioUploader({
  file,
  onFileSelect,
  disabled = false,
}: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (selectedFile: File | null) => {
      setError(null);
      if (!selectedFile) {
        onFileSelect(null);
        return;
      }

      const validation = validateAudioFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error ?? "Invalid file.");
        return;
      }

      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] ?? null;
      handleFile(selectedFile);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  const acceptTypes = ALLOWED_EXTENSIONS.join(",");

  return (
    <div className="space-y-3">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-all duration-300",
            isDragging
              ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
              : "border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-white/10",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 transition-transform",
              isDragging && "scale-110"
            )}
          >
            <Upload className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-base font-medium text-white">
            Drop your audio file here
          </p>
          <p className="mt-1 text-sm text-slate-400">
            or click to browse — MP3, WAV, M4A (max 25MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            aria-label="Upload audio file"
          />
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30">
            <FileAudio className="h-6 w-6 text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">{file.name}</p>
            <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
