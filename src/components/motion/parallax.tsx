"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim } from "./use-scroll-anim";

/**
 * Паттерн 1: слой параллакса. speed > 0: дальний план (отстаёт от скролла),
 * speed < 0: ближний план (обгоняет). Разумный диапазон -0.5..0.5.
 */
export function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shift = Math.round(speed * 24 * 100) / 100;
  useScrollAnim(
    ref,
    { transform: [`translate3d(0, ${-shift}vh, 0)`, `translate3d(0, ${shift}vh, 0)`] },
    { offset: ["start end", "end start"] },
  );
  return (
    <div ref={ref} data-motion className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
