"use client";

import { Upload, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioInputMode } from "@/types/voice";
import { AudioUploader } from "./AudioUploader";
import { AudioRecorder } from "./AudioRecorder";

interface AudioSourceInputProps {
  mode: AudioInputMode;
  onModeChange: (mode: AudioInputMode) => void;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const MODES: { id: AudioInputMode; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Upload File", icon: Upload },
  { id: "record", label: "Record Voice", icon: Mic },
];

/** Tabbed input: upload an audio file or record from the microphone */
export function AudioSourceInput({
  mode,
  onModeChange,
  file,
  onFileSelect,
  disabled = false,
}: AudioSourceInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
            disabled={disabled}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              mode === id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <AudioUploader
          file={file}
          onFileSelect={onFileSelect}
          disabled={disabled}
        />
      ) : (
        <AudioRecorder
          file={file}
          onRecordingComplete={onFileSelect}
          disabled={disabled}
        />
      )}
    </div>
  );
}
