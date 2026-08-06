import { motion } from "framer-motion";

interface RoundCompleteModalProps {
  result: "win" | "loss";
  levelNumber: number;
  digsEarned: number;
  onContinue: () => void;
}

export function RoundCompleteModal({ result, levelNumber, digsEarned, onContinue }: RoundCompleteModalProps) {
  const isWin = result === "win";

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
        className={`bg-navy-light rounded-2xl border-2 w-full max-w-sm p-5 ${isWin ? "border-gold" : "border-gray-500"}`}
      >
        <p
          className={`font-bold text-lg tracking-wide mb-2 text-center ${isWin ? "text-gold" : "text-gray-300"}`}
        >
          {isWin ? "LEVEL COMPLETE" : "OUT OF MOVES"}
        </p>
        <p className={`text-xs text-center mb-4 ${isWin ? "text-gray-300" : "text-gray-400"}`}>
          {isWin ? `Level ${levelNumber} cleared.` : `Level ${levelNumber} · give it another go.`}
        </p>

        <div className="flex flex-col items-center justify-center mb-4">
          {digsEarned > 0 ? (
            <>
              <span className="text-gold font-bold text-2xl">+{digsEarned}</span>
              <span className="text-[10px] text-gray-400 font-bold">DIG TOKENS EARNED</span>
            </>
          ) : (
            <span className="text-gray-400 text-xs">No Dig Tokens earned this round.</span>
          )}
        </div>

        <button
          onClick={onContinue}
          className={`w-full font-bold rounded-xl px-4 py-3 transition-transform active:scale-95 ${
            isWin ? "bg-gold text-navy" : "bg-white/10 text-gold border border-gold"
          }`}
        >
          {isWin ? "Continue" : "Try Again"}
        </button>
      </motion.div>
    </motion.div>
  );
}
