import { motion } from "framer-motion";
import { findRelicType } from "shared";
import { useMantleStore } from "../state/mantleStore";
import { wsClient } from "../lib/wsClient";

export function SwapModal({ pendingRelicPlacementId }: { pendingRelicPlacementId: string }) {
  const mantle = useMantleStore((s) => s.mantle);
  const collectedRelics = useMantleStore((s) => s.collectedRelics);
  const pendingPlacement = collectedRelics[pendingRelicPlacementId];
  const pendingType = pendingPlacement ? findRelicType(pendingPlacement.relicTypeId) : undefined;

  function chooseSlot(slotIndex: number) {
    wsClient.send({ type: "mantle:swap_relic", slotIndex, incomingRelicPlacementId: pendingRelicPlacementId });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        className="bg-mahogany rounded-2xl border-2 border-gold w-full max-w-sm p-5 text-center"
      >
        <p className="text-gold font-bold text-sm tracking-wide mb-1">MANTLEPIECE FULL</p>
        <p className="text-gray-300 text-xs mb-4">Select a relic to move to the Archive and make room for:</p>
        {pendingType && (
          <img src={pendingType.artAssetKey} alt={pendingType.name} className="w-16 h-16 mx-auto mb-1 object-contain" />
        )}
        <p className="text-white font-bold mb-4">{pendingType?.name}</p>
        <div className="grid grid-cols-5 gap-2">
          {mantle.slots.map((relicPlacementId, i) => {
            const placement = relicPlacementId ? collectedRelics[relicPlacementId] : null;
            const type = placement ? findRelicType(placement.relicTypeId) : undefined;
            return (
              <button
                key={i}
                onClick={() => chooseSlot(i)}
                className="aspect-square bg-black/30 rounded-lg flex items-center justify-center transition-transform active:scale-90"
              >
                {type && <img src={type.artAssetKey} alt={type.name} className="w-8 h-8 object-contain" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
