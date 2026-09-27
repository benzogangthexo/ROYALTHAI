"use client";

import { useSyncExternalStore } from "react";

/** matchMedia без расхождения гидрации: на сервере fallback */
export function useMedia(query: string, fallback = false) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** Анимации разрешены: движение не отключено и JS уже работает */
export function useMotionOK() {
  return !useMedia("(prefers-reduced-motion: reduce)", true);
}

/** Точный указатель с ховером (десктоп): для курсора и магнитных эффектов */
export function useFinePointer() {
  return useMedia("(hover: hover) and (pointer: fine)", false);
}
