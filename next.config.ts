import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output только для Docker-сборки (Yandex Cloud).
  // Cloudflare Workers сборка (opennextjs-cloudflare) использует
  // стандартный .next output и не должна затрагиваться.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" as const } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // hashSalt форсирует новые contenthash для клиентских чанков,
      // минуя deduplication в CF assets store для старых corrupt файлов.
      // isServer=false → только клиентский бандл; Edge Runtime не затрагивается.
      config.output.hashSalt = "ladoga-v4";
    }
    return config;
  },
};

export default nextConfig;
