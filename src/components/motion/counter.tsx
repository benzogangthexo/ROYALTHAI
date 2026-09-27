"use client";

import { animate, inView } from "motion";
import { useEffect, useRef } from "react";

import { motionAllowed } from "./use-scroll-anim";

/** Число: финальное значение уже в HTML; считает от 0 только если было ниже сгиба */
export function Counter({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) =>
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed() || el.getBoundingClientRect().top < window.innerHeight) return;
    const fmt = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    el.textContent = fmt.format(0);
    const stop = inView(
      el,
      () => {
        animate(0, value, {
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            el.textContent = fmt.format(v);
          },
        });
      },
      { amount: 0.6 },
    );
    return () => {
      stop();
      el.textContent = fmt.format(value);
    };
  }, [value, decimals]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(value)}
    </span>
  );
}
