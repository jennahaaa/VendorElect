"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { config, projectId } from "@/lib/wagmi";
import { useState, type ReactNode } from "react";
import { sepolia } from "wagmi/chains";

// Initialize Web3Modal only on client
let initialized = false;
if (typeof window !== "undefined" && !initialized) {
  initialized = true;
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    defaultChain: sepolia,
    themeMode: "light",
    themeVariables: {
      "--w3m-accent": "#BFA15F",
      "--w3m-border-radius-master": "12px",
    },
    enableAnalytics: false,
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
