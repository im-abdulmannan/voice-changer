import type { VoiceEffect } from "@/types/voice";

/** FFmpeg audio filter configuration for each voice effect */
export interface EffectConfig {
  id: VoiceEffect;
  label: string;
  description: string;
  /** FFmpeg -af filter string */
  filter: string;
}

/**
 * Voice effect definitions using traditional DSP filters only.
 * No AI/ML — pure FFmpeg audio processing.
 */
export const VOICE_EFFECTS: EffectConfig[] = [
  {
    id: "deep",
    label: "Deep Voice",
    description: "Lower pitch for a deeper, richer tone",
    filter: "asetrate=44100*0.8,aresample=44100",
  },
  {
    id: "chipmunk",
    label: "Chipmunk Voice",
    description: "Raise pitch for a high, squeaky sound",
    filter: "asetrate=44100*1.25,aresample=44100",
  },
  {
    id: "robot",
    label: "Robot Voice",
    description: "Robotic, metallic modulation effect",
    filter: "afftfilt=real='hypot(re,im)*cos(0)':imag='hypot(re,im)*sin(0)'",
  },
  {
    id: "echo",
    label: "Echo / Reverb",
    description: "Add spatial echo and reverb",
    filter: "aecho=0.8:0.9:1000:0.3",
  },
  {
    id: "telephone",
    label: "Telephone Voice",
    description: "Band-limited phone call quality",
    filter: "highpass=f=500,lowpass=f=2000",
  },
];

/** Look up effect config by ID; throws if invalid */
export function getEffectConfig(effect: VoiceEffect): EffectConfig {
  const config = VOICE_EFFECTS.find((e) => e.id === effect);
  if (!config) {
    throw new Error(`Unknown voice effect: ${effect}`);
  }
  return config;
}

/** Valid effect IDs for server-side validation */
export const VALID_EFFECT_IDS = VOICE_EFFECTS.map((e) => e.id);
