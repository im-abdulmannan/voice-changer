import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  type VoiceEffect,
} from "@/types/voice";
import { VALID_EFFECT_IDS } from "@/lib/ffmpeg/effects";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate uploaded file size, type, and extension */
export function validateAudioFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  const extension = getFileExtension(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // MIME type check — browsers may report empty or generic types for some formats
  if (
    file.type &&
    !isAllowedMimeType(file.type) &&
    !file.type.startsWith("audio/")
  ) {
    return {
      valid: false,
      error: "Invalid audio format. Please upload MP3, WAV, M4A, or record audio.",
    };
  }

  return { valid: true };
}

/** Validate voice effect parameter from form data */
export function validateEffect(effect: string | null): effect is VoiceEffect {
  return effect !== null && VALID_EFFECT_IDS.includes(effect as VoiceEffect);
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot >= 0 ? filename.slice(lastDot) : "";
}

function isAllowedMimeType(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}
