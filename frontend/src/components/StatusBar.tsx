"use client";

import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { fheClient } from "@/lib/fheClient";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";
import { useEffect, useState } from "react";

// GitHub repo URL - will be updated later
const GITHUB_URL = "https://github.com";

export function StatusBar() {
  const [mounted, setMounted] = useState(false);
  const [fheStatus, setFheStatus] = useState<"checking" | "ready" | "error">("checking");
  const [retryCount, setRetryCount] = useState(0);

  // Mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check FHE SDK status
  useEffect(() => {
    if (!mounted) return;
    
    let isCurrent = true;

    const checkFheStatus = async () => {
      try {
        await fheClient.init({ chainId: sepolia.id });
        if (isCurrent) {
          setFheStatus("ready");
        }
      } catch (error: any) {
        console.warn("FHE SDK init attempt:", error?.message || error);
        if (isCurrent) {
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((c) => c + 1);
            }, 2000);
          } else {
            setFheStatus("error");
          }
        }
      }
    };

    checkFheStatus();

    return () => {
      isCurrent = false;
    };
  }, [mounted, retryCount]);

  // Contract address shortened
  const contractShort = `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`;
  const etherscanUrl = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
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
    );
  }

  return <StatusBarInner fheStatus={fheStatus} contractShort={contractShort} etherscanUrl={etherscanUrl} />;
}

// Inner component that uses wagmi hooks - only rendered when mounted
function StatusBarInner({ 
  fheStatus, 
  contractShort, 
  etherscanUrl 
}: { 
  fheStatus: "checking" | "ready" | "error";
  contractShort: string;
  etherscanUrl: string;
}) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === sepolia.id;

  return (
    <div className="flex items-center gap-3 text-xs font-lora">
      {/* FHE Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/40">
        <span
          className={`w-2 h-2 rounded-full shadow-sm ${
            fheStatus === "checking"
              ? "bg-amber-400 animate-pulse"
              : fheStatus === "ready"
              ? "bg-emerald-500"
              : "bg-red-500"
          }`}
        />
        <span className="text-[var(--primary)] font-medium tracking-wide">
          FHEVM
        </span>
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/40">
        <span
          className={`w-2 h-2 rounded-full shadow-sm ${
            !isConnected
              ? "bg-gray-400"
              : isCorrectNetwork
              ? "bg-emerald-500"
              : "bg-amber-400 animate-pulse"
          }`}
        />
        <span className="text-[var(--primary)] font-medium tracking-wide">
          {!isConnected
            ? "Offline"
            : isCorrectNetwork
            ? "Sepolia"
            : "Wrong"}
        </span>
      </div>

      {/* Contract Address */}
      <a
        href={etherscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"
        title="View contract on Etherscan"
      >
        <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <span className="text-[var(--primary)] font-medium font-mono tracking-wide">
          {contractShort}
        </span>
      </a>

      {/* GitHub Link */}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-8 h-8 rounded-full glass-panel bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"
        title="View source on GitHub"
      >
        <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
  );
}
