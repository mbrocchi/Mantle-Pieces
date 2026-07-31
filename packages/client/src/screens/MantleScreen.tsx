import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { findRelicType, VAULT_SLOTS } from "shared";
import { useMantleStore } from "../state/mantleStore";
import { useWalletStore } from "../state/walletStore";
import { RelicDetailCard } from "../components/RelicDetailCard";
import { ArchiveBox } from "../components/ArchiveBox";
import { SwapModal } from "../components/SwapModal";

export function MantleScreen() {
  const mantle = useMantleStore((s) => s.mantle);
  const collectedRelics = useMantleStore((s) => s.collectedRelics);
  const balance = useWalletStore((s) => s.balance);
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
        <div className="text-right">
          <div className="text-[10px] text-gray-300 font-bold">DIG TOKENS</div>
          <div className="font-bold text-gold">{balance}</div>
        </div>
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

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="bg-mahogany rounded-2xl border-4 border-mahogany-light p-3 grid grid-cols-2 gap-3 shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
          {mantle.slots.map((relicPlacementId, i) => {
            const placement = relicPlacementId ? collectedRelics[relicPlacementId] : null;
            const type = placement ? findRelicType(placement.relicTypeId) : undefined;
            return (
              <button
                key={i}
                disabled={!relicPlacementId}
                onClick={() => relicPlacementId && setSelectedRelicId(relicPlacementId)}
                className="aspect-square rounded-xl bg-black/30 flex flex-col items-center justify-center gap-1 shadow-inner transition-transform active:scale-95"
              >
                {type ? (
                  <>
                    <span className="text-3xl">{type.artAssetKey}</span>
                    <span className="text-[10px] text-gray-200 font-semibold text-center px-1">{type.name}</span>
                  </>
                ) : (
                  <span className="text-gray-600 text-xs">Empty</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowArchive(true)}
          className="w-full mt-4 bg-black/40 text-gray-200 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg shadow-black/40 transition-transform active:scale-95"
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
