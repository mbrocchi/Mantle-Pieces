import { GRID_H, GRID_W } from "shared";
import type { z } from "zod";
import type { digClearTileMessage, digNextSectorMessage } from "shared";
import { getSite, mutateSite } from "../../store/siteState";
import { appendLedgerEntry } from "../../store/ledger";
import { countCleared, emptyBitmask, isFootprintCleared, isTileCleared, setTileCleared } from "../../game/bitmask";
import { generateSectorRelics } from "../../game/relicPlacement";
import { broadcast, sendTo } from "../roomManager";
import { assignRelicToMantle } from "./mantle";
import type { ConnMeta } from "../connMeta";
import type { WebSocket } from "ws";

type DigClearTileMessage = z.infer<typeof digClearTileMessage>;
type DigNextSectorMessage = z.infer<typeof digNextSectorMessage>;

export function handleDigClearTile(socket: WebSocket, meta: ConnMeta, msg: DigClearTileMessage): void {
  const site = getSite(meta.siteId);
  if (!site) return;

  if (msg.sectorIndex !== site.currentSectorIndex) {
    sendTo(socket, { type: "error", code: "STALE_SECTOR", message: "That sector is no longer active" });
    return;
  }
  if (msg.x >= site.sector.width || msg.y >= site.sector.height) {
    sendTo(socket, { type: "error", code: "OUT_OF_BOUNDS", message: "Tile is outside the sector" });
    return;
  }
  if (isTileCleared(site.sector.tilesClearedBase64, msg.x, msg.y, site.sector.width)) {
    return; // already cleared, silently ignore (no double charge)
  }
  if (site.wallet.balance < 1) {
    sendTo(socket, { type: "error", code: "INSUFFICIENT_TOKENS", message: "Not enough shared tokens to dig" });
    return;
  }

  let unlockedRelicId: string | null = null;
  let sectorNowComplete = false;

  const updated = mutateSite(meta.siteId, (s) => {
    s.wallet.balance -= 1;
    s.sector.tilesClearedBase64 = setTileCleared(s.sector.tilesClearedBase64, msg.x, msg.y, s.sector.width);

    const relic = s.sector.relicPlacements.find(
      (r) => msg.x >= r.x && msg.x < r.x + r.w && msg.y >= r.y && msg.y < r.y + r.h
    );
    if (relic && !relic.unlockedAt && isFootprintCleared(s.sector.tilesClearedBase64, relic, s.sector.width)) {
      relic.unlockedAt = Date.now();
      unlockedRelicId = relic.id;
      s.collectedRelics[relic.id] = { ...relic };
    }

    if (countCleared(s.sector.tilesClearedBase64, s.sector.width, s.sector.height) === s.sector.width * s.sector.height) {
      s.sector.completedAt = Date.now();
      sectorNowComplete = true;
    }
  });
  if (!updated) return;

  appendLedgerEntry(meta.siteId, { delta: -1, reason: "dig_spend", actorUserId: meta.userId });

  broadcast(meta.siteId, { type: "wallet:update", balance: updated.wallet.balance });
  broadcast(meta.siteId, { type: "dig:tile_cleared", sectorIndex: msg.sectorIndex, x: msg.x, y: msg.y });

  if (unlockedRelicId) {
    const relic = updated.sector.relicPlacements.find((r) => r.id === unlockedRelicId)!;
    broadcast(meta.siteId, {
      type: "relic:unlocked",
      relicPlacementId: relic.id,
      relicTypeId: relic.relicTypeId,
      x: relic.x,
      y: relic.y,
      w: relic.w,
      h: relic.h,
    });
    assignRelicToMantle(meta.siteId, relic.id);
  }
  if (sectorNowComplete) {
    broadcast(meta.siteId, { type: "sector:completed", sectorIndex: msg.sectorIndex });
  }
}

export function handleDigNextSector(socket: WebSocket, meta: ConnMeta, _msg: DigNextSectorMessage): void {
  const site = getSite(meta.siteId);
  if (!site) return;

  const fullyCleared =
    countCleared(site.sector.tilesClearedBase64, site.sector.width, site.sector.height) ===
    site.sector.width * site.sector.height;
  if (!fullyCleared) {
    sendTo(socket, {
      type: "error",
      code: "SECTOR_INCOMPLETE",
      message: "Finish uncovering the whole site before moving on",
    });
    return;
  }

  const nextIndex = site.currentSectorIndex + 1;
  const relics = generateSectorRelics(site.currentVaultThemeIndex);

  const updated = mutateSite(meta.siteId, (s) => {
    s.currentSectorIndex = nextIndex;
    s.sector = {
      index: nextIndex,
      width: GRID_W,
      height: GRID_H,
      tilesClearedBase64: emptyBitmask(GRID_W, GRID_H),
      relicPlacements: relics,
      createdAt: Date.now(),
      completedAt: null,
    };
  });
  if (!updated) return;

  broadcast(meta.siteId, { type: "sector:new", sector: updated.sector });
}
