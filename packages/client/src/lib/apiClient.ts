import type { PublicUser, PuzzleProgress, RelicNote, SiteState } from "shared";

const TOKEN_KEY = "mantle_pieces_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? body.error ?? "Request failed");
  }
  return body as T;
}

export function register(username: string, password: string) {
  return request<{ token: string; user: PublicUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return request<{ token: string; user: PublicUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function createSite() {
  return request<{ site: SiteState }>("/sites", { method: "POST" });
}

export function joinSite(code: string) {
  return request<{ site: SiteState }>("/sites/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function getMySite() {
  return request<{ site: SiteState }>("/sites/mine");
}

export function getMe() {
  return request<{ user: PublicUser }>("/auth/me");
}

export function resetAllData() {
  return request<{ ok: boolean }>("/admin/reset-all-data", { method: "POST" });
}

export function getPuzzleProgress() {
  return request<{ progress: PuzzleProgress | null }>("/puzzle/progress");
}

export async function addTextNote(relicPlacementId: string, textContent: string) {
  return request<{ note: RelicNote }>(`/relics/${relicPlacementId}/notes`, {
    method: "POST",
    body: JSON.stringify({ type: "text", textContent }),
  });
}

export async function addAudioNote(relicPlacementId: string, blob: Blob) {
  const form = new FormData();
  form.append("audio", blob, "note.webm");
  const token = getStoredToken();
  const res = await fetch(`/api/relics/${relicPlacementId}/notes`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? body.error ?? "Request failed");
  return body as { note: RelicNote };
}

/** Fetches the audio with the auth header (never in the URL/query string) and returns a blob object URL. */
export async function loadAudioNoteUrl(audioPath: string): Promise<string> {
  const token = getStoredToken();
  const res = await fetch(`/api/audio/${audioPath}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new ApiError(res.status, "Could not load recording");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export { ApiError };
