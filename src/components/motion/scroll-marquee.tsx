"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim } from "./use-scroll-anim";

/** Бегущая строка, которую двигает только скролл (не автоплей). direction: 1 влево, -1 вправо */
export function ScrollMarquee({
  items,
  direction = 1,
  distance = 30,
  separator = "·",
  className,
  itemClassName,
}: {
  items: ReactNode[];
  direction?: 1 | -1;
  distance?: number;
  separator?: ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const a = direction === 1 ? 0 : -distance;
  const b = direction === 1 ? -distance : 0;
  useScrollAnim(
    track,
    { transform: [`translate3d(${a}%, 0, 0)`, `translate3d(${b}%, 0, 0)`] },
    { target: ref, offset: ["start end", "end start"] },
  );
  const row = (copy: number) =>
    items.map((it, i) => (
      <span key={`${copy}-${i}`} className={cn("flex shrink-0 items-center gap-[0.5em]", itemClassName)}>
        {it}
        <span aria-hidden="true" className="opacity-50">
          {separator}
        </span>
      </span>
    ));
  return (
    <div ref={ref} data-qa-ignore className={cn("overflow-hidden", className)}>
      <div ref={track} data-motion className="flex w-max gap-[0.5em] whitespace-nowrap will-change-transform">
        {row(0)}
        <span aria-hidden="true" className="contents">
          {row(1)}
          {row(2)}
        </span>
      </div>
    </div>
  );
}
