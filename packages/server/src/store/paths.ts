import path from "node:path";

export const DATA_DIR = path.resolve(process.cwd(), "data");
export const SITES_DIR = path.join(DATA_DIR, "sites");
export const LEDGER_DIR = path.join(DATA_DIR, "ledger");
export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads", "audio");

export const USERS_FILE = path.join(DATA_DIR, "users.json");
export const INVITE_INDEX_FILE = path.join(DATA_DIR, "invite-index.json");
export const RELIC_CATALOG_FILE = path.join(DATA_DIR, "relic-catalog.json");

export function siteFilePath(siteId: string): string {
  return path.join(SITES_DIR, `${siteId}.json`);
}

export function ledgerFilePath(siteId: string): string {
  return path.join(LEDGER_DIR, `${siteId}.jsonl`);
}
