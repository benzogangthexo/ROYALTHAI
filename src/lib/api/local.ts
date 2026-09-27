/*
 * Статическая сборка (GitHub Pages): сервера нет, поэтому apiFetch вызывает те же
 * обработчики API прямо в браузере. Задержки, zod-валидация, коды 201/409/422/503 те же.
 */
type Handler = (req: Request) => Promise<Response>;
type RouteModule = Partial<Record<"GET" | "POST", Handler>>;

const routes: Record<string, () => Promise<RouteModule>> = {
  "/api/booking": () => import("@/lib/api/routes/booking"),
  "/api/branches": () => import("@/lib/api/routes/branches"),
  "/api/services": () => import("@/lib/api/routes/services"),
  "/api/slots": () => import("@/lib/api/routes/slots"),
  "/api/slots/hold": () => import("@/lib/api/routes/slots-hold"),
};

export async function localFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const target = new URL(url, "http://static.local");
  const method = (init.method ?? "GET").toUpperCase() === "POST" ? "POST" : "GET";
  const load = routes[target.pathname.replace(/\/$/, "")];
  const handler = load ? (await load())[method] : undefined;
  if (!handler) {
    return new Response(JSON.stringify({ error: { code: "not_found", message: "Нет такого адреса" } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return handler(new Request(target.toString(), { method, headers: init.headers, body: init.body }));
}
