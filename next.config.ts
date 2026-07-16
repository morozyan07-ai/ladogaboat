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
      // hashSalt форсирует новые contenthash для клиентских чанков,
      // минуя deduplication в CF assets store для старых corrupt файлов.
      // isServer=false → только клиентский бандл; Edge Runtime не затрагивается.
      config.output.hashSalt = "ladoga-v4";
    }
    return config;
  },
};

export default nextConfig;
