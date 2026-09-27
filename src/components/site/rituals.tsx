import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { StickyStack } from "@/components/motion/sticky-stack";
import { PresetButton } from "@/components/site/preset-button";
import { servicePhotos } from "@/content/photos";
import { optionId, rituals, serviceById } from "@/content/services";
import { formatPrice, nb } from "@/lib/utils";

type Row = { key: string; label: string; price: number; option: string };

const SPA_IDS = ["awake", "tender", "harmony", "spa-day"];

function rowsFor(ritualId: string, serviceId: string): Row[] {
  if (ritualId === "spa") {
    return SPA_IDS.flatMap((id) => {
      const s = serviceById(id);
      const p = s?.prices[0];
      return s && p ? [{ key: id, label: `${p.minutes} мин`, price: p.price, option: optionId(id, p.minutes) }] : [];
    });
  }
  const s = serviceById(serviceId);
  return (s?.prices ?? []).map((p) => ({
    key: `${serviceId}-${p.minutes}`,
    label: `${p.minutes} мин`,
    price: p.price,
    option: optionId(serviceId, p.minutes),
  }));
}

/** Паттерн 5: четыре ритуала наезжают друг на друга (sticky-stack) */
export function Rituals() {
  return (
    <section id="rituals" aria-labelledby="rituals-title" className="relative py-[var(--section-y)]">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--col-gap)]">
          <div className="lg:col-span-7">
            <Eyebrow index="02">Ритуалы</Eyebrow>
            <h2 id="rituals-title" className="t-h1 mt-6">
              Четыре ритуала, с&nbsp;которых начинают
            </h2>
          </div>
          <p className="t-lead text-fg-muted lg:col-span-5">
            {nb("Сеанс длится от часа. Цена за сеанс, у программ для двоих за пару. Кнопка «Выбрать» сразу откроет запись.")}
          </p>
        </div>

        <StickyStack className="mt-12 md:mt-16" top="clamp(0.75rem, 3svh, 2.5rem)" step={14} shrink={0.04}>
          {rituals.map((r) => {
            const rows = rowsFor(r.id, r.serviceId);
            const photo = servicePhotos[r.photo];
            const first = rows[0];
            return (
              <article
                key={r.id}
                aria-labelledby={`ritual-${r.id}`}
                className="grid overflow-hidden rounded-[var(--radius)] border border-line bg-surface shadow-[var(--shadow-soft)] md:h-[min(34rem,calc(100svh-8rem))] md:grid-cols-[1.15fr_1fr]"
              >
                <div className="relative h-[24svh] min-h-36 md:h-full">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    quality={75}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-h-0 flex-col p-5 sm:p-8 lg:p-12">
                  <div className="flex items-baseline gap-4">
                    <span aria-hidden="true" className="font-display text-[1.6rem] leading-none text-brand lg:text-[2.6rem]">
                      {r.index}
                    </span>
                    <h3 id={`ritual-${r.id}`} className="t-h3 lg:text-[clamp(2rem,1.1rem+1.5vw,2.9rem)] lg:leading-[1.05]">
                      {r.title}
                    </h3>
                  </div>
                  <span aria-hidden="true" className="mt-6 hidden h-px w-16 bg-brand/60 lg:block" />
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-muted sm:mt-5 sm:text-base lg:text-[1.1rem]">{nb(r.text)}</p>
                  <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] gap-px overflow-hidden rounded-[calc(var(--radius)-2px)] border border-line bg-line md:mt-auto">
                    {rows.map((row) => (
                      <li key={row.key} className="bg-surface px-3 py-2.5 lg:px-4 lg:py-3.5">
                        <span className="block text-[0.75rem] text-fg-muted lg:text-[0.82rem]">{row.label}</span>
                        <span className="tabular mt-0.5 block whitespace-nowrap text-[0.98rem] text-fg lg:text-[1.2rem]">{formatPrice(row.price)} ₽</span>
                      </li>
                    ))}
                  </ul>
                  {first ? (
                    <PresetButton
                      size="lg"
                      className="mt-5 self-start"
                      stepId="service"
                      optionId={first.option}
                      aria-label={`Выбрать: ${r.title}`}
                    >
                      Выбрать
                    </PresetButton>
                  ) : null}
                </div>
              </article>
            );
          })}
        </StickyStack>
      </Container>
    </section>
  );
}
