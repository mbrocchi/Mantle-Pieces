import type { GemColor } from "shared";

const GEM_HEX: Record<GemColor, { base: string; dark: string }> = {
  red: { base: "#ef4444", dark: "#7f1d1d" },
  blue: { base: "#3b82f6", dark: "#1e3a8a" },
  green: { base: "#22c55e", dark: "#14532d" },
  yellow: { base: "#eab308", dark: "#713f12" },
  orange: { base: "#f97316", dark: "#7c2d12" },
  purple: { base: "#a855f7", dark: "#581c87" },
};

export function gemGradient(color: GemColor): string {
  const { base, dark } = GEM_HEX[color];
  return `radial-gradient(circle at 32% 26%, #ffffffcc 0%, ${base} 32%, ${dark} 100%)`;
}

export function gemHex(color: GemColor): string {
  return GEM_HEX[color].base;
}
