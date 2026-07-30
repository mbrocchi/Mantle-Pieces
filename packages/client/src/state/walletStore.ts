import { create } from "zustand";
import type { SiteState } from "shared";
import { wsClient } from "../lib/wsClient";

interface WalletState {
  balance: number;
  setBalance: (n: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  setBalance: (n) => set({ balance: n }),
}));

wsClient.on("wallet:update", (msg) => {
  if (msg.type === "wallet:update") useWalletStore.getState().setBalance(msg.balance);
});

wsClient.on("sync:state", (msg) => {
  if (msg.type === "sync:state" && msg.state) {
    useWalletStore.getState().setBalance((msg.state as SiteState).wallet.balance);
  }
});
