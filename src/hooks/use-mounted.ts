"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false на сервере и при гидрации, true после: безопасный переключатель на анимированную версию */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
