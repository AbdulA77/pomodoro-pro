import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
