import { branches, type Branch } from "@/content/branches";
import { services, type Service } from "@/content/services";
import type { DistrictFilter, ServiceFilter } from "@/lib/api/schemas";

/* Общие фильтры: ими пользуются роуты app/api и клиент (скелетон той же геометрии) */

export function filterServices(filter: ServiceFilter): Service[] {
  return filter === "all" ? services : services.filter((s) => s.tags.includes(filter));
}

const norm = (v: string) =>
  v
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();

export function filterBranches(district: DistrictFilter, q = ""): Branch[] {
  const words = norm(q).split(" ").filter(Boolean);
  /* сначала салоны с адресом (стабильная сортировка сохраняет порядок внутри групп) */
  const sorted = [...branches].sort((a, b) => Number(!a.address) - Number(!b.address));
  return sorted.filter((b) => {
    if (district !== "all" && b.district !== district) return false;
    if (!words.length) return true;
    const hay = norm([b.name, b.address ?? "", b.place ?? "", ...b.metro].join(" "));
    return words.every((w) => hay.includes(w));
  });
}
