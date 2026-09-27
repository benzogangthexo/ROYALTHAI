"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HoverImageItem = {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  image?: StaticImageData;
  alt?: string;
  onSelect?: () => void;
  href?: string;
  cursorLabel?: string;
};

/**
 * Паттерн 4: превью фото плывёт за курсором с задержкой (spring + наклон от скорости).
 * На таче превью нет, в строке миниатюра. Строки: button (onSelect), a (href) или div.
 */
export function HoverImageList({
  items,
  className,
  rowClassName,
  previewClassName = "h-[15rem] w-[12rem] rounded-[var(--radius)]",
}: {
  items: HoverImageItem[];
  className?: string;
  rowClassName?: string;
  previewClassName?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 20, mass: 0.6 });
  const vx = useMotionValue(0);
  const rotate = useSpring(useTransform(vx, [-40, 40], [-9, 9], { clamp: true }), { stiffness: 120, damping: 18 });
  const last = useRef({ x: 0, t: 0 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX);
    y.set(e.clientY);
    const dt = Math.max(1, e.timeStamp - last.current.t);
    vx.set(((e.clientX - last.current.x) / dt) * 16);
    last.current = { x: e.clientX, t: e.timeStamp };
  };

  const current = items.find((it) => it.id === active);

  return (
    <div
      className={cn("relative", className)}
      onPointerMove={onMove}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        x.jump(e.clientX);
        y.jump(e.clientY);
        setArmed(true);
      }}
      onPointerLeave={() => setActive(null)}
    >
      <ul className="border-t border-line">
        {items.map((it) => {
          const inner = (
            <>
              {it.image ? (
                <Image
                  src={it.image}
                  alt=""
                  sizes="96px"
                  quality={70}
                  className="hover-thumb size-16 shrink-0 rounded-[calc(var(--radius)-4px)] object-cover sm:size-20"
                />
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-3">
                  {it.title}
                </span>
                {it.meta ? <span className="mt-1 block text-fg-muted">{it.meta}</span> : null}
              </span>
              {it.aside ? <span className="shrink-0 text-right">{it.aside}</span> : null}
            </>
          );
          const cls = cn(
            "group flex w-full min-h-16 items-center gap-4 py-4 text-left transition-colors duration-300 hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] sm:gap-6 sm:py-5",
            rowClassName,
          );
          const common = {
            className: cls,
            onPointerEnter: () => setActive(it.id),
            onFocus: () => setActive(it.id),
            "data-cursor": it.image ? "view" : undefined,
            "data-cursor-label": it.image ? (it.cursorLabel ?? "Смотреть") : undefined,
          };
          return (
            <li key={it.id} className="border-b border-line">
              {it.href ? (
                <a href={it.href} {...common}>
                  {inner}
                </a>
              ) : it.onSelect ? (
                <button type="button" onClick={it.onSelect} {...common}>
                  {inner}
                </button>
              ) : (
                <div {...common}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {armed ? (
        <motion.div
          aria-hidden="true"
          className="hover-preview pointer-events-none fixed left-0 top-0 z-40"
          style={{ x: sx, y: sy, rotate }}
        >
          <motion.div
            className={cn("relative -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[var(--shadow-lift)]", previewClassName)}
            initial={false}
            animate={{ opacity: current?.image ? 1 : 0, scale: current?.image ? 1 : 0.85 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {items.map((it) =>
              it.image ? (
                <Image
                  key={it.id}
                  src={it.image}
                  alt=""
                  fill
                  sizes="240px"
                  quality={70}
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    it.id === active ? "opacity-100" : "opacity-0",
                  )}
                />
              ) : null,
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
