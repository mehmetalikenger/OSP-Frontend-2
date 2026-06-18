import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.12"],
  experimental: {
    // Total upload cap for proxied requests (must cover the 25MB unit-asset upload).
    proxyClientMaxBodySize: "25mb",
  },
  async rewrites() {
    // Backend origin the /api proxy forwards to. Defaults to local dev;
    // set BACKEND_URL in production (e.g. the Railway backend URL).
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`
      }
    ]
  }
};

export default nextConfig;
