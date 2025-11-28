"use client";

import { useState, useEffect } from "react";

// Lazy load components only after mount
export function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [StatusBar, setStatusBar] = useState<React.ComponentType | null>(null);
  const [ConnectButton, setConnectButton] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically import components after mount
    Promise.all([
      import("./StatusBar").then(mod => setStatusBar(() => mod.StatusBar)),
      import("./ConnectButton").then(mod => setConnectButton(() => mod.ConnectButton)),
    ]);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--glass-border)] shadow-sm transition-all duration-300">
      <button 
        onClick={scrollToTop}
        className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 border border-white/10">
          <span className="text-[var(--accent)] font-cinzel font-bold text-lg">V</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-cinzel font-bold text-[var(--primary)] tracking-wide leading-none">
            VENDOR<span className="text-[var(--accent)]">ELECT</span>
          </span>
        </div>
      </button>
      <div className="flex items-center gap-6">
        {/* Status Bar */}
        {mounted && StatusBar ? (
          <StatusBar />
        ) : (
          <div className="flex items-center gap-3 text-xs font-lora">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/40">
              <span className="w-2 h-2 rounded-full shadow-sm bg-amber-400 animate-pulse" />
              <span className="text-[var(--primary)] font-medium tracking-wide">FHEVM</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/40">
              <span className="w-2 h-2 rounded-full shadow-sm bg-gray-400" />
              <span className="text-[var(--primary)] font-medium tracking-wide">Offline</span>
            </div>
          </div>
        )}
        <div className="h-6 w-px bg-[var(--primary)]/10" />
        {/* Connect Button */}
        {mounted && ConnectButton ? (
          <ConnectButton />
        ) : (
          <button
            disabled
            className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-cinzel font-medium text-sm tracking-wide shadow-lg border border-white/10 flex items-center gap-2 opacity-70"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
