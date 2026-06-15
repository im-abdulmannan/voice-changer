/** Supported voice effect identifiers */
export type VoiceEffect =
  | "deep"
  | "chipmunk"
  | "robot"
  | "echo"
  | "telephone";

/** Metadata for each voice effect shown in the UI */
export interface VoiceEffectOption {
  id: VoiceEffect;
  label: string;
  description: string;
  icon: string;
}

/** Processing status returned by the API */
export type ProcessingStatus = "idle" | "uploading" | "processing" | "success" | "error";

/** API error response shape */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/** Allowed audio MIME types for upload validation */
export const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
  "audio/ogg",
] as const;

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".webm", ".ogg"] as const;

/** How the user provides source audio */
export type AudioInputMode = "upload" | "record";

/** Maximum upload size in bytes (25MB) */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
