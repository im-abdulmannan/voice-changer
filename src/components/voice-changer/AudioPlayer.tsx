"use client";

import { useEffect, useRef } from "react";
import { Download, Music2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  /** Blob URL or object URL for the audio source */
  src: string | null;
  /** Label shown above the player */
  label: string;
  /** Optional download handler */
  onDownload?: () => void;
  /** Whether download is available */
  canDownload?: boolean;
  className?: string;
}

/**
 * Audio preview player with native HTML5 controls.
 * Revokes object URLs on unmount to prevent memory leaks.
 */
export function AudioPlayer({
  src,
  label,
  onDownload,
  canDownload = false,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset playback when source changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  if (!src) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
            <Volume2 className="h-4 w-4 text-violet-400" />
          </div>
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        {canDownload && onDownload && (
          <Button variant="secondary" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>
      <audio
        ref={audioRef}
        src={src}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

/** Placeholder shown when no audio is loaded */
export function AudioPlayerPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10">
      <Music2 className="mb-3 h-10 w-10 text-slate-600" />
      <p className="text-sm text-slate-500">
        Upload or record audio, then apply an effect to preview results
      </p>
    </div>
  );
}
