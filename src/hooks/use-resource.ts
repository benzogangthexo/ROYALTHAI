"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ResourceStatus = "idle" | "loading" | "success" | "empty" | "error";

type Entry<T> = { key: string | null; status: ResourceStatus; data: T | undefined; error: Error | null };

type Options<T> = {
  /** данные, отрендеренные на сервере для этого ключа: без запроса и без скелетона */
  initial?: { key: string; data: T };
  isEmpty?: (data: T) => boolean;
};

const defaultEmpty = (data: unknown) => Array.isArray(data) && data.length === 0;

/**
 * Загрузка по ключу: idle / loading / success / empty / error + retry + оптимистичный mutate.
 * key = null: ничего не грузим (idle). Смена ключа отменяет прошлый запрос.
 */
export function useResource<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: Options<T> = {},
) {
  const { initial, isEmpty = defaultEmpty } = options;
  const fetcherRef = useRef(fetcher);
  const emptyRef = useRef(isEmpty);
  useEffect(() => {
    fetcherRef.current = fetcher;
    emptyRef.current = isEmpty;
  });

  const [entry, setEntry] = useState<Entry<T>>(() =>
    initial && initial.key === key
      ? { key, status: isEmpty(initial.data) ? "empty" : "success", data: initial.data, error: null }
      : { key: null, status: "idle", data: undefined, error: null },
  );
  const [nonce, setNonce] = useState(0);
  const settled = useRef<{ key: string | null; nonce: number }>({ key: entry.key, nonce: 0 });

  useEffect(() => {
    if (key === null) return;
    if (settled.current.key === key && settled.current.nonce === nonce) return;
    const controller = new AbortController();
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        settled.current = { key, nonce };
        setEntry({ key, status: emptyRef.current(data) ? "empty" : "success", data, error: null });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        settled.current = { key, nonce };
        setEntry((prev) => ({
          key,
          status: "error",
          data: prev.data,
          error: error instanceof Error ? error : new Error("Ошибка загрузки"),
        }));
      },
    );
    return () => controller.abort();
  }, [key, nonce]);

  const retry = useCallback(() => {
    setEntry((prev) => ({ ...prev, key: null }));
    setNonce((n) => n + 1);
  }, []);

  /** Оптимистичное изменение данных: возвращает функцию отката */
  const mutate = useCallback((update: (data: T | undefined) => T) => {
    let snapshot: T | undefined;
    setEntry((prev) => {
      snapshot = prev.data;
      return { ...prev, data: update(prev.data) };
    });
    return () => setEntry((prev) => ({ ...prev, data: snapshot }));
  }, []);

  const status: ResourceStatus = key === null ? "idle" : entry.key === key ? entry.status : "loading";
  return { status, data: entry.data, error: status === "error" ? entry.error : null, retry, mutate };
}
