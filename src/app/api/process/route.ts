import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { cleanupFiles } from "@/lib/ffmpeg/cleanup";
import {
  generateTempFilename,
  getOutputExtension,
  getTempDir,
  processAudio,
} from "@/lib/ffmpeg/processor";
import { validateAudioFile, validateEffect } from "@/lib/validation";
import type { ApiErrorResponse, VoiceEffect } from "@/types/voice";

// FFmpeg requires Node.js runtime — not Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Maximum request duration for audio processing (60s) */
export const maxDuration = 60;

/**
 * POST /api/process
 * Accepts FormData with:
 *   - file: audio file (mp3, wav, m4a)
 *   - effect: voice effect ID
 * Returns the processed audio as a downloadable file.
 */
export async function POST(request: NextRequest) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const effectRaw = formData.get("effect");

    // Validate effect selection
    if (!validateEffect(typeof effectRaw === "string" ? effectRaw : null)) {
      return jsonError("Invalid or missing voice effect.", 400);
    }
    const effect = effectRaw as VoiceEffect;

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return jsonError("No audio file provided.", 400);
    }

    // Client-side validation mirror for security
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      return jsonError(validation.error ?? "Invalid file.", 400);
    }

    // Ensure temp directory exists
    const tempDir = getTempDir();
    await mkdir(tempDir, { recursive: true });

    // Save uploaded file to disk for FFmpeg processing
    const inputExt = path.extname(file.name) || ".mp3";
    const inputFilename = generateTempFilename("input", inputExt);
    inputPath = path.join(tempDir, inputFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Process audio with selected effect
    const outputFilename = generateTempFilename("output", getOutputExtension());
    outputPath = path.join(tempDir, outputFilename);

    await processAudio({
      inputPath,
      outputPath,
      effect,
    });

    // Read processed file and return as downloadable response
    const processedBuffer = await readFile(outputPath);
    const outputName = `voice-changed-${effect}${getOutputExtension()}`;

    return new NextResponse(processedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": processedBuffer.length.toString(),
        "X-Processing-Status": "success",
      },
    });
  } catch (error) {
    console.error("[API /process] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return jsonError(message, 500);
  } finally {
    // Always clean up temporary files
    const pathsToClean = [inputPath, outputPath].filter(
      (p): p is string => p !== null
    );
    await cleanupFiles(...pathsToClean);
  }
}

function jsonError(message: string, status: number): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}
