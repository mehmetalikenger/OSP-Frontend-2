import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.200", "192.168.1.3"],
};

export default nextConfig;
