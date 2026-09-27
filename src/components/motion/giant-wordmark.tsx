"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { useScrollAnim } from "./use-scroll-anim";

/**
 * Огромное название в футере точно во всю ширину: стартовый кегль из ratio (cqi),
 * после загрузки JS подгоняет кегль по реальной ширине (ResizeObserver). Буквы выезжают от скролла.
 */
export function GiantWordmark({
  text,
  ratio = 0.7,
  className,
  letterClassName,
}: {
  text: string;
  ratio?: number;
  className?: string;
  letterClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const letters = Array.from(text);

  useEffect(() => {
    const box = ref.current;
    const line = row.current;
    if (!box || !line) return;
    const fit = () => {
      line.style.fontSize = "";
      const width = line.getBoundingClientRect().width;
      const target = box.clientWidth;
      if (width > 0) line.style.fontSize = `${(parseFloat(getComputedStyle(line).fontSize) * target) / width}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={ref}
      data-qa-ignore
      className={cn("w-full overflow-hidden [container-type:inline-size]", className)}
      aria-hidden="true"
    >
      <div
        ref={row}
        className="inline-flex whitespace-nowrap leading-[0.82]"
        style={{ fontSize: `calc(100cqi / ${(letters.length * ratio).toFixed(3)})` }}
      >
        {letters.map((ch, i) => (
          <Letter key={i} index={i} count={letters.length} target={ref} className={letterClassName}>
            {ch === " " ? " " : ch}
          </Letter>
        ))}
      </div>
    </div>
  );
}

function Letter({
  children,
  index,
  count,
  target,
  className,
}: {
  children: string;
  index: number;
  count: number;
  target: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const lag = (index / Math.max(1, count - 1)) * 0.35;
  useScrollAnim(
    ref,
    { transform: ["translate3d(0, 70%, 0)", "translate3d(0, 70%, 0)", "translate3d(0, 0, 0)", "translate3d(0, 0, 0)"] },
    { target, offset: ["start end", "end end"], times: [0, lag, Math.min(0.99, lag + 0.6), 1] },
  );
  return (
    <span ref={ref} data-motion className={cn("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}
