import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { Cursor } from "@/components/motion/cursor";
import { headScript } from "@/components/motion/preloader";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const display = localFont({
  src: [{ path: "../fonts/forum-400.woff2", weight: "400", style: "normal" }],
  variable: "--ff-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const body = localFont({
  src: [
    { path: "../fonts/commissioner-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/commissioner-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--ff-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Шаблон",
  description: "Шаблон сайта заведения",
};

export const viewport: Viewport = {
  themeColor: "#0e0e10",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[110] rounded-full bg-brand px-5 py-3 text-brand-ink"
        >
          К содержимому
        </a>
        <Providers>
          <SmoothScroll />
          <Cursor />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
