import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal `.next/standalone` server bundle (only the production
  // dependencies actually used, traced automatically) - the runtime stage of
  // frontend/Dockerfile copies just that output rather than the full
  // node_modules, which is what keeps the final image small. Only turned on
  // for that Docker build path (the Dockerfile sets BUILD_TARGET=docker
  // before `npm run build`) - Vercel's own build pipeline produces its own
  // optimized output and doesn't want `output: "standalone"` set, so it has
  // to stay unset for every other build (Vercel, plain `next build` locally).
  ...(process.env.BUILD_TARGET === "docker" && { output: "standalone" as const }),
};

export default nextConfig;
