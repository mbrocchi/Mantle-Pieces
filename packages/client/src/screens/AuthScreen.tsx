import { useState } from "react";
import { useAuthStore } from "../state/authStore";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { doLogin, doRegister, error, clearError } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await doLogin(username.trim(), password);
      } else {
        await doRegister(username.trim(), password);
      }
    } catch {
      // error is already reflected in the store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-screen bg-gradient-to-b from-navy/70 to-black/85 flex flex-col items-center justify-center px-8">
      <img
        src="/logo.png"
        alt="Mantle Pieces: Digs & Dots"
        className="w-full max-w-[160px] mb-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
      />

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoCapitalize="none"
          className="bg-navy-light text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-gold"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="bg-navy-light text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-gold"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !username.trim() || password.length < 6}
          className="bg-gold text-navy font-bold rounded-xl px-4 py-3 mt-2 disabled:opacity-40 transition-transform active:scale-95"
        >
          {submitting ? "..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </form>

      <button
        className="text-gray-400 text-sm mt-6 underline"
        onClick={() => {
          clearError();
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login" ? "New family? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  );
}
