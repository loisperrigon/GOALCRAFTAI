import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true, // Active l'instrumentation pour initialiser MongoDB au démarrage
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build (pour Docker)
    ignoreDuringBuilds: true,
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
