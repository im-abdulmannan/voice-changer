"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import { validateAudioFile } from "@/lib/validation";
import { MAX_FILE_SIZE } from "@/types/voice";

interface AudioRecorderProps {
  file: File | null;
  onRecordingComplete: (file: File | null) => void;
  disabled?: boolean;
}

/** Pick a MediaRecorder MIME type supported by the current browser */
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Browser microphone recorder using the MediaRecorder API.
 * Captures audio and passes it to the parent as a File for FFmpeg processing.
 */
export function AudioRecorder({
  file,
  onRecordingComplete,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Release microphone and timers on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopStream();
    };
  }, [clearTimer, stopStream]);

  const handleStartRecording = useCallback(async () => {
    if (disabled || isRecording) return;

    setError(null);
    chunksRef.current = [];
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        clearTimer();
        stopStream();

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size === 0) {
          setError("Recording is empty. Please try again.");
          setIsRecording(false);
          return;
        }

        if (blob.size > MAX_FILE_SIZE) {
          setError("Recording exceeds the 25MB limit. Please record a shorter clip.");
          setIsRecording(false);
          return;
        }

        const extension = blob.type.includes("mp4")
          ? ".m4a"
          : blob.type.includes("ogg")
            ? ".ogg"
            : ".webm";

        const recordedFile = new File(
          [blob],
          `recording-${Date.now()}${extension}`,
          { type: blob.type || "audio/webm" }
        );

        const validation = validateAudioFile(recordedFile);
        if (!validation.valid) {
          setError(validation.error ?? "Invalid recording.");
          setIsRecording(false);
          return;
        }

        onRecordingComplete(recordedFile);
        setIsRecording(false);
        toast.success("Recording saved! You can now apply an effect.");
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try again.");
        setIsRecording(false);
        clearTimer();
        stopStream();
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      stopStream();
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permission."
          : "Could not access microphone. Check your device settings.";
      setError(message);
      toast.error(message);
    }
  }, [
    clearTimer,
    disabled,
    isRecording,
    onRecordingComplete,
    stopStream,
  ]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleReRecord = useCallback(() => {
    onRecordingComplete(null);
    setDuration(0);
    setError(null);
  }, [onRecordingComplete]);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300",
          isRecording
            ? "border-red-400/60 bg-red-500/10"
            : "border-white/20 bg-white/5",
          disabled && "opacity-50"
        )}
      >
        {/* Recording pulse indicator */}
        {isRecording && (
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-medium text-red-300">REC</span>
          </div>
        )}

        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all",
            isRecording
              ? "bg-red-500/20 shadow-lg shadow-red-500/30"
              : "bg-gradient-to-br from-violet-600/20 to-indigo-600/20"
          )}
        >
          <Mic
            className={cn(
              "h-8 w-8",
              isRecording ? "text-red-400" : "text-violet-400"
            )}
          />
        </div>

        <p className="text-base font-medium text-white">
          {isRecording ? "Recording in progress..." : "Record with your microphone"}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {isRecording
            ? "Click stop when you're done speaking"
            : "Capture your voice directly in the browser"}
        </p>

        <p className="mt-3 font-mono text-lg text-violet-300">
          {formatDuration(duration)}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isRecording ? (
            <Button
              type="button"
              onClick={handleStartRecording}
              disabled={disabled}
              size="lg"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleStopRecording}
              variant="destructive"
              size="lg"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop Recording
            </Button>
          )}

          {file && !isRecording && (
            <Button
              type="button"
              onClick={handleReRecord}
              variant="secondary"
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4" />
              Re-record
            </Button>
          )}
        </div>
      </div>

      {file && !isRecording && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Recording ready — {formatFileSize(file.size)}. Select an effect below
          to transform it.
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
