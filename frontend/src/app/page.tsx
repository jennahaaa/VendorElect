"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to avoid WagmiProvider issues
const HomeContent = dynamic(
  () => import("@/components/HomeContent").then(mod => ({ default: mod.HomeContent })),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--primary)] font-cinzel">Loading VendorElect...</p>
        </div>
      </main>
    ),
  }
);

export default function Home() {
  return <HomeContent />;
}
