import { readJsonSync, writeJsonAtomicSync } from "./jsonFile";
import { puzzleProgressFilePath } from "./paths";
import type { PuzzleProgress } from "shared";

const puzzleProgressCache = new Map<string, PuzzleProgress>();

export function getPuzzleProgress(userId: string): PuzzleProgress | null {
  const cached = puzzleProgressCache.get(userId);
  if (cached) return cached;
  const loaded = readJsonSync<PuzzleProgress | null>(puzzleProgressFilePath(userId), null);
  if (loaded) puzzleProgressCache.set(userId, loaded);
  return loaded;
}

export function savePuzzleProgress(userId: string, progress: PuzzleProgress): void {
  puzzleProgressCache.set(userId, progress);
  writeJsonAtomicSync(puzzleProgressFilePath(userId), progress);
}
