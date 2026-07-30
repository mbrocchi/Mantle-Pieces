import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { findRelicType } from "shared";
import { useDigStore } from "../state/digStore";
import { useWalletStore } from "../state/walletStore";
import { wsClient } from "../lib/wsClient";
import { isTileCleared } from "../game/bitmask";

const TILE_SIZE = 36;

export function DigScreen() {
  const sector = useDigStore((s) => s.sector);
  const celebratingRelic = useDigStore((s) => s.celebratingRelic);
  const dismissCelebration = useDigStore((s) => s.dismissCelebration);
  const balance = useWalletStore((s) => s.balance);

  if (!sector) {
    return (
      <div className="app-screen bg-gradient-to-b from-sky-900 to-amber-900 flex items-center justify-center">
        <p className="text-gray-200 text-sm">Connecting to the dig site...</p>
      </div>
    );
  }

  const unlockedCount = sector.relicPlacements.filter((r) => r.unlockedAt).length;
  const totalRelics = sector.relicPlacements.length;
  const sectorComplete = sector.completedAt !== null;

  function tapTile(x: number, y: number) {
    if (!sector) return;
    if (isTileCleared(sector.tilesClearedBase64, x, y, sector.width)) return;
    if (balance < 1) return;
    wsClient.send({ type: "dig:clear_tile", sectorIndex: sector.index, x, y });
  }

  function excavateNextSector() {
    wsClient.send({ type: "dig:next_sector" });
  }

  const tiles: ReactNode[] = [];
  for (let y = 0; y < sector.height; y++) {
    for (let x = 0; x < sector.width; x++) {
      const cleared = isTileCleared(sector.tilesClearedBase64, x, y, sector.width);
      tiles.push(
        <button
          key={`${x},${y}`}
          onClick={() => tapTile(x, y)}
          className="p-0 border border-black/20 transition-transform active:scale-90"
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: cleared
              ? "linear-gradient(135deg, #7c5a3a, #6b4a2c)"
              : "linear-gradient(135deg, #c99a5b, #a97a3d)",
          }}
        />
      );
    }
  }

  const relicOverlays = sector.relicPlacements
    .filter((r) => r.unlockedAt)
    .map((r) => {
      const type = findRelicType(r.relicTypeId);
      return (
        <div
          key={r.id}
          className="flex items-center justify-center rounded-md bg-black/30 shadow-[0_0_10px_2px_rgba(212,175,55,0.5)]"
          style={{
            gridColumn: `${r.x + 1} / span ${r.w}`,
            gridRow: `${r.y + 1} / span ${r.h}`,
          }}
        >
          <span style={{ fontSize: Math.min(r.w, r.h) * TILE_SIZE * 0.55 }}>{type?.artAssetKey ?? "❔"}</span>
        </div>
      );
    });

  return (
    <div className="app-screen bg-gradient-to-b from-sky-900 to-amber-950 flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-white">
        <div>
          <div className="text-[10px] text-gray-300 font-bold">SITE</div>
          <div className="font-bold">Sector {sector.index + 1}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-300 font-bold">DIG TOKENS</div>
          <div className="font-bold text-gold">{balance}</div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="bg-black/30 rounded-full px-4 py-2 text-center text-white text-xs font-semibold">
          Relics uncovered: {unlockedCount}/{totalRelics}
        </div>
      </div>

      {sectorComplete && (
        <div className="px-4 pb-3">
          <button
            onClick={excavateNextSector}
            className="w-full bg-gold text-navy font-bold rounded-xl px-4 py-3 transition-transform active:scale-95"
          >
            Excavate Next Sector
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div
          className="relative inline-grid rounded-lg overflow-hidden ring-2 ring-amber-700/60"
          style={{
            gridTemplateColumns: `repeat(${sector.width}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${sector.height}, ${TILE_SIZE}px)`,
          }}
        >
          {tiles}
          {relicOverlays}
        </div>
      </div>

      <AnimatePresence>
        {celebratingRelic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 px-8"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="bg-mahogany rounded-2xl p-6 text-center border-2 border-gold max-w-xs"
            >
              <p className="text-gold text-xs font-bold tracking-widest mb-2">NEW FAMILY HEIRLOOM DISCOVERED!</p>
              <div className="text-5xl mb-3">{findRelicType(celebratingRelic.relicTypeId)?.artAssetKey}</div>
              <p className="text-white font-bold mb-2">{findRelicType(celebratingRelic.relicTypeId)?.name}</p>
              <p className="text-gray-300 text-xs mb-4">{findRelicType(celebratingRelic.relicTypeId)?.loreText}</p>
              <button
                onClick={dismissCelebration}
                className="bg-gold text-navy font-bold rounded-xl px-4 py-2 w-full transition-transform active:scale-95"
              >
                Add to Mantlepiece
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
