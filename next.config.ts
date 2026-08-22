import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": ["./system_prompt.md"],
  },
};

export default nextConfig;
