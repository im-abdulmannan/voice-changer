"use client";

import { Toaster as Sonner } from "sonner";

/** Global toast notification provider */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-slate-900/95 border border-white/10 text-white backdrop-blur-xl shadow-2xl",
          description: "text-slate-400",
          actionButton: "bg-violet-600 text-white",
          cancelButton: "bg-white/10 text-white",
        },
      }}
    />
  );
}
