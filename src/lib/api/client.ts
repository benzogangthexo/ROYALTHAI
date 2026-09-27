import type { z } from "zod";

import { ApiErrorSchema } from "@/lib/api/schemas";
import { sleep } from "@/lib/utils";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type Options<S extends z.ZodType> = {
  schema: S;
  method?: "GET" | "POST";
  body?: unknown;
  /** повторы для сети, 5xx и 429 (4xx не повторяем) */
  retries?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
};

function withChaos(url: string) {
  if (typeof window === "undefined" || !window.location.search.includes("chaos=1")) return url;
  return url + (url.includes("?") ? "&" : "?") + "chaos=1";
}

const backoff = (attempt: number) => 350 * 2 ** (attempt - 1) + Math.round(Math.random() * 150);

export async function apiFetch<S extends z.ZodType>(url: string, options: Options<S>): Promise<z.infer<S>> {
  const { schema, method = "GET", body, retries = 2, signal, timeoutMs = 12000 } = options;
  let attempt = 0;

  for (;;) {
    const controller = new AbortController();
    const forward = () => controller.abort();
    signal?.addEventListener("abort", forward, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let retry = false;
    try {
      const init: RequestInit = {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      };
      /* статическая сборка (GitHub Pages): те же обработчики API выполняются в браузере */
      const res =
        process.env.NEXT_PUBLIC_STATIC === "1"
          ? await (await import("@/lib/api/local")).localFetch(withChaos(url), init)
          : await fetch(withChaos(url), init);
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const parsed = ApiErrorSchema.safeParse(json);
        const error = parsed.success
          ? new ApiError(res.status, parsed.data.error.code, parsed.data.error.message, parsed.data.error.fields)
          : new ApiError(res.status, "http_error", "Сервер недоступен, попробуйте ещё раз");
        if ((res.status >= 500 || res.status === 429) && attempt < retries) {
          retry = true;
        } else {
          throw error;
        }
      } else {
        const parsed = schema.safeParse(json);
        if (!parsed.success) throw new ApiError(502, "bad_payload", "Сервер ответил неожиданно");
        return parsed.data;
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof ApiError) throw error;
      if (attempt >= retries) throw new ApiError(0, "network", "Нет связи. Проверьте интернет и повторите");
      retry = true;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forward);
    }
    if (retry) {
      attempt += 1;
      await sleep(backoff(attempt));
    }
  }
}
