"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let lenis: Lenis | null = null;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Плавный скролл к секции (Lenis, если включён) + фокус на цель для клавиатуры */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el =
    typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.3 });
  else el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/** Остановить/вернуть Lenis (модалки, меню) */
export function setScrollLocked(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = anchor?.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
    };
    document.addEventListener("click", onClick);
    if (reduced()) return () => document.removeEventListener("click", onClick);

    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true });
    lenis = instance;
    return () => {
      document.removeEventListener("click", onClick);
      instance.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
