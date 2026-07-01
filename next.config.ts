import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ladogaboat.ru" }],
        destination: "https://ladogaboat.ru/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
