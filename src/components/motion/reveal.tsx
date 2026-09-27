"use client";

import { useRef, type ReactNode } from "react";

import { useRevealOnView } from "./use-scroll-anim";

/** Мягкое появление при входе в экран (только ниже сгиба; без JS всё видно) */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRevealOnView(
    ref,
    { opacity: [0], transform: [`translate3d(0, ${y}px, 0)`] },
    { opacity: [1], transform: ["translate3d(0, 0, 0)"] },
    { delay },
  );
  return (
    <div ref={ref} data-motion className={className}>
      {children}
    </div>
  );
}
