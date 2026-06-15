import ffmpeg from "fluent-ffmpeg";
import os from "os";
import path from "path";
import { getFfmpegPath } from "./binary";
import { getEffectConfig } from "./effects";
import type { VoiceEffect } from "@/types/voice";

let ffmpegConfigured = false;

/** Configure fluent-ffmpeg with the resolved binary path (lazy, once per cold start) */
function ensureFfmpegConfigured(): void {
  if (ffmpegConfigured) return;
  ffmpeg.setFfmpegPath(getFfmpegPath());
  ffmpegConfigured = true;
}

export interface ProcessAudioOptions {
  inputPath: string;
  outputPath: string;
  effect: VoiceEffect;
}

export interface ProcessAudioResult {
  outputPath: string;
  duration?: number;
}

/**
 * Process an audio file with the selected FFmpeg filter.
 * Returns a promise that resolves when encoding completes.
 */
export function processAudio({
  inputPath,
  outputPath,
  effect,
}: ProcessAudioOptions): Promise<ProcessAudioResult> {
  ensureFfmpegConfigured();
  const { filter } = getEffectConfig(effect);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(filter)
      .outputOptions(["-y"]) // Overwrite output if exists
      .output(outputPath)
      .on("end", () => {
        resolve({ outputPath });
      })
      .on("error", (err) => {
        reject(new Error(`FFmpeg processing failed: ${err.message}`));
      })
      .run();
  });
}

/** Generate a unique temp filename with the given extension */
export function generateTempFilename(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${timestamp}-${random}${extension}`;
}

/** Resolve the temp directory for audio processing (uses /tmp on Vercel) */
export function getTempDir(): string {
  return path.join(os.tmpdir(), "voice-changer", "audio");
}

/** Map input extension to a safe output extension (always mp3 for compatibility) */
export function getOutputExtension(): string {
  return ".mp3";
}
