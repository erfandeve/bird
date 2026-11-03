import type { NextConfig } from "next";

// بدون API_URL سایت در حالت نمایشی و با دادهٔ نمونهٔ داخلی ساخته می‌شود (مثلاً برای پیش‌نمایش روی Vercel)
const apiUrl = process.env.API_URL;

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_DEMO_MODE: apiUrl ? "" : "1" },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // مرورگر فقط با همین دامنه حرف می‌زند؛ کوکی نشست جنگو هم به این ترتیب first-party می‌ماند
  async rewrites() {
    if (!apiUrl) return [];
    return [
      { source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` },
      { source: "/media/:path*", destination: `${apiUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
