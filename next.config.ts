import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    hideLogsAfterAbort: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
