import type { RelicType } from "./types";

/**
 * Static, seeded content catalog — 10 relic types per vault theme, matching
 * VAULT_SLOTS, so "discover every type" and "fill every slot" land together.
 */
export const RELIC_CATALOG: RelicType[] = [
  { id: "clay-shard", vaultThemeIndex: 0, tier: "common", name: "Clay Shard", loreText: "A broken fragment of unglazed pottery, worn smooth by centuries in the dirt.", artAssetKey: "🧩", w: 1, h: 1 },
  { id: "bronze-coin", vaultThemeIndex: 0, tier: "common", name: "Bronze Coin", loreText: "A corroded coin, its minted face long since worn to shadow.", artAssetKey: "🪙", w: 1, h: 1 },
  { id: "stone-bead", vaultThemeIndex: 0, tier: "common", name: "Stone Bead", loreText: "A single bead from a necklace scattered generations ago.", artAssetKey: "🔘", w: 1, h: 1 },
  { id: "iron-nail", vaultThemeIndex: 0, tier: "common", name: "Iron Nail", loreText: "A hand-forged nail, likely from a long-collapsed structure.", artAssetKey: "📌", w: 1, h: 1 },
  { id: "glass-vial", vaultThemeIndex: 0, tier: "common", name: "Glass Vial", loreText: "A small vial, its contents evaporated long before it was buried.", artAssetKey: "🧪", w: 1, h: 1 },
  { id: "restored-jar", vaultThemeIndex: 0, tier: "rare", name: "Restored Jar", loreText: "A painted storage jar, remarkably intact beneath the sediment.", artAssetKey: "🏺", w: 2, h: 2 },
  { id: "engraved-tablet", vaultThemeIndex: 0, tier: "rare", name: "Engraved Tablet", loreText: "A stone tablet bearing an inscription no one in the family can read yet.", artAssetKey: "📜", w: 2, h: 2 },
  { id: "bronzist-lamp", vaultThemeIndex: 0, tier: "rare", name: "Bronzist Lamp", loreText: "An oil lamp cast in bronze, its wick-spout still faintly blackened.", artAssetKey: "🏮", w: 2, h: 2 },
  { id: "ceremonial-dagger", vaultThemeIndex: 0, tier: "rare", name: "Ceremonial Dagger", loreText: "An ornamental blade, too delicate for battle, likely used in ritual.", artAssetKey: "🗡️", w: 2, h: 2 },
  { id: "classical-bust", vaultThemeIndex: 0, tier: "heirloom", name: "Classical Bust", loreText: "A carved likeness of someone once important enough to be remembered in stone.", artAssetKey: "🗿", w: 4, h: 4 },
];

export function catalogForVaultTheme(vaultThemeIndex: number): RelicType[] {
  const themed = RELIC_CATALOG.filter((r) => r.vaultThemeIndex === vaultThemeIndex);
  return themed.length > 0 ? themed : RELIC_CATALOG.filter((r) => r.vaultThemeIndex === 0);
}

export function findRelicType(relicTypeId: string): RelicType | undefined {
  return RELIC_CATALOG.find((r) => r.id === relicTypeId);
}
