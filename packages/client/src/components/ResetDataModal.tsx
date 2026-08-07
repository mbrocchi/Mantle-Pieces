import { useState } from "react";
import { motion } from "framer-motion";
import { resetAllData } from "../lib/apiClient";
import { useAuthStore } from "../state/authStore";

export function ResetDataModal({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setError(null);
    try {
      await resetAllData();
      useAuthStore.getState().logout();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
      setLoading(false);
    }
  }

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
        className="bg-navy-light rounded-2xl border-2 border-red-600 w-full max-w-sm p-5"
      >
        <p className="text-red-500 font-bold text-sm tracking-wide mb-2 text-center">RESET ALL APP DATA</p>
        <p className="text-gray-300 text-xs text-center mb-4">
          This permanently deletes every family's accounts, mantles, and progress &mdash; not just yours. This
          cannot be undone.
        </p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type RESET to confirm"
          className="w-full bg-black/30 rounded-xl px-4 py-3 mb-3 text-white placeholder:text-gray-500 outline-none border border-transparent focus:border-red-600"
        />

        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

        <button
          onClick={handleReset}
          disabled={confirmText !== "RESET" || loading}
          className="w-full bg-red-600/90 text-white font-bold rounded-xl px-4 py-3 transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100"
        >
          {loading ? "Resetting..." : "Reset All Data"}
        </button>
        <button onClick={onClose} className="w-full text-gray-400 text-xs underline mt-3">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
