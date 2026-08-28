import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ['@prisma/client'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
