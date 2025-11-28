import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable CORS headers for SharedArrayBuffer (required by TFHE WASM)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  // Turbopack config (Next.js 16 default)
  turbopack: {},
  // Webpack fallback for Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

export default nextConfig;
