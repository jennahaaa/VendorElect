"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto switch to Sepolia when connected to wrong network
  useEffect(() => {
    if (mounted && isConnected && chainId && chainId !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
    }
  }, [mounted, isConnected, chainId, switchChain]);

  // Always render the same structure on SSR
  if (!mounted) {
    return (
      <button
        disabled
        className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-cinzel font-medium text-sm tracking-wide shadow-lg border border-white/10 flex items-center gap-2 opacity-70"
      >
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    const isWrongNetwork = chainId !== sepolia.id;

    return (
      <div className="flex items-center gap-3">
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 font-medium text-sm transition-all"
          >
            Switch to Sepolia
          </button>
        )}
        <button
          onClick={() => open({ view: "Account" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white shadow-lg border border-white/10 font-cinzel text-sm tracking-wide hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-cinzel font-medium text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-white/10 flex items-center gap-2"
    >
      Connect Wallet
    </button>
  );
}
