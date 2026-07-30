import { create } from "zustand";
import type { MantleState, RelicPlacement, RelicNote, SiteState } from "shared";
import { wsClient } from "../lib/wsClient";

interface MantleClientState {
  mantle: MantleState;
  collectedRelics: Record<string, RelicPlacement>;
  relicNotes: Record<string, RelicNote[]>;
}

const emptyMantle: MantleState = { slots: [], archive: [], pendingSwapQueue: [] };

export const useMantleStore = create<MantleClientState>(() => ({
  mantle: emptyMantle,
  collectedRelics: {},
  relicNotes: {},
}));

function applySite(site: SiteState) {
  useMantleStore.setState({
    mantle: site.mantle,
    collectedRelics: site.collectedRelics,
    relicNotes: site.relicNotes,
  });
}

wsClient.on("sync:state", (msg) => {
  if (msg.type === "sync:state" && msg.state) applySite(msg.state as SiteState);
});

wsClient.on("mantle:updated", (msg) => {
  if (msg.type !== "mantle:updated") return;
  useMantleStore.setState((prev) => ({
    mantle: { ...prev.mantle, slots: msg.slots, archive: msg.archive, pendingSwapQueue: prev.mantle.pendingSwapQueue.slice(1) },
  }));
});

wsClient.on("mantle:swap_required", (msg) => {
  if (msg.type !== "mantle:swap_required") return;
  useMantleStore.setState((prev) => ({
    mantle: {
      ...prev.mantle,
      pendingSwapQueue: prev.mantle.pendingSwapQueue[0] === msg.pendingRelicPlacementId
        ? prev.mantle.pendingSwapQueue
        : [...prev.mantle.pendingSwapQueue, msg.pendingRelicPlacementId],
    },
  }));
});

wsClient.on("relic:unlocked", (msg) => {
  if (msg.type !== "relic:unlocked") return;
  useMantleStore.setState((prev) => ({
    collectedRelics: {
      ...prev.collectedRelics,
      [msg.relicPlacementId]: {
        id: msg.relicPlacementId,
        relicTypeId: msg.relicTypeId,
        x: msg.x,
        y: msg.y,
        w: msg.w,
        h: msg.h,
        unlockedAt: Date.now(),
      },
    },
  }));
});

wsClient.on("note:added", (msg) => {
  if (msg.type !== "note:added") return;
  // Full note content (text/audio path) is fetched by re-syncing rather than duplicated over the wire twice.
  wsClient.send({ type: "sync:request" });
});
