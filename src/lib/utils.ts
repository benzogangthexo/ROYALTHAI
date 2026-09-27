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

/** Типографика: неразрывный пробел после коротких слов и между числом и словом (без висячих предлогов) */
export function nb(text: string) {
  return text
    .replace(/(?<=^|[\s«( ])([а-яёА-ЯЁA-Za-z]{1,2})\s+/g, "$1 ")
    .replace(/(\d)\s+(?=[а-яёА-ЯЁ₽%])/g, "$1 ");
}
