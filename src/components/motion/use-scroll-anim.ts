"use client";

import { animate, inView, scroll } from "motion";
import { useEffect, type RefObject } from "react";

export type ScrollOffset = NonNullable<NonNullable<Parameters<typeof scroll>[1]>["offset"]>;
export type Keyframes = Record<string, string[] | number[]>;

export const motionAllowed = () =>
  typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Анимация, привязанная к скроллу (scroll + animate из motion: где можно, идёт через
 * нативный ScrollTimeline на композиторе). SSR и reduced-motion: элемент статичен.
 * keyframes/offset/times сериализуются в ключ, поэтому их можно передавать литералами.
 */
export function useScrollAnim(
  ref: RefObject<Element | null>,
  keyframes: Keyframes | null,
  options: { target?: RefObject<Element | null>; offset?: ScrollOffset; times?: number[] } = {},
) {
  const { target } = options;
  const key = JSON.stringify([keyframes, options.offset ?? null, options.times ?? null]);
  useEffect(() => {
    const el = ref.current;
    const [frames, offset, times] = JSON.parse(key) as [Keyframes | null, ScrollOffset | null, number[] | null];
    if (!el || !frames || !motionAllowed()) return;
    const controls = animate(el, frames, { ease: "linear", duration: 1, ...(times ? { times } : {}) });
    const stop = scroll(controls, { target: target?.current ?? el, ...(offset ? { offset } : {}) });
    return () => {
      stop();
      controls.stop();
    };
  }, [ref, target, key]);
}

/**
 * Появление при входе в экран, только если элемент изначально ниже сгиба.
 * Сервер и первый кадр: контент видим (без JS, для LCP и SEO).
 */
export function useRevealOnView(
  ref: RefObject<HTMLElement | null>,
  from: Keyframes,
  to: Keyframes,
  options: { delay?: number; duration?: number; amount?: number } = {},
) {
  const { delay = 0, duration = 1.1, amount = 0.25 } = options;
  const key = JSON.stringify([from, to]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    const [start, end] = JSON.parse(key) as [Keyframes, Keyframes];
    const initial = animate(el, start, { duration: 0 });
    const stop = inView(
      el,
      () => {
        animate(el, end, { duration, delay, ease: [0.16, 1, 0.3, 1] });
      },
      { amount },
    );
    return () => {
      initial.stop();
      stop();
    };
  }, [ref, key, delay, duration, amount]);
}
