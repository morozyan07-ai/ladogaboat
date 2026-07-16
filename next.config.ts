import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    // Только клиентский бандл: добавляем баннер-комментарий в каждый чанк.
    // Это меняет content-hash → новые имена файлов → CF загружает свежие копии
    // вместо corrupt-версий из assets store. Серверный бандл не трогаем.
    if (!isServer) {
      config.plugins.push(
        new webpack.BannerPlugin({ banner: "/* ladogaboat-v2 */", raw: true, entryOnly: false })
      );
    }
    return config;
  },
};

export default nextConfig;
