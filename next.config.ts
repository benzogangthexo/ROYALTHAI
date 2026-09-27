import type { NextConfig } from "next";

/*
 * Обычная сборка (pnpm build): сервер Next с API и оптимизацией картинок (Vercel, VPS).
 * PAGES_BASE=/REPO (pnpm build:pages): статика для GitHub Pages, API работает в браузере.
 * Ширины картинок общие для обоих режимов и для scripts/build-pages.mjs.
 */
const deviceSizes = [360, 414, 640, 768, 1024, 1280, 1536, 1920];
const imageSizes = [64, 96, 128, 256, 384];
const pagesBase = process.env.PAGES_BASE;

const nextConfig: NextConfig = pagesBase
  ? {
      output: "export",
      basePath: pagesBase,
      trailingSlash: true,
      poweredByHeader: false,
      env: { NEXT_PUBLIC_STATIC: "1" },
      images: {
        loader: "custom",
        loaderFile: "./src/lib/image-loader.ts",
        qualities: [70, 75, 85],
        deviceSizes,
        imageSizes,
      },
    }
  : {
      poweredByHeader: false,
      images: {
        formats: ["image/avif", "image/webp"],
        qualities: [70, 75, 85],
        deviceSizes,
        imageSizes,
      },
      async headers() {
        return [
          {
            source: "/:path*",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "X-Frame-Options", value: "SAMEORIGIN" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
          },
        ];
      },
    };

export default nextConfig;
