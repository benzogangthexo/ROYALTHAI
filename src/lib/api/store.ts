import type { BookingResponse } from "@/lib/api/schemas";

/* Память процесса (симуляция бэкенда): globalThis, чтобы все роуты видели одно хранилище */
type Hold = { id: string; slotKey: string; expiresAt: number };
type Store = { holds: Map<string, Hold>; booked: Set<string>; requests: Map<string, BookingResponse> };

const g = globalThis as unknown as { __venueStore?: Store };
export const store: Store = (g.__venueStore ??= { holds: new Map(), booked: new Set(), requests: new Map() });

export const slotKey = (date: string, time: string, scope?: string) => `${date}|${time}|${scope ?? ""}`;

export const HOLD_MS = 10 * 60 * 1000;

export function cleanupHolds(now = Date.now()) {
  for (const [id, hold] of store.holds) if (hold.expiresAt < now) store.holds.delete(id);
}

export function isHeld(key: string, now = Date.now()) {
  cleanupHolds(now);
  for (const hold of store.holds.values()) if (hold.slotKey === key) return true;
  return false;
}

export function newId(prefix = "") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return prefix ? `${prefix}-${out}` : out;
}
