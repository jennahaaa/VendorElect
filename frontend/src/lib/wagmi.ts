import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

// Web3Modal Project ID
export const projectId = "42a5c65f3530bd77a4076f1296beb2bb";

// Metadata for Web3Modal
export const metadata = {
  name: "VendorElect",
  description: "FHE-powered Vendor Potential Rating System",
  url: typeof window !== "undefined" ? window.location.origin : "https://vendor-elect.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/xeMfJRSGpIGq5WiFz-bEiHoG6DGrZnAr"
    ),
  },
});

export const CONTRACT_ADDRESS = "0x635594B5C1cD97273139D0A4e03822EBDE122CE4" as const;
