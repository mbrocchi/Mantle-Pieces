import fs from "node:fs";
import path from "node:path";

/**
 * Synchronous JSON read/write helpers. Synchronous is deliberate: every WS/REST
 * handler mutates in-memory state and persists it within one synchronous call
 * stack (no `await` between read and write), so Node's single-threaded event
 * loop makes concurrent mutation races impossible without any locking.
 */

export function readJsonSync<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

/** Write-to-temp-then-rename: an atomic replace that avoids a half-written file on crash. */
export function writeJsonAtomicSync(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpPath, filePath);
}

export function appendJsonlSync(filePath: string, entry: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf-8");
}
