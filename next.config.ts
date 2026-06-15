import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FFmpeg packages must run on the server — exclude from client bundling
  serverExternalPackages: ["fluent-ffmpeg", "ffmpeg-static"],

  experimental: {
    // Allow larger file uploads via server actions (25MB max)
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
