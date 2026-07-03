import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статические файлы (_next/static) грузим с vercel.app-домена,
  // который доступен в России. HTML-страницы остаются на www.ladogaboat.ru.
  assetPrefix: process.env.VERCEL_ENV === 'production'
    ? 'https://ladogaboat.vercel.app'
    : '',

  async headers() {
    return