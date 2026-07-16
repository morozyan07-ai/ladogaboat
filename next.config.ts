import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    // Принудительно меняем hashSalt — все чанки получают новые имена.
    // Нужно чтобы CF Worker Assets Store загрузил свежие файлы вместо corrupt-версий.
    config.output.hashSalt = "v2";
    return config;
  },
};

export default nextConfig;
