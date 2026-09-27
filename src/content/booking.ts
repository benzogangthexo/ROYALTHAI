import { branches, districts } from "@/content/branches";
import { optionId, serviceGroups, services } from "@/content/services";
import { site } from "@/content/site";
import type { BookingConfig, Week } from "@/lib/booking";
import { formatPrice } from "@/lib/utils";

/* Запись: программа -> салон (свои часы) -> дата -> время -> контакты. Зона Europe/Moscow. */

const daily = (open: string, close: string): Week => {
  const h = { open, close };
  return [h, h, h, h, h, h, h];
};

export const bookingConfig: BookingConfig = {
  codePrefix: "RT",
  timeZone: "Europe/Moscow",
  slotMinutes: 30,
  leadMinutes: 60,
  lastSlotBeforeClose: 60,
  daysAhead: 14,
  busyShare: 0.34,
  week: daily("10:00", "22:00"),
  scopeStep: "salon",
  scopes: Object.fromEntries(branches.map((b) => [b.id, daily(b.open, b.close)])),
  steps: [
    {
      id: "service",
      title: "Программа",
      hint: "Цена за сеанс, у программ для двоих за пару.",
      groups: serviceGroups,
      columns: 2,
      options: services
        .filter((s) => !s.addon)
        .flatMap((s) =>
          s.prices.map((p) => ({
            id: optionId(s.id, p.minutes),
            label: s.title,
            note: `${p.minutes} мин`,
            price: `${formatPrice(p.price)} ₽`,
            group: s.group,
            badge: s.pajamas ? "в пижаме" : undefined,
          })),
        ),
    },
    {
      id: "salon",
      title: "Салон",
      hint: "Часы работы у салонов разные, время подстроится.",
      groups: districts,
      columns: 2,
      options: branches.map((b) => ({
        id: b.id,
        label: b.name,
        note: b.address ?? b.place ?? "Адрес подскажет администратор",
        group: b.district,
        badge: b.close !== "22:00" ? `до ${b.close}` : undefined,
      })),
    },
  ],
  phone: site.phone,
};
