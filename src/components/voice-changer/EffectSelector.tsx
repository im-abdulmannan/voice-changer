"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VOICE_EFFECTS } from "@/lib/ffmpeg/effects";
import type { VoiceEffect } from "@/types/voice";
import { Mic2 } from "lucide-react";

interface EffectSelectorProps {
  value: VoiceEffect;
  onChange: (effect: VoiceEffect) => void;
  disabled?: boolean;
}

/** Dropdown to select a voice transformation effect */
export function EffectSelector({
  value,
  onChange,
  disabled = false,
}: EffectSelectorProps) {
  const selected = VOICE_EFFECTS.find((e) => e.id === value);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Mic2 className="h-4 w-4 text-violet-400" />
        Voice Effect
      </label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as VoiceEffect)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an effect" />
        </SelectTrigger>
        <SelectContent>
          {VOICE_EFFECTS.map((effect) => (
            <SelectItem key={effect.id} value={effect.id}>
              {effect.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-xs text-slate-500">{selected.description}</p>
      )}
    </div>
  );
}
