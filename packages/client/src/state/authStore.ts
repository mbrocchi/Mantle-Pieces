import { create } from "zustand";
import type { PublicUser, SiteState } from "shared";
import {
  ApiError,
  clearStoredToken,
  getMe,
  getMySite,
  getStoredToken,
  joinSite,
  login,
  createSite,
  register,
  storeToken,
} from "../lib/apiClient";
import { useWalletStore } from "./walletStore";
import { useDigStore } from "./digStore";
import { useMantleStore } from "./mantleStore";
import { wsClient } from "../lib/wsClient";

interface AuthState {
  status: "loading" | "signed_out" | "signed_in";
  user: PublicUser | null;
  site: SiteState | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  doRegister: (username: string, password: string) => Promise<void>;
  doLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
  doCreateSite: () => Promise<void>;
  doJoinSite: (code: string) => Promise<void>;
  setSite: (site: SiteState) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  site: null,
  error: null,

  bootstrap: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ status: "signed_out" });
      return;
    }
    let user: PublicUser | null = null;
    try {
      user = (await getMe()).user;
    } catch {
      clearStoredToken();
      set({ status: "signed_out" });
      return;
    }
    try {
      const { site } = await getMySite();
      set({ status: "signed_in", user, site });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Token is valid but user hasn't joined/created a site yet.
        set({ status: "signed_in", user, site: null });
        return;
      }
      clearStoredToken();
      set({ status: "signed_out" });
    }
  },

  doRegister: async (username, password) => {
    set({ error: null });
    try {
      const { token, user } = await register(username, password);
      storeToken(token);
      set({ status: "signed_in", user, site: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Registration failed" });
      throw err;
    }
  },

  doLogin: async (username, password) => {
    set({ error: null });
    try {
      const { token, user } = await login(username, password);
      storeToken(token);
      let site: SiteState | null = null;
      try {
        site = (await getMySite()).site;
      } catch {
        site = null;
      }
      set({ status: "signed_in", user, site });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed" });
      throw err;
    }
  },

  logout: () => {
    wsClient.disconnect();
    clearStoredToken();
    set({ status: "signed_out", user: null, site: null });
    // Reset per-domain state so no stale board/wallet/vault data leaks into the next session.
    useWalletStore.setState({ balance: 0 });
    useDigStore.setState({ sector: null, celebratingRelic: null });
    useMantleStore.setState({ mantle: { slots: [], archive: [], pendingSwapQueue: [] }, collectedRelics: {}, relicNotes: {} });
  },

  doCreateSite: async () => {
    set({ error: null });
    try {
      const { site } = await createSite();
      set({ site });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not create site" });
      throw err;
    }
  },

  doJoinSite: async (code) => {
    set({ error: null });
    try {
      const { site } = await joinSite(code);
      set({ site });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Could not join site" });
      throw err;
    }
  },

  setSite: (site) => set({ site }),
  clearError: () => set({ error: null }),
}));
