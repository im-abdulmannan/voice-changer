"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Wand2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioSourceInput } from "./AudioSourceInput";
import { EffectSelector } from "./EffectSelector";
import {
  AudioPlayer,
  AudioPlayerPlaceholder,
} from "./AudioPlayer";
import { ProcessingIndicator } from "./LoadingSkeleton";
import type {
  ApiErrorResponse,
  AudioInputMode,
  ProcessingStatus,
  VoiceEffect,
} from "@/types/voice";

export function VoiceChangerApp() {
  const [inputMode, setInputMode] = useState<AudioInputMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [effect, setEffect] = useState<VoiceEffect>("deep");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const isProcessing = status === "uploading" || status === "processing";

  // Create object URL for original file preview
  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Revoke processed URL on unmount or when replaced
  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const handleFileSelect = useCallback((selected: File | null) => {
    setFile(selected);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setStatus("idle");
  }, []);

  const handleModeChange = useCallback(
    (mode: AudioInputMode) => {
      setInputMode(mode);
      handleFileSelect(null);
    },
    [handleFileSelect]
  );

  const handleProcess = useCallback(async () => {
    if (!file) {
      toast.error(
        inputMode === "record"
          ? "Please record your voice first."
          : "Please upload an audio file first."
      );
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("effect", effect);

      setStatus("processing");

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error ?? "Processing failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Revoke previous processed URL before setting new one
      if (processedUrl) URL.revokeObjectURL(processedUrl);

      setProcessedBlob(blob);
      setProcessedUrl(url);
      setStatus("success");
      toast.success("Audio processed successfully!");
    } catch (error) {
      setStatus("error");
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(message);
    }
  }, [file, effect, processedUrl, inputMode]);

  const handleDownload = useCallback(() => {
    if (!processedBlob) return;

    const url = URL.createObjectURL(processedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voice-changed-${effect}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  }, [processedBlob, effect]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center sm:text-left">
        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-2xl">Transform Your Voice</CardTitle>
        </div>
        <CardDescription>
          Upload or record audio, pick an effect, and let FFmpeg work its magic
          — no AI, pure DSP.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Upload or record */}
        <AudioSourceInput
          mode={inputMode}
          onModeChange={handleModeChange}
          file={file}
          onFileSelect={handleFileSelect}
          disabled={isProcessing}
        />

        {/* Step 2: Select effect */}
        <EffectSelector
          value={effect}
          onChange={setEffect}
          disabled={isProcessing}
        />

        {/* Step 3: Process */}
        <Button
          onClick={handleProcess}
          disabled={!file || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {status === "uploading" ? "Uploading..." : "Processing..."}
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              Apply Voice Effect
            </>
          )}
        </Button>

        {/* Processing indicator */}
        {isProcessing && (
          <ProcessingIndicator
            message={
              status === "uploading"
                ? "Sending your audio for processing..."
                : "Applying FFmpeg filters — this may take a moment..."
            }
          />
        )}

        {/* Audio previews */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-400">Preview</h4>

          {originalUrl ? (
            <AudioPlayer
              src={originalUrl}
              label={inputMode === "record" ? "Your Recording" : "Original Audio"}
            />
          ) : (
            <AudioPlayerPlaceholder />
          )}

          {processedUrl && (
            <AudioPlayer
              src={processedUrl}
              label="Processed Audio"
              canDownload
              onDownload={handleDownload}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
