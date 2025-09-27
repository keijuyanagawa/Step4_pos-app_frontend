import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Azure App Service用の設定
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // ポート設定
  env: {
    PORT: process.env.PORT || '8080',
  },
};

export default nextConfig;
