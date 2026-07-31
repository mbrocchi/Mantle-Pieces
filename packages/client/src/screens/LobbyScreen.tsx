import { useState } from "react";
import { useAuthStore } from "../state/authStore";

export function LobbyScreen() {
  const [mode, setMode] = useState<"choose" | "join">("choose");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, site, error, doCreateSite, doJoinSite, clearError, logout } = useAuthStore();

  if (site) {
    return (
      <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex flex-col items-center justify-center px-8 text-center">
        <img
          src="/logo.png"
          alt="Mantle Pieces: Digs & Dots"
          className="w-full max-w-[140px] mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
        />
        <p className="text-gray-300 text-sm mb-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">Family site ready</p>
        <p className="text-gray-200 text-sm mb-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
          Share this invite code with your family:
        </p>
        <div className="bg-navy-light border-2 border-gold rounded-xl px-6 py-3 my-4 shadow-lg shadow-black/50">
          <span className="text-2xl font-bold text-gold tracking-widest">{site.inviteCode}</span>
        </div>
        <p className="text-gray-400 text-xs drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
          Everyone who enters this code shares your dig site, token bank, and mantlepiece.
        </p>
      </div>
    );
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      await doCreateSite();
    } catch {
      // error reflected in store
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doJoinSite(code.trim());
    } catch {
      // error reflected in store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex flex-col items-center justify-center px-8">
      <img
        src="/logo.png"
        alt="Mantle Pieces: Digs & Dots"
        className="w-full max-w-[140px] mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
      />
      <p className="text-gray-300 text-sm mb-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">Welcome, {user?.username}</p>
      <h2 className="text-xl font-bold text-white mb-8 text-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
        Start a new dig, or join your family's
      </h2>

      {mode === "choose" && (
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-gold text-navy font-bold rounded-xl px-4 py-3 disabled:opacity-40 transition-transform active:scale-95"
          >
            {submitting ? "..." : "Create a Family Site"}
          </button>
          <button
            onClick={() => {
              clearError();
              setMode("join");
            }}
            className="bg-navy-light text-white font-bold rounded-xl px-4 py-3 border border-white/10"
          >
            Join with Invite Code
          </button>
        </div>
      )}

      {mode === "join" && (
        <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MANTLE-XXXXXX"
            autoCapitalize="characters"
            className="bg-navy-light text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-gold tracking-widest text-center"
          />
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="bg-gold text-navy font-bold rounded-xl px-4 py-3 disabled:opacity-40 transition-transform active:scale-95"
          >
            {submitting ? "..." : "Join Site"}
          </button>
          <button
            type="button"
            className="text-gray-400 text-sm underline mt-1"
            onClick={() => {
              clearError();
              setMode("choose");
            }}
          >
            Back
          </button>
        </form>
      )}

      {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

      <button className="text-gray-500 text-xs mt-10 underline" onClick={logout}>
        Log out
      </button>
    </div>
  );
}
