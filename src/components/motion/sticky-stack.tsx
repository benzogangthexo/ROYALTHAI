"use client";

import { Children, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim } from "./use-scroll-anim";

/**
 * Паттерн 5: наезжающие карточки (sticky-stack). Каждая карточка липнет с шагом `step`,
 * накрытые уменьшаются и темнеют. Карточка обязана влезать в 100svh минус top (проверь 320x568).
 */
export function StickyStack({
  children,
  top = "clamp(1rem, 6vh, 5rem)",
  step = 14,
  shrink = 0.05,
  className,
}: {
  children: ReactNode;
  top?: string;
  step?: number;
  shrink?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  return (
    <div ref={ref} className={cn("relative", className)}>
      {items.map((child, i) => (
        <StackItem
          key={i}
          index={i}
          count={items.length}
          container={ref}
          top={`calc(${top} + ${i * step}px)`}
          shrink={shrink}
        >
          {child}
        </StackItem>
      ))}
    </div>
  );
}

function StackItem({
  children,
  index,
  count,
  container,
  top,
  shrink,
}: {
  children: ReactNode;
  index: number;
  count: number;
  container: React.RefObject<HTMLDivElement | null>;
  top: string;
  shrink: number;
}) {
  const card = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const last = index === count - 1;
  const start = Math.min(0.98, (index + 1) / count);
  const scale = 1 - (count - 1 - index) * shrink;
  useScrollAnim(
    card,
    last ? null : { transform: ["scale(1)", "scale(1)", `scale(${scale})`] },
    { target: container, offset: ["start start", "end end"], times: [0, start, 1] },
  );
  useScrollAnim(
    shade,
    last ? null : { opacity: [0, 0, 0.55] },
    { target: container, offset: ["start start", "end end"], times: [0, start, 1] },
  );
  return (
    <div className="sticky pb-[var(--stack-gap,1.5rem)]" style={{ top }}>
      <div ref={card} data-motion className="relative origin-top will-change-transform">
        {children}
        <div
          ref={shade}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black opacity-0"
        />
      </div>
    </div>
  );
}
