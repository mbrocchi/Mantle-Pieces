import { VAULT_SLOTS } from "shared";
import type { z } from "zod";
import type { mantleSwapRelicMessage } from "shared";
import { getSite, mutateSite } from "../../store/siteState";
import { broadcast, sendTo } from "../roomManager";
import type { ConnMeta } from "../connMeta";
import type { WebSocket } from "ws";

type MantleSwapRelicMessage = z.infer<typeof mantleSwapRelicMessage>;

/** Called right after a relic unlocks: auto-fills an empty slot, or queues a swap prompt if the vault is full. */
export function assignRelicToMantle(siteId: string, relicPlacementId: string): void {
  const site = getSite(siteId);
  if (!site) return;

  const emptyIndex = site.mantle.slots.findIndex((slot) => slot === null);
  if (emptyIndex !== -1) {
    const updated = mutateSite(siteId, (s) => {
      s.mantle.slots[emptyIndex] = relicPlacementId;
    });
    if (updated) {
      broadcast(siteId, {
        type: "mantle:updated",
        slots: updated.mantle.slots,
        archive: updated.mantle.archive,
      });
    }
    return;
  }

  // Vault full: queue rather than overwrite, so a burst of unlocks never drops an earlier pending swap.
  const wasEmpty = site.mantle.pendingSwapQueue.length === 0;
  mutateSite(siteId, (s) => {
    s.mantle.pendingSwapQueue.push(relicPlacementId);
  });
  if (wasEmpty) {
    broadcast(siteId, { type: "mantle:swap_required", pendingRelicPlacementId: relicPlacementId });
  }
}

export function handleMantleSwapRelic(socket: WebSocket, meta: ConnMeta, msg: MantleSwapRelicMessage): void {
  const site = getSite(meta.siteId);
  if (!site) return;

  if (site.mantle.pendingSwapQueue[0] !== msg.incomingRelicPlacementId) {
    sendTo(socket, { type: "error", code: "STALE_SWAP", message: "That swap has already been resolved" });
    return;
  }
  if (msg.slotIndex < 0 || msg.slotIndex >= VAULT_SLOTS) {
    sendTo(socket, { type: "error", code: "INVALID_SLOT", message: "Invalid slot index" });
    return;
  }
  const removedRelicId = site.mantle.slots[msg.slotIndex];
  if (!removedRelicId) {
    sendTo(socket, { type: "error", code: "EMPTY_SLOT", message: "That slot is already empty" });
    return;
  }

  const updated = mutateSite(meta.siteId, (s) => {
    s.mantle.archive.push({ relicPlacementId: removedRelicId, archivedAt: Date.now() });
    s.mantle.slots[msg.slotIndex] = msg.incomingRelicPlacementId;
    s.mantle.pendingSwapQueue.shift();
  });
  if (!updated) return;

  broadcast(meta.siteId, {
    type: "mantle:updated",
    slots: updated.mantle.slots,
    archive: updated.mantle.archive,
  });

  const next = updated.mantle.pendingSwapQueue[0];
  if (next) {
    broadcast(meta.siteId, { type: "mantle:swap_required", pendingRelicPlacementId: next });
  }
}
