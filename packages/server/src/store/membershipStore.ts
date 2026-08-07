import path from "node:path";
import { readJsonSync, writeJsonAtomicSync } from "./jsonFile";
import { DATA_DIR } from "./paths";

const MEMBERSHIPS_FILE = path.join(DATA_DIR, "memberships.json");

let cache: Record<string, string> | null = null;

function load(): Record<string, string> {
  if (!cache) cache = readJsonSync<Record<string, string>>(MEMBERSHIPS_FILE, {});
  return cache;
}

export function resetMembershipCache(): void {
  cache = null;
}

/** Each user belongs to exactly one family site at a time. */
export function getUserSiteId(userId: string): string | null {
  return load()[userId] ?? null;
}

export function setUserSiteId(userId: string, siteId: string): void {
  const memberships = load();
  memberships[userId] = siteId;
  writeJsonAtomicSync(MEMBERSHIPS_FILE, memberships);
}
