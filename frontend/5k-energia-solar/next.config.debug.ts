// Debug config to verify routes are being detected
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Ensure API routes are included in build
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // Don't optimize away the image-proxy route
  experimental: {
    optimizePackageImports: ["@vercel/og"],
  },
};

export default config;
