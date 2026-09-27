"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim } from "./use-scroll-anim";

/** Картинка растёт от скролла: рамка scale from->1, внутри лёгкий обратный зум */
export function GrowMedia({
  children,
  from = 0.7,
  className,
  innerClassName,
}: {
  children: ReactNode;
  from?: number;
  className?: string;
  innerClassName?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useScrollAnim(frame, { transform: [`scale(${from})`, "scale(1)"] }, { offset: ["start end", "start 0.2"] });
  useScrollAnim(
    inner,
    { transform: ["scale(1.28)", "scale(1)"] },
    { target: frame, offset: ["start end", "start 0.2"] },
  );
  return (
    <div ref={frame} data-motion className={cn("relative overflow-hidden will-change-transform", className)}>
      <div ref={inner} data-motion className={cn("absolute inset-0 will-change-transform", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
