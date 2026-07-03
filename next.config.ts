import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статические файлы (_next/static) грузим с vercel.app-домена,
  // который доступен в России. HTML-страницы остаются на www.ladogaboat.ru.
  assetPrefix: process.env.VERCEL_ENV === 'production'
    ? 'https://ladogaboat.vercel.app'
    : '',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Страницы авторизации не должны индексироваться
        source: '/auth/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
