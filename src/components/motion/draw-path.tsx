"use client";

import { animate, scroll } from "motion";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { motionAllowed, type ScrollOffset } from "./use-scroll-anim";

/**
 * Тонкие линии-чертежи, которые дорисовываются от скролла.
 * Оберни SVG; линии, которые рисовать, помечай data-draw. Без JS линии просто видны.
 */
export function DrawOnScroll({
  children,
  offset = ["start 0.9", "end 0.35"],
  className,
}: {
  children: ReactNode;
  offset?: ScrollOffset;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(offset);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const range = JSON.parse(key) as ScrollOffset;
    const paths = Array.from(el.querySelectorAll<SVGGeometryElement>("[data-draw]"));
    const stops = paths.map((p, i) => {
      p.setAttribute("pathLength", "1");
      p.style.strokeDasharray = "1";
      const lag = Math.min(0.5, i * 0.08);
      const controls = animate(p, { strokeDashoffset: [1, 1, 0] }, { ease: "linear", duration: 1, times: [0, lag, 1] });
      return scroll(controls, { target: el, offset: range });
    });
    return () => stops.forEach((s) => s());
  }, [key]);
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
