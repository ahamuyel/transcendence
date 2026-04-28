import type { NextConfig } from "next";

const nextConfig = {
  output: 'standalone',
  typescript: {
    // !! AVISO: Apenas use isso se o build falhar por erros de tipo !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! AVISO: Ignora erros de lint no build !!
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;