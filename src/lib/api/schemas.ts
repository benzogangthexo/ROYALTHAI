import { z } from "zod";

/* DTO и схемы: общие для роутов app/api и клиента */

export const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД");
export const TimeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Время в формате ЧЧ:ММ");

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;

export const SlotSchema = z.object({ time: TimeStr, available: z.boolean() });
export type Slot = z.infer<typeof SlotSchema>;

export const SlotsQuerySchema = z.object({
  date: DateStr,
  scope: z.string().max(80).optional(),
});

export const SlotsResponseSchema = z.object({
  date: DateStr,
  timeZone: z.string(),
  slots: z.array(SlotSchema),
  closed: z.boolean(),
});
export type SlotsResponse = z.infer<typeof SlotsResponseSchema>;

export const ChoicesSchema = z.record(z.string().max(40), z.string().max(80));

export const HoldRequestSchema = z.object({
  date: DateStr,
  time: TimeStr,
  scope: z.string().max(80).optional(),
});
export type HoldRequest = z.infer<typeof HoldRequestSchema>;

export const HoldResponseSchema = z.object({ holdId: z.string(), expiresAt: z.string() });
export type HoldResponse = z.infer<typeof HoldResponseSchema>;

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Как к вам обращаться?").max(60, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .regex(/^\+7\d{10}$/, "Номер: +7 и ещё 10 цифр"),
  comment: z.string().trim().max(300, "До 300 символов").optional(),
  consent: z.literal(true, { message: "Нужно согласие на обработку данных" }),
});
export type Contact = z.infer<typeof ContactSchema>;

export const BookingRequestSchema = ContactSchema.extend({
  requestId: z.string().min(8).max(64),
  holdId: z.string().max(64).optional(),
  scope: z.string().max(80).optional(),
  choices: ChoicesSchema,
  date: DateStr,
  time: TimeStr,
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;

export const BookingResponseSchema = z.object({
  code: z.string(),
  date: DateStr,
  time: TimeStr,
  summary: z.array(z.object({ label: z.string(), value: z.string() })),
});
export type BookingResponse = z.infer<typeof BookingResponseSchema>;
