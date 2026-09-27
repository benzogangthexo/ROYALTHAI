import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** "4890" -> "4 890" (неразрывный узкий пробел, как в русской типографике) */
export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

/** Ссылка tel: из человекочитаемого номера */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
