import { chmodSync, copyFileSync, existsSync } from "fs";
import os from "os";
import path from "path";

let cachedPath: string | null = null;

/**
 * Resolve the FFmpeg binary path for both local dev and Vercel serverless.
 * Vercel does not bundle the binary by default — next.config must include it
 * via outputFileTracingIncludes. We also try cwd-relative paths used by
 * Vercel's official ffmpeg-on-vercel example.
 */
export function getFfmpegPath(): string {
  if (cachedPath && existsSync(cachedPath)) {
    return cachedPath;
  }

  const isWindows = process.platform === "win32";
  const binaryName = isWindows ? "ffmpeg.exe" : "ffmpeg";

  const candidates = [
    process.env.FFMPEG_BIN,
    // Vercel official example uses this relative path
    path.join(process.cwd(), "node_modules", "ffmpeg-static", binaryName),
    // Alternate location after Next.js output tracing
    path.join(
      process.cwd(),
      ".next",
      "server",
      "node_modules",
      "ffmpeg-static",
      binaryName
    ),
  ].filter((p): p is string => Boolean(p));

  // Path reported by ffmpeg-static package (may differ on serverless)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic = require("ffmpeg-static") as string | null;
    if (ffmpegStatic) {
      candidates.unshift(ffmpegStatic);
    }
  } catch {
    // Package resolution failed — fall through to manual paths
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    // Copy to /tmp on Linux serverless so the binary is executable
    if (!isWindows && process.env.VERCEL) {
      const tmpPath = path.join(os.tmpdir(), "ffmpeg");
      if (!existsSync(tmpPath)) {
        copyFileSync(candidate, tmpPath);
        chmodSync(tmpPath, 0o755);
      }
      cachedPath = tmpPath;
      return tmpPath;
    }

    cachedPath = candidate;
    return candidate;
  }

  throw new Error(
    `FFmpeg binary not found. Checked: ${candidates.join(", ")}`
  );
}
