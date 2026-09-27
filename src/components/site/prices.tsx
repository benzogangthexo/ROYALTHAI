"use client";

import { useState } from "react";

import { presetBooking } from "@/components/booking/preset";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { HoverImageList, type HoverImageItem } from "@/components/motion/hover-image-list";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { servicePhotos } from "@/content/photos";
import { minPrice, optionId, serviceFilters } from "@/content/services";
import { site } from "@/content/site";
import { useResource } from "@/hooks/use-resource";
import { apiFetch } from "@/lib/api/client";
import { ServicesResponseSchema, type ServiceDto, type ServiceFilter } from "@/lib/api/schemas";
import { filterServices } from "@/lib/catalog";
import { formatPrice, nb } from "@/lib/utils";

const ROW = "h-[5.75rem] py-0 sm:h-[6.25rem] sm:py-0";

function priceLabel(s: ServiceDto) {
  const value = `${formatPrice(minPrice(s))} ₽`;
  return s.prices.length > 1 ? `от ${value}` : value;
}

/** Паттерн 4: прайс, превью фото плывёт за курсором. Данные: /api/services (SSR для «Все») */
export function Prices({ initial }: { initial: ServiceDto[] }) {
  const [filter, setFilter] = useState<ServiceFilter>("all");
  const res = useResource<ServiceDto[]>(
    `services:${filter}`,
    (signal) =>
      apiFetch(`/api/services?for=${filter}`, { schema: ServicesResponseSchema, signal }).then((r) => r.items),
    { initial: { key: "services:all", data: initial } },
  );
  const expected = filterServices(filter).length;

  const items: HoverImageItem[] = (res.data ?? []).map((s) => ({
    id: s.id,
    title: <span className="line-clamp-2 font-display text-[clamp(1.15rem,1.02rem+0.55vw,1.55rem)] leading-[1.15]">{s.title}</span>,
    meta: (
      <span className="line-clamp-1 text-[0.85rem]">
        {s.prices.map((p) => p.minutes).join(" / ")} мин{s.pajamas ? ", в пижаме" : ""}
        <span className="hidden lg:inline">. {nb(s.note)}</span>
      </span>
    ),
    aside: <span className="tabular whitespace-nowrap text-[1.02rem] text-fg sm:text-lg">{priceLabel(s)}</span>,
    image: servicePhotos[s.photo].src,
    alt: servicePhotos[s.photo].alt,
    cursorLabel: "Записаться",
    onSelect: () => presetBooking("service", optionId(s.id, s.prices[0]?.minutes ?? 60)),
  }));

  const counts = serviceFilters.map((f) => ({ ...f, count: filterServices(f.id).length }));

  return (
    <section id="prices" aria-labelledby="prices-title" className="relative py-[var(--section-y)]">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-[var(--col-gap)]">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-10">
            <Eyebrow index="03">Цены</Eyebrow>
            <h2 id="prices-title" className="t-h1 mt-6 lg:text-[length:var(--fs-h2)]">
              Все программы и цены
            </h2>
            <p className="mt-6 text-fg-muted">
              {nb("Цены сети на сентябрь 2026 года. Нажмите на программу, и она окажется в записи.")}
            </p>
            <p className="mt-6 border-l border-brand pl-4 text-[0.95rem] text-fg">
              Счастливые часы: {site.happyHours.days} с {site.happyHours.from} до {site.happyHours.to} скидка{" "}
              {site.happyHours.discount}% на программы от {site.happyHours.minMinutes} минут.
            </p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <FilterChips label="Подборка программ" options={counts} value={filter} onChange={setFilter} />
          <div className="mt-8 max-md:[&_.hover-thumb]:hidden" aria-busy={res.status === "loading"}>
            <p aria-live="polite" className="sr-only">
              {res.status === "loading" ? "Загружаем программы" : res.status === "success" ? `Программ: ${items.length}` : ""}
            </p>
            {res.status === "loading" ? (
              <ul className="border-t border-line" aria-hidden="true">
                {Array.from({ length: expected }, (_, i) => (
                  <li key={i} className="border-b border-line">
                    <div className={`flex items-center gap-4 sm:gap-6 ${ROW}`}>
                      <span className="hover-thumb skeleton size-16 shrink-0 sm:size-20" />
                      <span className="min-w-0 flex-1">
                        <span className="skeleton block h-5 w-3/5" />
                        <span className="skeleton mt-3 block h-3.5 w-2/5" />
                      </span>
                      <span className="skeleton h-5 w-20 shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : res.status === "error" ? (
              <div role="alert" className="flex flex-col items-start gap-4 border-y border-line py-10">
                <p className="t-h3">Прайс не загрузился</p>
                <p className="text-fg-muted">{res.error?.message ?? "Ошибка сети"}. Попробуйте ещё раз или позвоните: {site.phone}.</p>
                <Button variant="outline" onClick={res.retry}>
                  Повторить
                </Button>
              </div>
            ) : res.status === "empty" ? (
              <div className="flex flex-col items-start gap-4 border-y border-line py-10">
                <p className="t-h3">В этой подборке пока пусто</p>
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Показать все программы
                </Button>
              </div>
            ) : (
              <HoverImageList
                items={items}
                rowClassName={ROW}
                previewClassName="h-[17rem] w-[12.5rem] rounded-t-[999px]"
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
