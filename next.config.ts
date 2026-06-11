import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.12"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.10.12:8080/:path*'
      }
    ]
  }
};

export default nextConfig;
