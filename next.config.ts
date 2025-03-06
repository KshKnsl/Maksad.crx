import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  assetPrefix: "./",
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@public": path.resolve(__dirname, "public"),
    };
    return config;
  },
};

export default nextConfig;


