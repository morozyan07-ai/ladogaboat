import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // hashSalt меняет contenthash ВСЕХ клиентских чанков.
      // isServer=false → ТОЛЬКО клиентский бандл.
      // Edge Runtime (middleware) имеет isServer=true → не затрагивается.
      // Это форсирует свежую загрузку всех чанков в CF assets store,
      // минуя deduplication-кэш wrangler для старых corrupt файлов.
      config.output.hashSalt = "ladoga-v3";
    }
    return config;
  },
};

export default nextConfig;
