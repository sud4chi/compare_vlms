import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/compare_vlms',
  assetPrefix: '/compare_vlms',
  trailingSlash: true,
};

export default nextConfig;
