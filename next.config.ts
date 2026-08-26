import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
