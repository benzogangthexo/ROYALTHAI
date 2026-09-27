import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { sleep } from "@/lib/utils";

const noStore = { "Cache-Control": "no-store" };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: noStore });
}

export function fail(status: number, code: string, message: string, fields?: Record<string, string[]>) {
  return NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status, headers: noStore });
}

/** 422 с ошибками по полям (zod) */
export function invalid(error: z.ZodError) {
  const flat = z.flattenError(error);
  const fields: Record<string, string[]> = {};
  for (const [key, list] of Object.entries(flat.fieldErrors)) {
    if (Array.isArray(list) && list.length) fields[key] = list.map(String);
  }
  const message = flat.formErrors[0] ?? "Проверьте поля формы";
  return fail(422, "validation_error", message, fields);
}

/** Имитация сети: задержка в диапазоне */
export async function latency(min = 280, max = 720) {
  await sleep(Math.round(min + Math.random() * (max - min)));
}

/**
 * Сбой по запросу: ?chaos=1 в адресе страницы пробрасывается в API клиентом.
 * Без chaos=1 роуты стабильны (Lighthouse и QA не ловят случайных 503).
 */
export function flaky(req: Request, rate = 0.5) {
  return new URL(req.url).searchParams.get("chaos") === "1" && Math.random() < rate;
}
