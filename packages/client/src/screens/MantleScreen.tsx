import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { findRelicType, VAULT_SLOTS } from "shared";
import { useMantleStore } from "../state/mantleStore";
import { RelicDetailCard } from "../components/RelicDetailCard";
import { ArchiveBox } from "../components/ArchiveBox";
import { SwapModal } from "../components/SwapModal";
import { DigTokenBadge } from "../components/DigTokenBadge";

/** Percentage-based position for each of the 10 mantle slots, matching the 3 shelf
 *  bands painted in /mantle-shelf.png (3 slots on the narrower top shelf, 4 across
 *  the wider middle shelf, 3 on the narrower bottom shelf). Each box is anchored so
 *  its bottom edge sits on the shelf's own painted surface (recalibrated against an
 *  actual rendered screenshot — the earlier estimate floated items above the shelves,
 *  especially the bottom one). */
const SHELF_SLOTS: { top: string; left: string; width: string; height: string }[] = [
  { top: "24%", left: "17%", width: "18%", height: "13%" },
  { top: "24%", left: "41%", width: "18%", height: "13%" },
  { top: "24%", left: "65%", width: "18%", height: "13%" },
  { top: "42%", left: "7%", width: "17%", height: "11%" },
  { top: "42%", left: "27%", width: "17%", height: "11%" },
  { top: "42%", left: "48%", width: "17%", height: "11%" },
  { top: "42%", left: "69%", width: "17%", height: "11%" },
  { top: "67%", left: "17%", width: "18%", height: "14%" },
  { top: "67%", left: "41%", width: "18%", height: "14%" },
  { top: "67%", left: "65%", width: "18%", height: "14%" },
];

export function MantleScreen() {
  const mantle = useMantleStore((s) => s.mantle);
  const collectedRelics = useMantleStore((s) => s.collectedRelics);
  const [selectedRelicId, setSelectedRelicId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const discoveredTypeCount = new Set(Object.values(collectedRelics).map((r) => r.relicTypeId)).size;
  const completionPct = Math.min(100, (discoveredTypeCount / VAULT_SLOTS) * 100);

  return (
    <div className="app-screen bg-gradient-to-b from-mahogany-dark/70 to-black/85 flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
        <div>
          <div className="text-[10px] text-gray-300 font-bold">MANTLE</div>
          <div className="font-bold">Vault 1</div>
        </div>
        <DigTokenBadge />
      </div>

      <div className="px-4 pb-3">
        <div className="bg-black/40 rounded-xl px-4 py-2 text-white text-xs font-semibold shadow-lg shadow-black/40">
          <div className="flex justify-between mb-1">
            <span>Mantlepiece Completion</span>
            <span>
              {discoveredTypeCount}/{VAULT_SLOTS}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gold" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-3">
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="relative h-full max-w-full" style={{ aspectRatio: "768 / 1376" }}>
            <img
              src="/mantle-shelf.png"
              alt="Family mantlepiece"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />
            {mantle.slots.map((relicPlacementId, i) => {
              const placement = relicPlacementId ? collectedRelics[relicPlacementId] : null;
              const type = placement ? findRelicType(placement.relicTypeId) : undefined;
              const pos = SHELF_SLOTS[i];
              return (
                <button
                  key={i}
                  disabled={!relicPlacementId}
                  onClick={() => relicPlacementId && setSelectedRelicId(relicPlacementId)}
                  className="absolute flex items-end justify-center transition-transform active:scale-95"
                  style={{ top: pos.top, left: pos.left, width: pos.width, height: pos.height }}
                >
                  {type && (
                    <div className="relative w-full h-full flex items-end justify-center">
                      {/* soft breathing aura behind the item */}
                      <motion.div
                        className="absolute inset-[2%] rounded-full bg-gold"
                        style={{ filter: "blur(9px)" }}
                        animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.9, 1.08, 0.9] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <img
                        src={type.artAssetKey}
                        alt={type.name}
                        className="relative w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)]"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowArchive(true)}
          className="w-full mt-2 bg-black/40 text-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg shadow-black/40 transition-transform active:scale-95"
        >
          Archive Storage Box ({mantle.archive.length})
        </button>
      </div>

      <AnimatePresence>
        {selectedRelicId && (
          <RelicDetailCard
            key="detail"
            relicPlacementId={selectedRelicId}
            onClose={() => setSelectedRelicId(null)}
          />
        )}

        {showArchive && (
          <ArchiveBox
            key="archive"
            onClose={() => setShowArchive(false)}
            onSelectRelic={(id) => {
              setShowArchive(false);
              setSelectedRelicId(id);
            }}
          />
        )}

        {mantle.pendingSwapQueue[0] && (
          <SwapModal key="swap" pendingRelicPlacementId={mantle.pendingSwapQueue[0]} />
        )}
      </AnimatePresence>
    </div>
  );
}
