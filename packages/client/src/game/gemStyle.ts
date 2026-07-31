import type { GemColor } from "shared";

/** Antique/relic-themed palette so the puzzle dots read as treasures, not
 *  generic web colors: gold, bronze, silver, tarnished copper, ruby, amethyst. */
const GEM_HEX: Record<GemColor, { base: string; dark: string }> = {
  red: { base: "#c62f4b", dark: "#4a0f1d" }, // ruby
  blue: { base: "#b9c2c9", dark: "#4d5a63" }, // silver
  green: { base: "#7ba489", dark: "#2c4433" }, // tarnished copper / verdigris
  yellow: { base: "#d4af37", dark: "#7a5c14" }, // gold
  orange: { base: "#cd7f32", dark: "#5c3a17" }, // bronze
  purple: { base: "#9a6bc0", dark: "#452c62" }, // amethyst
};

export function gemGradient(color: GemColor): string {
  const { base, dark } = GEM_HEX[color];
  return `radial-gradient(circle at 32% 26%, #ffffffcc 0%, ${base} 32%, ${dark} 100%)`;
}

export function gemHex(color: GemColor): string {
  return GEM_HEX[color].base;
}
