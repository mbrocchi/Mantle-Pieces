import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWalletStore } from "../state/walletStore";

/** Header balance readout that pops, glows, and shows a floating "+N" any time the
 *  shared wallet balance increases, so a token award reads as a clear reward moment
 *  no matter which screen (Puzzle/Dig/Mantle) the player is on when it happens. */
export function DigTokenBadge({
  wrapperClassName = "text-right",
  labelClassName = "text-[10px] text-gray-300 font-bold",
}: {
  wrapperClassName?: string;
  labelClassName?: string;
}) {
  const balance = useWalletStore((s) => s.balance);
  const prevRef = useRef(balance);
  const [awardId, setAwardId] = useState(0);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = balance;
    if (balance > prev) {
      setDelta(balance - prev);
      setAwardId((id) => id + 1);
    }
  }, [balance]);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div className={labelClassName}>DIG TOKENS</div>
      <div className="relative inline-block">
        <motion.div
          key={awardId}
          className="font-bold text-gold"
          animate={awardId > 0 ? { scale: [1, 1.6, 1] } : undefined}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {balance}
        </motion.div>
        <AnimatePresence>
          {awardId > 0 && (
            <motion.div
              key={`glow-${awardId}`}
              className="pointer-events-none absolute inset-0 rounded-full bg-gold"
              style={{ filter: "blur(10px)" }}
              initial={{ opacity: 0.8, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.6 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          )}
          {awardId > 0 && (
            <motion.div
              key={`float-${awardId}`}
              className="pointer-events-none absolute -top-1 right-0 text-xs font-bold text-gold-light whitespace-nowrap"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -24 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              +{delta}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
