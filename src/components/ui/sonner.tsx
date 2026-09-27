"use client";

import { Toaster as Sonner } from "sonner";

/** Тосты (sonner) в фирменных цветах */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      toastOptions={{
        style: {
          background: "var(--surface-2)",
          color: "var(--fg)",
          border: "1px solid var(--line-strong)",
          borderRadius: "var(--radius)",
        },
      }}
    />
  );
}
