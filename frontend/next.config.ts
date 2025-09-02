import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Nécessaire pour Docker
  eslint: {
    // Ignorer les erreurs ESLint pendant le build (pour Docker)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build (pour Docker production)
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Exclure MongoDB et ses dépendances du bundle client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
        child_process: false,
        mongodb: false,
      };
    }
    return config;
  },
};

export default nextConfig;
