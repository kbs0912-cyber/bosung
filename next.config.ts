import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/generate": ["./prompts/*.md"],
  },
  // Only enabled for the Electron (Windows app) build — a standalone bundle
  // lets electron/main.js spawn the server with `node server.js` without a
  // full node_modules install. Left off for normal web deployments (e.g.
  // Vercel manages its own output and doesn't need this).
  ...(process.env.ELECTRON_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
