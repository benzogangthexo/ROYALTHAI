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

/* ===== Прайс и салоны ===== */

export const ServiceTagSchema = z.enum(["her", "him", "two", "spa"]);
export const ServiceFilterSchema = z.enum(["all", "her", "him", "two", "spa"]);
export type ServiceFilter = z.infer<typeof ServiceFilterSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string(),
  group: z.enum(["body", "spa", "two", "local", "shape"]),
  tags: z.array(ServiceTagSchema),
  photo: z.enum(["thai", "oil", "spa", "two", "local", "stone", "barrel"]),
  prices: z.array(z.object({ minutes: z.number().int().positive(), price: z.number().int().positive() })).min(1),
  pajamas: z.boolean().optional(),
  addon: z.boolean().optional(),
});
export type ServiceDto = z.infer<typeof ServiceSchema>;

export const ServicesQuerySchema = z.object({ for: ServiceFilterSchema.default("all") });
export const ServicesResponseSchema = z.object({ filter: ServiceFilterSchema, items: z.array(ServiceSchema) });
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;

export const DistrictFilterSchema = z.enum(["all", "center", "north", "south", "east", "islands"], {
  message: "Такой части города нет",
});
export type DistrictFilter = z.infer<typeof DistrictFilterSchema>;

export const BranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  district: z.enum(["center", "north", "south", "east", "islands"]),
  address: z.string().nullable(),
  place: z.string().optional(),
  metro: z.array(z.string()),
  open: TimeStr,
  close: TimeStr,
  yandexId: z.string().optional(),
  rating: z.object({ value: z.number(), reviews: z.number().int() }).optional(),
  coords: z.tuple([z.number(), z.number()]).optional(),
  bali: z.boolean().optional(),
});
export type BranchDto = z.infer<typeof BranchSchema>;

export const BranchesQuerySchema = z.object({
  district: DistrictFilterSchema.default("all"),
  q: z.string().trim().max(60, "Слишком длинный запрос").optional(),
});
export const BranchesResponseSchema = z.object({
  district: DistrictFilterSchema,
  q: z.string(),
  items: z.array(BranchSchema),
});
export type BranchesResponse = z.infer<typeof BranchesResponseSchema>;
