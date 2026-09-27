import type { BookingConfig } from "@/lib/booking";

/* Конфиг записи заведения: часы, зона, шаги с реальными услугами и ценами */
export const bookingConfig: BookingConfig = {
  codePrefix: "DEMO",
  timeZone: "Europe/Moscow",
  slotMinutes: 30,
  leadMinutes: 60,
  lastSlotBeforeClose: 60,
  daysAhead: 14,
  busyShare: 0.3,
  week: [
    { open: "12:00", close: "00:00" },
    { open: "12:00", close: "00:00" },
    { open: "12:00", close: "00:00" },
    { open: "12:00", close: "00:00" },
    { open: "12:00", close: "00:00" },
    { open: "12:00", close: "02:00" },
    { open: "12:00", close: "02:00" },
  ],
  steps: [
    {
      id: "guests",
      title: "Сколько гостей",
      options: [
        { id: "2", label: "1-2 гостя" },
        { id: "4", label: "3-4 гостя" },
        { id: "6", label: "5-6 гостей" },
        { id: "10", label: "7-10 гостей", note: "Уточним по телефону" },
      ],
    },
  ],
  phone: "+7 (900) 000-00-00",
};
