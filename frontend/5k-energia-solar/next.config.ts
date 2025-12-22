import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'f005.backblazeb2.com',
        pathname: '/file/5k-storage/**',
      },
    ],
  },
};

export default nextConfig;
