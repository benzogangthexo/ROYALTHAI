"use client";

import { useEffect, useRef } from "react";

/**
 * Паттерн 4 (часть): кастомный курсор с lerp-инерцией.
 * data-cursor="view|link|hide" и data-cursor-label="Смотреть" на любом элементе.
 * Только точный указатель с ховером; при reduced-motion выключен (нативный курсор).
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = root.current;
    const rg = ring.current;
    const dt = dot.current;
    const lb = label.current;
    if (!fine || reduce || !r || !rg || !dt || !lb) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    const tick = () => {
      rx += (x - rx) * 0.17;
      ry += (y - ry) * 0.17;
      rg.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      dt.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (r.dataset.hidden === "true") {
        rx = e.clientX;
        ry = e.clientY;
        r.dataset.hidden = "false";
      }
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.(
        "[data-cursor], a, button, [role='button'], [role='radio'], label, summary, input, textarea, select",
      );
      let state = "default";
      let text = "";
      if (t) {
        const c = t.getAttribute("data-cursor");
        if (c) {
          state = c;
          text = t.getAttribute("data-cursor-label") ?? "";
        } else if (t.matches("input, textarea, select")) state = "hide";
        else state = "link";
      }
      r.dataset.state = state;
      lb.textContent = text;
    };
    const onLeave = () => {
      r.dataset.hidden = "true";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true" data-hidden="true" data-state="default">
      <div ref={ring} className="cursor__ring">
        <div className="cursor__ring-inner">
          <span ref={label} className="cursor__label" />
        </div>
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}
