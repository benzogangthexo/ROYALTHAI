"use client";

import { scroll } from "motion";
import { useEffect, useRef, type ElementType } from "react";

import { cn } from "@/lib/utils";

import { motionAllowed } from "./use-scroll-anim";

/**
 * Паттерн 2: проявление текста от скролла, по словам (stagger) с opacity + blur.
 * Не ставить в первый экран. Без JS и при reduced-motion текст просто виден.
 */
export function WordReveal({
  text,
  as: Tag = "p",
  className,
  accent = [],
  accentClassName = "text-brand",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** индексы слов, которые подсветить акцентом */
  accent?: number[];
  accentClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const n = spans.length;
    const apply = (p: number) => {
      const head = p * (n + 4);
      for (let i = 0; i < n; i += 1) {
        const v = Math.min(1, Math.max(0, (head - i) / 4));
        const s = spans[i].style;
        s.opacity = String(v);
        s.filter = v >= 1 ? "none" : `blur(${((1 - v) * 7).toFixed(2)}px)`;
      }
    };
    apply(0);
    return scroll(apply, { target: el, offset: ["start 0.85", "end 0.45"] });
  }, [text]);

  return (
    <div ref={ref}>
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i}>
            <span data-word data-motion className={cn("inline-block", accent.includes(i) && accentClassName)}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </Tag>
    </div>
  );
}
