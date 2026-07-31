import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BottomNav, type TabId } from "./components/BottomNav";
import { PuzzleScreen } from "./screens/PuzzleScreen";
import { DigScreen } from "./screens/DigScreen";
import { MantleScreen } from "./screens/MantleScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { TitleScreen } from "./screens/TitleScreen";
import { AccountModal } from "./components/AccountModal";
import { useAuthStore } from "./state/authStore";
import { useWalletStore } from "./state/walletStore";
import { wsClient } from "./lib/wsClient";
import { getStoredToken } from "./lib/apiClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("puzzle");
  const [showAccount, setShowAccount] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const { status, site, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status === "signed_out") setShowTitle(true);
  }, [status]);

  useEffect(() => {
    if (!site) return;
    useWalletStore.getState().setBalance(site.wallet.balance);
    const token = getStoredToken();
    if (token) wsClient.connect(token);
    return () => wsClient.disconnect();
  }, [site?.id]);

  if (status === "loading") {
    return (
      <div className="app-frame flex items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (status === "signed_out") {
    return (
      <div className="app-frame">
        {showTitle ? <TitleScreen onStart={() => setShowTitle(false)} /> : <AuthScreen />}
      </div>
    );
  }

  if (!site) {
    return (
      <div className="app-frame">
        <LobbyScreen />
      </div>
    );
  }

  return (
    <div className="app-frame">
      <div className={activeTab === "puzzle" ? "" : "hidden"}>
        <PuzzleScreen />
      </div>
      <div className={activeTab === "site" ? "" : "hidden"}>
        <DigScreen active={activeTab === "site"} />
      </div>
      <div className={activeTab === "mantle" ? "" : "hidden"}>
        <MantleScreen />
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} onAccountClick={() => setShowAccount(true)} />
      <AnimatePresence>{showAccount && <AccountModal onClose={() => setShowAccount(false)} />}</AnimatePresence>
    </div>
  );
}
