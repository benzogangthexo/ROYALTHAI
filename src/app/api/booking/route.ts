import { bookingConfig } from "@/content/booking";
import { fail, flaky, invalid, latency, ok } from "@/lib/api/http";
import { BookingRequestSchema, type BookingResponse } from "@/lib/api/schemas";
import { isHeld, newId, slotKey, store } from "@/lib/api/store";
import { buildSlots, formatDateLong } from "@/lib/booking";

export async function POST(req: Request) {
  const json: unknown = await req.json().catch(() => null);
  const parsed = BookingRequestSchema.safeParse(json);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  const repeat = store.requests.get(data.requestId);
  if (repeat) return ok(repeat, 201);

  await latency(500, 1100);
  if (flaky(req)) return fail(503, "unavailable", "Заявка не ушла, пробуем ещё раз");

  const summary: BookingResponse["summary"] = [];
  for (const step of bookingConfig.steps) {
    const option = step.options.find((o) => o.id === data.choices[step.id]);
    if (!option) return fail(422, "choice_missing", `Выберите: ${step.title.toLowerCase()}`, { [step.id]: ["Не выбрано"] });
    summary.push({ label: step.title, value: option.label });
  }

  const scope = bookingConfig.scopeStep ? data.choices[bookingConfig.scopeStep] : undefined;
  const key = slotKey(data.date, data.time, scope);
  const slot = buildSlots(bookingConfig, data.date, scope).slots.find((s) => s.time === data.time);
  const hold = data.holdId ? store.holds.get(data.holdId) : undefined;
  const ownHold = hold !== undefined && hold.slotKey === key && hold.expiresAt > Date.now();
  if (!slot || store.booked.has(key) || (!ownHold && (!slot.available || isHeld(key)))) {
    return fail(409, "slot_taken", "Пока вы заполняли форму, это время заняли. Выберите другое");
  }

  if (hold) store.holds.delete(hold.id);
  store.booked.add(key);
  summary.push({ label: "Когда", value: `${formatDateLong(data.date)}, ${data.time}` });
  const body: BookingResponse = { code: newId(bookingConfig.codePrefix), date: data.date, time: data.time, summary };
  store.requests.set(data.requestId, body);
  return ok(body, 201);
}
