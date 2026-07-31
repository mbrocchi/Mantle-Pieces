import { useState } from "react";
import { motion } from "framer-motion";
import { findRelicType } from "shared";
import { useMantleStore } from "../state/mantleStore";
import { addTextNote } from "../lib/apiClient";
import { NoteRecorder } from "./NoteRecorder";
import { AudioNotePlayer } from "./AudioNotePlayer";

export function RelicDetailCard({
  relicPlacementId,
  onClose,
}: {
  relicPlacementId: string;
  onClose: () => void;
}) {
  const placement = useMantleStore((s) => s.collectedRelics[relicPlacementId]);
  const notes = useMantleStore((s) => s.relicNotes[relicPlacementId] ?? []);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (!placement) return null;
  const type = findRelicType(placement.relicTypeId);
  if (!type) return null;

  async function sendText() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addTextNote(relicPlacementId, text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="bg-mahogany w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl border-t-2 sm:border-2 border-gold max-h-[85vh] flex flex-col"
      >
        <div className="p-5 text-center border-b border-white/10">
          <img src={type.artAssetKey} alt={type.name} className="w-24 h-24 mx-auto mb-2 object-contain" />
          <p className="text-white font-bold">{type.name}</p>
          <p className="text-gray-400 text-xs mt-1">
            Discovered {new Date(placement.unlockedAt ?? Date.now()).toLocaleDateString()}
          </p>
          <p className="text-gray-300 text-xs mt-3">{type.loreText}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notes.length === 0 && <p className="text-gray-500 text-xs text-center">No family notes yet.</p>}
          {notes.map((note) => (
            <div key={note.id} className="bg-black/30 rounded-xl p-3">
              <p className="text-gold text-xs font-bold mb-1">{note.authorUsername}</p>
              {note.type === "text" ? (
                <p className="text-gray-200 text-sm">{note.textContent}</p>
              ) : (
                <AudioNotePlayer audioPath={note.audioPath!} />
              )}
              <p className="text-gray-500 text-[10px] mt-1">{new Date(note.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Leave a family note..."
              className="flex-1 bg-black/30 text-white rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={sendText}
              disabled={sending || !text.trim()}
              className="bg-gold text-navy font-bold rounded-xl px-4 disabled:opacity-40 transition-transform active:scale-95"
            >
              Send
            </button>
          </div>
          <NoteRecorder relicPlacementId={relicPlacementId} />
          <button onClick={onClose} className="text-gray-400 text-xs underline mt-1">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
