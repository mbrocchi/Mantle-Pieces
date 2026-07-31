import { motion } from "framer-motion";
import { gemGradient } from "../game/gemStyle";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/logo.png"
            alt="Mantle Pieces: Digs & Dots"
            className="w-full max-w-[260px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
          />
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center gap-2 my-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 14,
              height: 14,
              background: gemGradient("blue"),
              opacity: 1 - i * 0.13,
              boxShadow: "0 0 8px 1px rgba(59,130,246,0.6)",
            }}
          />
        ))}
      </div>

      <p className="text-gray-300 text-sm mb-8 text-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
        A family dig, one token bank, no scoreboards.
      </p>

      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-xl bg-gold blur-xl"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.18, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <button
          onClick={onStart}
          className="relative bg-gold text-navy font-bold rounded-xl px-10 py-4 text-lg tracking-wide shadow-[0_0_20px_4px_rgba(212,175,55,0.55)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_36px_10px_rgba(212,175,55,0.9)] active:scale-95"
        >
          START
        </button>
      </div>
    </div>
  );
}
