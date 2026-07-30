import { randomUUID } from "node:crypto";
import { readJsonSync, writeJsonAtomicSync } from "./jsonFile";
import { siteFilePath } from "./paths";
import { GRID_W, GRID_H, VAULT_SLOTS } from "shared";
import type { SiteState } from "shared";
import { emptyBitmask } from "../game/bitmask";
import { generateSectorRelics } from "../game/relicPlacement";

const siteCache = new Map<string, SiteState>();

export function createEmptySiteState(inviteCode: string): SiteState {
  const now = Date.now();
  return {
    id: randomUUID(),
    inviteCode,
    createdAt: now,
    members: [],
    wallet: { balance: 0 },
    currentVaultThemeIndex: 0,
    currentSectorIndex: 0,
    sector: {
      index: 0,
      width: GRID_W,
      height: GRID_H,
      tilesClearedBase64: emptyBitmask(GRID_W, GRID_H),
      relicPlacements: generateSectorRelics(0),
      createdAt: now,
      completedAt: null,
    },
    collectedRelics: {},
    mantle: {
      slots: new Array(VAULT_SLOTS).fill(null),
      archive: [],
      pendingSwapQueue: [],
    },
    relicNotes: {},
  };
}

export function getSite(siteId: string): SiteState | null {
  const cached = siteCache.get(siteId);
  if (cached) return cached;
  const loaded = readJsonSync<SiteState | null>(siteFilePath(siteId), null);
  if (loaded) siteCache.set(siteId, loaded);
  return loaded;
}

export function putSite(site: SiteState): void {
  siteCache.set(site.id, site);
  persistSite(site.id);
}

export function persistSite(siteId: string): void {
  const site = siteCache.get(siteId);
  if (!site) return;
  writeJsonAtomicSync(siteFilePath(siteId), site);
}

export function mutateSite(siteId: string, mutator: (site: SiteState) => void): SiteState | null {
  const site = getSite(siteId);
  if (!site) return null;
  mutator(site);
  persistSite(siteId);
  return site;
}
