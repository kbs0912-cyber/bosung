import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/generate": ["./system_prompt.md"],
  },
};

export default nextConfig;
