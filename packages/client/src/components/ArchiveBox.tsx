import { motion } from "framer-motion";
import { findRelicType } from "shared";
import { useMantleStore } from "../state/mantleStore";

export function ArchiveBox({
  onClose,
  onSelectRelic,
}: {
  onClose: () => void;
  onSelectRelic: (relicPlacementId: string) => void;
}) {
  const archive = useMantleStore((s) => s.mantle.archive);
  const collectedRelics = useMantleStore((s) => s.collectedRelics);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="bg-mahogany rounded-2xl border-2 border-gold w-full max-w-sm max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-white/10 text-center">
          <p className="text-gold font-bold text-sm tracking-wide">ARCHIVE STORAGE BOX</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
          {archive.length === 0 && (
            <p className="text-gray-500 text-xs col-span-3 text-center">Nothing archived yet.</p>
          )}
          {archive.map((entry) => {
            const placement = collectedRelics[entry.relicPlacementId];
            const type = placement ? findRelicType(placement.relicTypeId) : undefined;
            return (
              <button
                key={entry.relicPlacementId}
                onClick={() => onSelectRelic(entry.relicPlacementId)}
                className="aspect-square bg-black/30 rounded-xl flex flex-col items-center justify-center transition-transform active:scale-95"
              >
                {type ? (
                  <img src={type.artAssetKey} alt={type.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-2xl">❔</span>
                )}
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="p-4 text-gray-400 text-xs underline border-t border-white/10">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
