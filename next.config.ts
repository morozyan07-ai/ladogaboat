import type { NextConfig } from "next";

const securityHeaders = [
  // Защита от clickjacking — запрещаем встраивать сайт в iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Запрещаем браузеру «угадывать» Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Управление Referrer при переходах
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Отключаем ненужные браузерные API
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // HSTS — только HTTPS (Vercel тоже добавляет, но лишним не будет)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content-Security-Policy
  // unsafe-inline / unsafe-eval нужны для Next.js App Router (inline hydration scripts)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.yookassa.ru https://api.resend.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Применяем к страницам, но НЕ к статическим файлам Next.js
        source: "/((?!_next/static|_next/image|favicon\\.ico).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
