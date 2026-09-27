import { fail, flaky, invalid, latency, ok } from "@/lib/api/http";
import { ServicesQuerySchema, type ServicesResponse } from "@/lib/api/schemas";
import { filterServices } from "@/lib/catalog";

/** GET /api/services?for=all|her|him|two|spa : программы с ценами и длительностью */
export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = ServicesQuerySchema.safeParse(params);
  if (!parsed.success) return invalid(parsed.error);

  await latency(320, 760);
  if (flaky(req)) return fail(503, "unavailable", "Прайс не загрузился");

  const body: ServicesResponse = { filter: parsed.data.for, items: filterServices(parsed.data.for) };
  return ok(body);
}
