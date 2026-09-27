import { fail, flaky, invalid, latency, ok } from "@/lib/api/http";
import { BranchesQuerySchema, type BranchesResponse } from "@/lib/api/schemas";
import { filterBranches } from "@/lib/catalog";

/** GET /api/branches?district=all|center|north|south|east|islands&q=метро или улица */
export async function GET(req: Request) {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = BranchesQuerySchema.safeParse(params);
  if (!parsed.success) return invalid(parsed.error);

  await latency(360, 820);
  if (flaky(req)) return fail(503, "unavailable", "Список салонов не загрузился");

  const { district, q = "" } = parsed.data;
  const body: BranchesResponse = { district, q, items: filterBranches(district, q) };
  return ok(body);
}
