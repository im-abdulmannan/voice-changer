import { unlink } from "fs/promises";
import { existsSync } from "fs";

/**
 * Safely delete temporary files after processing.
 * Silently ignores missing files to avoid race conditions.
 */
export async function cleanupFiles(...paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(async (filePath) => {
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch {
        // Best-effort cleanup — don't throw on failure
      }
    })
  );
}
