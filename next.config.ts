import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid stale filesystem cache issues that can happen in Windows/OneDrive dev setups.
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
