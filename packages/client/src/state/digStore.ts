import { create } from "zustand";
import type { DigSector, RelicPlacement, SiteState } from "shared";
import { wsClient } from "../lib/wsClient";
import { setTileCleared } from "../game/bitmask";

interface DigState {
  sector: DigSector | null;
  celebratingRelic: RelicPlacement | null;
  setSector: (sector: DigSector) => void;
  markTileCleared: (x: number, y: number, width: number) => void;
  dismissCelebration: () => void;
}

export const useDigStore = create<DigState>((set, get) => ({
  sector: null,
  celebratingRelic: null,
  setSector: (sector) => set({ sector }),
  markTileCleared: (x, y, width) => {
    const sector = get().sector;
    if (!sector) return;
    set({ sector: { ...sector, tilesClearedBase64: setTileCleared(sector.tilesClearedBase64, x, y, width) } });
  },
  dismissCelebration: () => set({ celebratingRelic: null }),
}));

wsClient.on("sync:state", (msg) => {
  if (msg.type === "sync:state" && msg.state) {
    useDigStore.getState().setSector((msg.state as SiteState).sector);
  }
});

wsClient.on("dig:tile_cleared", (msg) => {
  if (msg.type === "dig:tile_cleared") {
    const sector = useDigStore.getState().sector;
    if (sector && msg.sectorIndex === sector.index) {
      useDigStore.getState().markTileCleared(msg.x, msg.y, sector.width);
    }
  }
});

wsClient.on("relic:unlocked", (msg) => {
  if (msg.type !== "relic:unlocked") return;
  const sector = useDigStore.getState().sector;
  if (!sector) return;
  const updatedPlacements = sector.relicPlacements.map((r) =>
    r.id === msg.relicPlacementId ? { ...r, unlockedAt: Date.now() } : r
  );
  const unlocked = updatedPlacements.find((r) => r.id === msg.relicPlacementId) ?? null;
  useDigStore.setState({
    sector: { ...sector, relicPlacements: updatedPlacements },
    celebratingRelic: unlocked,
  });
});

wsClient.on("sector:completed", (msg) => {
  if (msg.type !== "sector:completed") return;
  const sector = useDigStore.getState().sector;
  if (sector && msg.sectorIndex === sector.index) {
    useDigStore.setState({ sector: { ...sector, completedAt: Date.now() } });
  }
});

wsClient.on("sector:new", (msg) => {
  if (msg.type === "sector:new" && msg.sector) {
    useDigStore.getState().setSector(msg.sector as DigSector);
  }
});
