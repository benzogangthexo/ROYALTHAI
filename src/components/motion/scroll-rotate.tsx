"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim, type ScrollOffset } from "./use-scroll-anim";

/** Паттерн 3: вращение, привязанное к скроллу (не автоплей) */
export function ScrollRotate({
  children,
  from = -40,
  to = 140,
  scaleFrom = 1,
  scaleTo = 1,
  offset = ["start end", "end start"],
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  scaleFrom?: number;
  scaleTo?: number;
  offset?: ScrollOffset;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollAnim(
    ref,
    { transform: [`rotate(${from}deg) scale(${scaleFrom})`, `rotate(${to}deg) scale(${scaleTo})`] },
    { offset },
  );
  return (
    <div ref={ref} data-motion className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
