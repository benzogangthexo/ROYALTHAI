import { bookingConfig } from "@/content/booking";
import { fail, flaky, invalid, latency, ok } from "@/lib/api/http";
import { SlotsQuerySchema, type SlotsResponse } from "@/lib/api/schemas";
import { isHeld, slotKey, store } from "@/lib/api/store";
import { addDays, buildSlots, zonedNow } from "@/lib/booking";

export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = SlotsQuerySchema.safeParse(params);
  if (!parsed.success) return invalid(parsed.error);
  const { date, scope } = parsed.data;

  await latency(300, 800);
  if (flaky(req)) return fail(503, "unavailable", "Расписание не загрузилось");

  if (scope && bookingConfig.scopes && !bookingConfig.scopes[scope]) {
    return fail(404, "unknown_scope", "Такого варианта нет");
  }
  const today = zonedNow(bookingConfig.timeZone).date;
  if (date < today || date > addDays(today, bookingConfig.daysAhead)) {
    return fail(422, "out_of_range", "На эту дату запись не открыта");
  }

  const { closed, slots } = buildSlots(bookingConfig, date, scope);
  const body: SlotsResponse = {
    date,
    timeZone: bookingConfig.timeZone,
    closed,
    slots: slots.map((s) => {
      const key = slotKey(date, s.time, scope);
      return { time: s.time, available: s.available && !store.booked.has(key) && !isHeld(key) };
    }),
  };
  return ok(body);
}
