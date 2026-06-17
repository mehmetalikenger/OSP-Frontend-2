import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.12"],
  experimental: {
    // Total upload cap for proxied requests (must cover the 25MB unit-asset upload).
    proxyClientMaxBodySize: "25mb",
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*'
      }
    ]
  }
};

export default nextConfig;
