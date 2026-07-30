import { randomUUID } from "node:crypto";
import { GRID_W, GRID_H, catalogForVaultTheme, type RelicPlacement, type RelicType } from "shared";

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const picks: T[] = [];
  for (let i = 0; i < n && arr.length > 0; i++) picks.push(pickRandom(arr));
  return picks;
}

function fits(occupied: boolean[][], x: number, y: number, w: number, h: number): boolean {
  if (x < 0 || y < 0 || x + w > GRID_W || y + h > GRID_H) return false;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (occupied[y + dy][x + dx]) return false;
    }
  }
  return true;
}

function markOccupied(occupied: boolean[][], x: number, y: number, w: number, h: number): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      occupied[y + dy][x + dx] = true;
    }
  }
}

function findPlacement(occupied: boolean[][], w: number, h: number): { x: number; y: number } | null {
  for (let attempt = 0; attempt < 200; attempt++) {
    const x = randInt(0, GRID_W - w);
    const y = randInt(0, GRID_H - h);
    if (fits(occupied, x, y, w, h)) return { x, y };
  }
  for (let y = 0; y <= GRID_H - h; y++) {
    for (let x = 0; x <= GRID_W - w; x++) {
      if (fits(occupied, x, y, w, h)) return { x, y };
    }
  }
  return null;
}

/** Largest-first bin-packing of a randomized relic quota into a fresh sector. */
export function generateSectorRelics(vaultThemeIndex: number): RelicPlacement[] {
  const catalog = catalogForVaultTheme(vaultThemeIndex);
  const heirlooms = catalog.filter((r) => r.tier === "heirloom");
  const rares = catalog.filter((r) => r.tier === "rare");
  const commons = catalog.filter((r) => r.tier === "common");

  // Intentionally not filtered against already-collected relics: types the family already
  // has on the mantle can reappear in a new sector alongside undiscovered ones.
  const quota: RelicType[] = [
    ...pickN(heirlooms, randInt(1, 1)),
    ...pickN(rares, randInt(2, 3)),
    ...pickN(commons, randInt(5, 8)),
  ].sort((a, b) => b.w * b.h - a.w * a.h);

  const occupied: boolean[][] = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
  const placements: RelicPlacement[] = [];

  for (const relicType of quota) {
    const pos = findPlacement(occupied, relicType.w, relicType.h);
    if (!pos) continue;
    markOccupied(occupied, pos.x, pos.y, relicType.w, relicType.h);
    placements.push({
      id: randomUUID(),
      relicTypeId: relicType.id,
      x: pos.x,
      y: pos.y,
      w: relicType.w,
      h: relicType.h,
      unlockedAt: null,
    });
  }

  return placements;
}
