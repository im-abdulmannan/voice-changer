import { VoiceChangerApp } from "@/components/voice-changer/VoiceChangerApp";
import { Waves, Zap, Shield, Headphones } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Waves className="h-4 w-4" />
            Powered by FFmpeg DSP
          </div>
          <h1 className="bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Voice Changer
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Transform your audio with classic digital signal processing. Upload
            or record your voice, preview, and download — all in your browser.
          </p>
        </header>

        {/* Main app */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <VoiceChangerApp />
        </div>

        {/* Feature pills */}
        <footer className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeaturePill
            icon={<Zap className="h-5 w-5 text-amber-400" />}
            title="Instant Processing"
            description="Server-side FFmpeg for fast, reliable audio transforms"
          />
          <FeaturePill
            icon={<Shield className="h-5 w-5 text-emerald-400" />}
            title="Secure Uploads"
            description="Files validated, processed, and cleaned up automatically"
          />
          <FeaturePill
            icon={<Headphones className="h-5 w-5 text-violet-400" />}
            title="5 Voice Effects"
            description="Deep, chipmunk, robot, echo, and telephone filters"
          />
        </footer>
      </main>
    </div>
  );
}

function FeaturePill({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
