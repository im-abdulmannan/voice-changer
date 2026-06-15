import { VoiceChangerSkeleton } from "@/components/voice-changer/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <VoiceChangerSkeleton />
    </div>
  );
}
