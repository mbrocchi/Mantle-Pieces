export type TabId = "puzzle" | "site" | "mantle";

const TABS: { id: TabId; label: string }[] = [
  { id: "puzzle", label: "PUZZLE" },
  { id: "site", label: "SITE" },
  { id: "mantle", label: "MANTLE" },
];

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  const stroke = active ? "#d4af37" : "#7c8399";
  if (id === "puzzle") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke={stroke} strokeWidth="2" />
        <circle cx="8" cy="8" r="1.6" fill={stroke} />
        <circle cx="16" cy="8" r="1.6" fill={stroke} />
        <circle cx="8" cy="16" r="1.6" fill={stroke} />
        <circle cx="16" cy="16" r="1.6" fill={stroke} />
      </svg>
    );
  }
  if (id === "site") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M4 20L14 10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M13 6l5 5-2 2-5-5z" fill={stroke} />
        <path d="M17 3l4 4-1.5 1.5L15.5 4.5z" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20v-6a6 6 0 0112 0v6" stroke={stroke} strokeWidth="2" />
      <path d="M10 20v-4a2 2 0 014 0v4" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

export function BottomNav({
  active,
  onChange,
  onAccountClick,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  onAccountClick: () => void;
}) {
  return (
    <nav className="app-tabbar bg-navy border-t border-black/40 shadow-[0_-4px_16px_rgba(0,0,0,0.45)] flex items-stretch">
      <div className="flex-1 flex items-stretch justify-around">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-transform active:scale-90"
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-shadow ${
                isActive ? "shadow-[0_0_14px_2px_rgba(212,175,55,0.65)] bg-gold/10 ring-2 ring-gold" : ""
              }`}
            >
              <TabIcon id={tab.id} active={isActive} />
            </span>
            <span
              className={`text-[11px] font-bold tracking-wide ${
                isActive ? "text-gold" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
      </div>
      <button
        onClick={onAccountClick}
        aria-label="Account"
        className="w-12 flex items-center justify-center border-l border-black/40 transition-transform active:scale-90"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke="#7c8399" strokeWidth="2" />
          <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" stroke="#7c8399" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </nav>
  );
}
