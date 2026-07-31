import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { findRelicType } from "shared";
import { useDigStore } from "../state/digStore";
import { useWalletStore } from "../state/walletStore";
import { wsClient } from "../lib/wsClient";
import { isTileCleared } from "../game/bitmask";

const MIN_TILE_SIZE = 40;
const MAX_TILE_SIZE = 104;
// Matches the surrounding container's own px-4 (left+right) / pb-4 (bottom) padding,
// which clientWidth/clientHeight include but which isn't usable space for the grid itself.
const CONTAINER_H_PADDING = 32;
const CONTAINER_V_PADDING = 16;
const SHARD_COLORS = ["#8a6a45", "#6b4a2c", "#c99a5b", "#4a3620"];
const SHARD_COUNT = 7;
const SHATTER_DURATION_MS = 550;

interface Shatter {
  id: string;
  x: number;
  y: number;
}

export function DigScreen({ active = true }: { active?: boolean }) {
  const sector = useDigStore((s) => s.sector);
  const celebratingRelic = useDigStore((s) => s.celebratingRelic);
  const dismissCelebration = useDigStore((s) => s.dismissCelebration);
  const balance = useWalletStore((s) => s.balance);
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(MIN_TILE_SIZE);
  const [shatters, setShatters] = useState<Shatter[]>([]);

  useEffect(() => {
    // Reacts to the server broadcast (not the local click) so every family member sees the
    // breaking-block effect for every dig, not just the tiles they personally tapped.
    return wsClient.on("dig:tile_cleared", (msg) => {
      if (msg.type !== "dig:tile_cleared") return;
      if (!sector || msg.sectorIndex !== sector.index) return;
      const id = `${msg.x},${msg.y},${Date.now()}-${Math.random()}`;
      setShatters((prev) => [...prev, { id, x: msg.x, y: msg.y }]);
      setTimeout(() => setShatters((prev) => prev.filter((s) => s.id !== id)), SHATTER_DURATION_MS);
    });
  }, [sector?.index]);

  useEffect(() => {
    const el = gridAreaRef.current;
    // Tab content stays mounted but display:none while inactive, so a measurement taken
    // while hidden reads a zero-size box — skip it and wait for the tab to become active.
    if (!el || !sector || !active) return;

    function computeTileSize() {
      if (!el || !sector) return;
      const availableWidth = el.clientWidth - CONTAINER_H_PADDING;
      const availableHeight = el.clientHeight - CONTAINER_V_PADDING;
      if (availableWidth <= 0 || availableHeight <= 0) return;
      const fit = Math.floor(Math.min(availableWidth / sector.width, availableHeight / sector.height));
      setTileSize(Math.max(MIN_TILE_SIZE, Math.min(fit, MAX_TILE_SIZE)));
    }

    computeTileSize();
    const observer = new ResizeObserver(computeTileSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sector?.width, sector?.height, active]);

  if (!sector) {
    return (
      <div className="app-screen bg-gradient-to-b from-sky-900/60 to-amber-900/80 flex items-center justify-center">
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
          className="p-0 border border-black/20 transition-all duration-300 active:scale-90"
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
            width: tileSize,
            height: tileSize,
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
          {type ? (
            <img
              src={type.artAssetKey}
              alt={type.name}
              className="object-contain"
              style={{ width: Math.min(r.w, r.h) * tileSize * 0.8, height: Math.min(r.w, r.h) * tileSize * 0.8 }}
            />
          ) : (
            <span style={{ fontSize: Math.min(r.w, r.h) * tileSize * 0.55 }}>❔</span>
          )}
        </div>
      );
    });

  const shatterBursts = shatters.map((s) => (
    <div
      key={s.id}
      className="relative pointer-events-none"
      style={{ gridColumn: s.x + 1, gridRow: s.y + 1 }}
    >
      {Array.from({ length: SHARD_COUNT }).map((_, i) => {
        const angle = (i / SHARD_COUNT) * Math.PI * 2 + Math.random() * 0.4;
        const distance = tileSize * (0.55 + Math.random() * 0.35);
        return (
          <motion.div
            key={i}
            initial={{ x: "-50%", y: "-50%", opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: `calc(-50% + ${Math.cos(angle) * distance}px)`,
              y: `calc(-50% + ${Math.sin(angle) * distance - tileSize * 0.2}px)`,
              opacity: 0,
              rotate: (Math.random() - 0.5) * 360,
              scale: 0.3,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 rounded-sm"
            style={{
              width: tileSize * 0.16,
              height: tileSize * 0.16,
              background: SHARD_COLORS[i % SHARD_COLORS.length],
            }}
          />
        );
      })}
    </div>
  ));

  return (
    <div className="app-screen bg-gradient-to-b from-sky-900/60 to-amber-950/85 flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
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
        <div className="bg-black/40 rounded-full px-4 py-2 text-center text-white text-xs font-semibold shadow-lg shadow-black/40">
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

      <div ref={gridAreaRef} className="flex-1 overflow-auto px-4 pb-4 flex items-center justify-center">
        <div
          className="relative inline-grid rounded-lg overflow-hidden ring-2 ring-amber-700/60 shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
          style={{
            gridTemplateColumns: `repeat(${sector.width}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${sector.height}, ${tileSize}px)`,
          }}
        >
          {tiles}
          {relicOverlays}
          {shatterBursts}
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
              <img
                src={findRelicType(celebratingRelic.relicTypeId)?.artAssetKey}
                alt={findRelicType(celebratingRelic.relicTypeId)?.name}
                className="w-24 h-24 mx-auto mb-3 object-contain"
              />
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
