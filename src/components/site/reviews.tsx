import { Star } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { branchById } from "@/content/branches";
import { reviews } from "@/content/reviews";
import { nb } from "@/lib/utils";

const date = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

/** Реальные отзывы с Яндекс Карт: на телефоне ряд с прокруткой пальцем, на десктопе колонки */
export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="relative py-[var(--section-y)]">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--col-gap)]">
          <div className="lg:col-span-7">
            <Eyebrow index="07">Отзывы</Eyebrow>
            <h2 id="reviews-title" className="t-h1 mt-6">
              Что пишут гости
            </h2>
          </div>
          <p className="text-fg-muted lg:col-span-5">
            Отзывы с Яндекс Карт о разных салонах сети. Сокращены, опечатки исправлены, смысл тот же.
          </p>
        </div>
        <ul
          tabIndex={0}
          aria-label="Отзывы гостей, листаются вбок"
          className="-mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] md:mx-0 md:block md:columns-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:columns-3"
        >
          {reviews.map((r) => (
            <li key={r.id} className="w-[84%] max-w-[26rem] shrink-0 snap-start md:mb-6 md:w-auto md:max-w-none md:break-inside-avoid">
              <figure className="flex h-full flex-col rounded-[var(--radius)] border border-line bg-surface p-6 sm:p-8">
                <div className="flex items-center gap-1 text-brand" aria-label="Оценка 5 из 5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} aria-hidden="true" className="size-3.5 fill-current" />
                  ))}
                  <span className="t-eyebrow ml-3 text-fg-muted">{r.service}</span>
                </div>
                <blockquote className="mt-5 text-[1.02rem] leading-relaxed">«{nb(r.text)}»</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 text-[0.88rem] text-fg-muted">
                  <span className="text-fg">{r.author}</span>, салон {branchById(r.branchId)?.name ?? ""}, {date(r.date)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
