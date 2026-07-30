// Browser-safe base64 bit-array helpers (no Node Buffer available client-side).

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function isTileCleared(base64: string, x: number, y: number, width: number): boolean {
  const bytes = base64ToBytes(base64);
  const idx = y * width + x;
  const byte = bytes[idx >> 3] ?? 0;
  return ((byte >> (idx & 7)) & 1) === 1;
}

export function setTileCleared(base64: string, x: number, y: number, width: number): string {
  const bytes = base64ToBytes(base64);
  const idx = y * width + x;
  const byteIndex = idx >> 3;
  bytes[byteIndex] = (bytes[byteIndex] ?? 0) | (1 << (idx & 7));
  return bytesToBase64(bytes);
}
