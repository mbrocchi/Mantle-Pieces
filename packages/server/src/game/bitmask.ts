function tileIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function emptyBitmask(width: number, height: number): string {
  return Buffer.alloc(Math.ceil((width * height) / 8)).toString("base64");
}

export function isTileCleared(base64: string, x: number, y: number, width: number): boolean {
  const buf = Buffer.from(base64, "base64");
  const idx = tileIndex(x, y, width);
  const byte = buf[idx >> 3] ?? 0;
  return ((byte >> (idx & 7)) & 1) === 1;
}

export function setTileCleared(base64: string, x: number, y: number, width: number): string {
  const buf = Buffer.from(base64, "base64");
  const idx = tileIndex(x, y, width);
  const byteIndex = idx >> 3;
  buf[byteIndex] = (buf[byteIndex] ?? 0) | (1 << (idx & 7));
  return buf.toString("base64");
}

export function isFootprintCleared(
  base64: string,
  relic: { x: number; y: number; w: number; h: number },
  width: number
): boolean {
  for (let dy = 0; dy < relic.h; dy++) {
    for (let dx = 0; dx < relic.w; dx++) {
      if (!isTileCleared(base64, relic.x + dx, relic.y + dy, width)) return false;
    }
  }
  return true;
}

export function countCleared(base64: string, width: number, height: number): number {
  const buf = Buffer.from(base64, "base64");
  let count = 0;
  for (let i = 0; i < width * height; i++) {
    if ((buf[i >> 3] >> (i & 7)) & 1) count++;
  }
  return count;
}
