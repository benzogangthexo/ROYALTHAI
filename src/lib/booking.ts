/* Логика расписания записи: общая для роутов и клиента (чистые функции) */

export type Hours = { open: string; close: string } | null;
export type Week = [Hours, Hours, Hours, Hours, Hours, Hours, Hours];

export type BookingOption = {
  id: string;
  label: string;
  note?: string;
  price?: string;
  group?: string;
  badge?: string;
};

export type BookingStep = {
  id: string;
  title: string;
  hint?: string;
  options: BookingOption[];
  groups?: { id: string; label: string }[];
  columns?: 1 | 2 | 3;
};

export type BookingConfig = {
  codePrefix: string;
  timeZone: string;
  slotMinutes: number;
  /** не раньше, чем через столько минут от «сейчас» */
  leadMinutes: number;
  /** последний слот за столько минут до закрытия */
  lastSlotBeforeClose: number;
  daysAhead: number;
  /** доля занятых слотов в симуляции (0..1) */
  busyShare: number;
  /** 0 = воскресенье ... 6 = суббота; close <= open значит «после полуночи» */
  week: Week;
  /** шаг, от выбора в котором зависят часы (например, салон) */
  scopeStep?: string;
  scopes?: Record<string, Week>;
  steps: BookingStep[];
  phone: string;
};

export const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;
const MONTH_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"] as const;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (total: number) => {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/** Дата и минуты «сейчас» в часовом поясе заведения */
export function zonedNow(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

export function describeDay(date: string, today: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const rel = date === today ? "Сегодня" : date === addDays(today, 1) ? "Завтра" : WEEKDAY_SHORT[d.getUTCDay()];
  return { rel, day: d.getUTCDate(), month: MONTH_SHORT[d.getUTCMonth()] };
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export function weekFor(config: BookingConfig, scope?: string): Week {
  return (scope && config.scopes?.[scope]) || config.week;
}

/** Все стартовые минуты рабочего дня (минуты от полуночи даты, могут быть > 1440) */
export function dayTimes(config: BookingConfig, date: string, scope?: string) {
  const hours = weekFor(config, scope)[weekday(date)];
  if (!hours) return null;
  const open = toMinutes(hours.open);
  let close = toMinutes(hours.close);
  if (close <= open) close += 1440;
  const last = close - config.lastSlotBeforeClose;
  const out: number[] = [];
  for (let t = open; t <= last; t += config.slotMinutes) out.push(t);
  return out;
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Детерминированная «занятость» слота: одинаковая на сервере и при повторных запросах */
export function isBusy(config: BookingConfig, date: string, time: string, scope?: string) {
  const evening = toMinutes(time) >= 18 * 60 || toMinutes(time) < 4 * 60;
  const wd = weekday(date);
  const weekend = wd === 5 || wd === 6 || wd === 0;
  const share = Math.min(0.85, config.busyShare + (evening ? 0.12 : 0) + (weekend ? 0.1 : 0));
  return hash(`${date}|${time}|${scope ?? ""}`) < share;
}

export type SlotInfo = { time: string; available: boolean };

export function buildSlots(config: BookingConfig, date: string, scope: string | undefined, now = new Date()) {
  const times = dayTimes(config, date, scope);
  if (!times) return { closed: true, slots: [] as SlotInfo[] };
  const { date: today, minutes } = zonedNow(config.timeZone, now);
  const slots = times
    .filter((t) => date !== today || t >= minutes + config.leadMinutes)
    .map((t) => {
      const time = fromMinutes(t);
      return { time, available: !isBusy(config, date, time, scope) };
    });
  return { closed: false, slots };
}

export function bookingDays(config: BookingConfig, scope?: string, now = new Date()) {
  const { date: today } = zonedNow(config.timeZone, now);
  return Array.from({ length: config.daysAhead }, (_, i) => {
    const date = addDays(today, i);
    const hours = weekFor(config, scope)[weekday(date)];
    return { date, closed: !hours, ...describeDay(date, today) };
  });
}
