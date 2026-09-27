"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Магнитное притяжение к курсору (spring). Внешний span не двигается и служит для замера,
 * внутренний смещается. Только точный указатель и без reduced-motion.
 */
export function Magnetic({
  children,
  strength = 0.32,
  reach = 1.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  /** зона захвата: множитель от большей стороны элемента */
  reach?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 210, damping: 17, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 210, damping: 17, mass: 0.5 });

  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !fine || reduce) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height / 2);
      const zone = Math.max(r.width, r.height) * reach;
      const inside = Math.hypot(dx, dy) < zone;
      x.set(inside ? dx * strength : 0);
      y.set(inside ? dy * strength : 0);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reach, strength, x, y]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      <motion.span className="inline-block will-change-transform" style={{ x: sx, y: sy }}>
        {children}
      </motion.span>
    </span>
  );
}
