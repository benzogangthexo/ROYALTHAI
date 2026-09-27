import { bookingConfig } from "@/content/booking";
import { fail, flaky, invalid, latency, ok } from "@/lib/api/http";
import { HoldRequestSchema, type HoldResponse } from "@/lib/api/schemas";
import { HOLD_MS, isHeld, newId, slotKey, store } from "@/lib/api/store";
import { buildSlots } from "@/lib/booking";

export async function POST(req: Request) {
  const json: unknown = await req.json().catch(() => null);
  const parsed = HoldRequestSchema.safeParse(json);
  if (!parsed.success) return invalid(parsed.error);
  const { date, time, scope } = parsed.data;

  await latency(250, 600);
  if (flaky(req)) return fail(503, "unavailable", "Не получилось придержать время");

  const slot = buildSlots(bookingConfig, date, scope).slots.find((s) => s.time === time);
  if (!slot) return fail(422, "no_such_slot", "Такого времени в расписании нет");
  const key = slotKey(date, time, scope);
  if (!slot.available || store.booked.has(key) || isHeld(key)) {
    return fail(409, "slot_taken", "Это время только что заняли");
  }

  const hold = { id: newId(), slotKey: key, expiresAt: Date.now() + HOLD_MS };
  store.holds.set(hold.id, hold);
  const body: HoldResponse = { holdId: hold.id, expiresAt: new Date(hold.expiresAt).toISOString() };
  return ok(body, 201);
}
