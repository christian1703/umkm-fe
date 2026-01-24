import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators:false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/images/**",
      },
    ],
  }
};

export default nextConfig;
