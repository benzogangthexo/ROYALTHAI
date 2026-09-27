"use client";

import { ArrowUpRight, Search, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { presetBooking } from "@/components/booking/preset";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { Parallax } from "@/components/motion/parallax";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { branches, districts, routeHref } from "@/content/branches";
import { photos, type Photo } from "@/content/photos";
import { site } from "@/content/site";
import { useMounted } from "@/hooks/use-mounted";
import { useResource } from "@/hooks/use-resource";
import { apiFetch } from "@/lib/api/client";
import { BranchesResponseSchema, type BranchDto, type DistrictFilter } from "@/lib/api/schemas";
import { toMinutes, zonedNow } from "@/lib/booking";
import { filterBranches } from "@/lib/catalog";
import { cn, nb, telHref } from "@/lib/utils";

const CARD = "h-[13.25rem] sm:h-[13.75rem]";
const COLLAPSED = 6;

const mosaic: { photo: Photo; caption: string; figure: string; media: string; speed: number }[] = [
  { photo: photos.roomBath, caption: "Комната с ванной", figure: "col-span-2 md:col-span-5", media: "aspect-[16/10] md:aspect-[4/5]", speed: 0.06 },
  { photo: photos.roomElephants, caption: "Комната для двоих", figure: "md:col-span-4 md:mt-24", media: "aspect-[3/4]", speed: -0.08 },
  { photo: photos.teaDetail, caption: "Чай после сеанса", figure: "md:col-span-3 md:mt-48", media: "aspect-[3/4]", speed: 0.12 },
];

function OpenNow({ open, close }: { open: string; close: string }) {
  const mounted = useMounted();
  if (!mounted) return null;
  const now = zonedNow("Europe/Moscow").minutes;
  const isOpen = now >= toMinutes(open) && now < toMinutes(close);
  return (
    <span className={cn("inline-flex items-center gap-1.5", isOpen ? "text-brand-3" : "text-fg-muted")}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", isOpen ? "bg-brand-3" : "bg-fg-muted")} />
      {isOpen ? "открыто" : "закрыто"}
    </span>
  );
}

function BranchCard({ b }: { b: BranchDto }) {
  const where = b.address ?? b.place;
  return (
    <li className={cn("flex flex-col bg-bg p-5 sm:p-6", CARD)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="t-h3 min-w-0">{b.name}</h3>
        {b.rating ? (
          <span className="tabular mt-1 inline-flex shrink-0 items-center gap-1 text-[0.85rem] text-fg-muted" title="Оценка на Яндекс Картах">
            <Star aria-hidden="true" className="size-3.5 fill-brand text-brand" />
            <span className="sr-only">Оценка на Яндекс Картах:</span>
            {b.rating.value.toFixed(1).replace(".", ",")}
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-[0.95rem]">
        {where ? (
          <>
            {where}
            {b.address && b.place ? <span className="text-fg-muted">, {b.place}</span> : null}
          </>
        ) : (
          <span className="text-fg-muted">Адрес подскажет администратор</span>
        )}
      </p>
      <p className="mt-1 line-clamp-1 text-[0.88rem] text-fg-muted">
        {b.metro.length ? `м. ${b.metro.join(", ")}` : b.bali ? "Салон Bali, балийский массаж" : "Санкт-Петербург"}
      </p>
      <p className="tabular mt-1 flex flex-wrap items-center gap-x-3 text-[0.88rem] text-fg-muted">
        <span>
          Ежедневно {b.open}-{b.close}
        </span>
        <OpenNow open={b.open} close={b.close} />
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <a
          href={routeHref(b)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] px-3 text-[0.9rem] text-fg transition-colors hover:text-brand"
          aria-label={`Маршрут до салона ${b.name} в Яндекс Картах`}
        >
          Маршрут
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          aria-label={`Записаться в салон ${b.name}`}
          onClick={() => presetBooking("salon", b.id)}
        >
          Записаться<span className="hidden sm:inline">&nbsp;сюда</span>
        </Button>
      </div>
    </li>
  );
}

/** Салоны по частям города: чипы + поиск по метро/улице, /api/branches, скелетон той же геометрии */
export function Salons({ initial }: { initial: BranchDto[] }) {
  const [district, setDistrict] = useState<DistrictFilter>("all");
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(query.trim()), 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const res = useResource<BranchDto[]>(
    `branches:${district}:${q}`,
    (signal) =>
      apiFetch(`/api/branches?district=${district}${q ? `&q=${encodeURIComponent(q)}` : ""}`, {
        schema: BranchesResponseSchema,
        signal,
      }).then((r) => r.items),
    { initial: { key: "branches:all:", data: initial } },
  );

  const expected = filterBranches(district, q).length;
  const limit = expanded ? Infinity : COLLAPSED;
  const list = res.data ?? [];
  const shown = list.slice(0, limit);
  const options = [
    { id: "all" as DistrictFilter, label: "Все", count: branches.length },
    ...districts.map((d) => ({ id: d.id as DistrictFilter, label: d.label, count: filterBranches(d.id).length })),
  ];
  const reset = () => {
    setDistrict("all");
    setQuery("");
    setQ("");
  };

  return (
    <section id="salons" aria-labelledby="salons-title" className="relative py-[var(--section-y)]">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--col-gap)]">
          <div className="lg:col-span-7">
            <Eyebrow index="05">Салоны</Eyebrow>
            <h2 id="salons-title" className="t-h1 mt-6">
              {site.salonsInCity}&nbsp;салонов. Выберите тот, что по&nbsp;пути
            </h2>
          </div>
          <p className="t-lead text-fg-muted lg:col-span-5">
            {nb("Сертификаты и абонементы действуют во всей сети. Ищите по метро, улице или части города.")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-12 md:gap-[var(--col-gap)]">
          {mosaic.map((m) => (
            <figure key={m.caption} className={cn("min-w-0", m.figure)}>
              <Parallax speed={m.speed} className="h-full">
                <div className={cn("relative overflow-hidden rounded-[var(--radius)]", m.media)}>
                  <Image
                    src={m.photo.src}
                    alt={m.photo.alt}
                    fill
                    quality={75}
                    sizes="(min-width: 768px) 40vw, 50vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
                <figcaption className="t-eyebrow mt-3 text-fg-muted">{m.caption}</figcaption>
              </Parallax>
            </figure>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 md:mt-24 lg:flex-row lg:items-center lg:justify-between">
          <FilterChips
            label="Часть города"
            options={options}
            value={district}
            onChange={(v) => {
              setDistrict(v);
              setExpanded(false);
            }}
          />
          <div className="relative w-full lg:max-w-[20rem]">
            <label htmlFor="salon-q" className="sr-only">
              Поиск салона по метро или улице
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
            <input
              id="salon-q"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Метро или улица"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setExpanded(false);
              }}
              className="field pl-11"
            />
          </div>
        </div>

        <div className="mt-8" aria-busy={res.status === "loading"}>
          <p aria-live="polite" className="sr-only">
            {res.status === "success" ? `Найдено салонов: ${list.length}` : res.status === "empty" ? "Салонов не найдено" : ""}
          </p>
          {res.status === "loading" ? (
            <ul aria-hidden="true" className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: Math.min(expected, limit) }, (_, i) => (
                <li key={i} className={cn("flex flex-col bg-bg p-5 sm:p-6", CARD)}>
                  <span className="skeleton block h-7 w-1/2" />
                  <span className="skeleton mt-4 block h-4 w-4/5" />
                  <span className="skeleton mt-3 block h-3.5 w-3/5" />
                  <span className="skeleton mt-3 block h-3.5 w-2/5" />
                  <span className="mt-auto flex justify-between pt-3">
                    <span className="skeleton block h-11 w-24 rounded-full" />
                    <span className="skeleton block h-11 w-36 rounded-full" />
                  </span>
                </li>
              ))}
            </ul>
          ) : res.status === "error" ? (
            <div role="alert" className="flex flex-col items-start gap-4 rounded-[var(--radius)] border border-line p-8">
              <p className="t-h3">Список салонов не загрузился</p>
              <p className="text-fg-muted">
                {res.error?.message ?? "Ошибка сети"}. Попробуйте ещё раз или позвоните: {site.phone}.
              </p>
              <Button variant="outline" onClick={res.retry}>
                Повторить
              </Button>
            </div>
          ) : res.status === "empty" ? (
            <div className="flex flex-col items-start gap-4 rounded-[var(--radius)] border border-line p-8">
              <p className="t-h3">В этом районе салона пока нет</p>
              <p className="max-w-[40rem] text-fg-muted">
                Проверьте название метро или улицы. Ближайший салон подскажут по телефону{" "}
                <a href={telHref(site.phone)} className="tabular text-fg underline decoration-brand underline-offset-4">
                  {site.phone}
                </a>
                .
              </p>
              <Button variant="outline" onClick={reset}>
                Показать все салоны
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((b) => (
                  <BranchCard key={b.id} b={b} />
                ))}
              </ul>
              {list.length > shown.length ? (
                <Button variant="outline" className="mt-6" onClick={() => setExpanded(true)}>
                  Показать ещё {list.length - shown.length}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
