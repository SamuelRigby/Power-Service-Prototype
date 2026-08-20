import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal `.next/standalone` server bundle (only the production
  // dependencies actually used, traced automatically) - the runtime stage of
  // frontend/Dockerfile copies just that output rather than the full
  // node_modules, which is what keeps the final image small.
  output: "standalone",
};

export default nextConfig;
