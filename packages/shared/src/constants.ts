export const GRID_W = 10;
export const GRID_H = 10;

export const PUZZLE_SIZE = 6;

export const GEM_COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
] as const;

export const VAULT_SLOTS = 10;

export const RELIC_TIERS = ["common", "rare", "heirloom"] as const;

export const RELIC_FOOTPRINT: Record<(typeof RELIC_TIERS)[number], number> = {
  common: 1,
  rare: 2,
  heirloom: 4,
};
