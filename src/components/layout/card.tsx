import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Карточка: поверхность, тонкий бордер, мягкая тень */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}
