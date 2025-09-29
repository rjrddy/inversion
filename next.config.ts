import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Force correct project root to avoid multiple lockfile mis-detection
    root: __dirname,
  },
};

export default nextConfig;
