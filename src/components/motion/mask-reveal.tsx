"use client";

import { useEffect, useRef, type ElementType } from "react";
import { animate, inView } from "motion";

import { cn } from "@/lib/utils";

import { motionAllowed } from "./use-scroll-anim";

/**
 * Заголовок строками из-под маски. immediate: чистый CSS при загрузке (hero, быстрый LCP).
 * Иначе: при входе в экран (только если ниже сгиба). Строки задаёшь сам, чтобы не было висячих слов.
 */
export function MaskReveal({
  lines,
  as: Tag = "h2",
  immediate = false,
  className,
  lineClassName,
}: {
  lines: React.ReactNode[];
  as?: ElementType;
  immediate?: boolean;
  className?: string;
  lineClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (immediate || !el || !motionAllowed()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".mask-line > span"));
    spans.forEach((s) => (s.style.transform = "translate3d(0, 105%, 0)"));
    const stop = inView(
      el,
      () => {
        spans.forEach((s, i) =>
          animate(s, { transform: "translate3d(0, 0, 0)" }, { duration: 1.1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }),
        );
      },
      { amount: 0.3 },
    );
    return () => stop();
  }, [immediate]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn("mask-line", immediate && "mask-immediate", lineClassName)}
          style={{ "--i": i } as React.CSSProperties}
        >
          <span data-motion>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
