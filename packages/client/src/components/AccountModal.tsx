import { motion } from "framer-motion";
import { useAuthStore } from "../state/authStore";

export function AccountModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const site = useAuthStore((s) => s.site);
  const logout = useAuthStore((s) => s.logout);

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
        className="bg-navy-light rounded-2xl border-2 border-gold w-full max-w-sm p-5"
      >
        <p className="text-gold font-bold text-sm tracking-wide mb-4 text-center">ACCOUNT</p>

        <div className="bg-black/30 rounded-xl px-4 py-3 mb-3">
          <p className="text-[10px] text-gray-400 font-bold">USERNAME</p>
          <p className="text-white font-semibold">{user?.username ?? "..."}</p>
        </div>

        {site && (
          <div className="bg-black/30 rounded-xl px-4 py-3 mb-3">
            <p className="text-[10px] text-gray-400 font-bold">FAMILY INVITE CODE</p>
            <p className="text-gold font-semibold tracking-widest">{site.inviteCode}</p>
          </div>
        )}

        {site && site.members.length > 0 && (
          <div className="bg-black/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-[10px] text-gray-400 font-bold mb-1">FAMILY MEMBERS</p>
            {site.members.map((m) => (
              <p key={m.userId} className="text-gray-200 text-sm">
                {m.username}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full bg-red-600/90 text-white font-bold rounded-xl px-4 py-3 transition-transform active:scale-95"
        >
          Log Out
        </button>
        <button onClick={onClose} className="w-full text-gray-400 text-xs underline mt-3">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
