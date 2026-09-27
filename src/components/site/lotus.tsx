import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { Counter } from "@/components/motion/counter";
import { ScrollRotate } from "@/components/motion/scroll-rotate";
import { yandexSummary } from "@/content/branches";
import { site } from "@/content/site";

const OUTER = "M0 -108C21 -126 27 -160 0 -190C-27 -160 -21 -126 0 -108Z";
const INNER = "M0 -108C13 -121 16 -142 0 -158C-16 -142 -13 -121 0 -108Z";
const ANGLES = Array.from({ length: 16 }, (_, i) => i * 22.5);

/** Мандала-лотос: линии в золоте, вращается от скролла (паттерн 3) */
function Mandala() {
  return (
    <svg viewBox="-200 -200 400 400" aria-hidden="true" className="size-full text-brand" fill="none" stroke="currentColor">
      <circle r="197" strokeWidth="0.8" strokeOpacity="0.5" />
      <circle r="190" strokeWidth="1.2" strokeDasharray="0.5 7" strokeLinecap="round" />
      <circle r="104" strokeWidth="0.8" />
      <circle r="98" strokeWidth="0.6" strokeOpacity="0.4" />
      {ANGLES.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={OUTER} strokeWidth="0.9" />
          <path d={INNER} transform="rotate(11.25)" strokeWidth="0.7" strokeOpacity="0.6" />
          <line y1="-160" y2="-186" transform="rotate(11.25)" strokeWidth="0.6" strokeOpacity="0.5" />
          <rect x="-2.2" y="-199.2" width="4.4" height="4.4" transform="rotate(45 0 -197)" fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export function Lotus() {
  return (
    <section id="ratings" aria-labelledby="ratings-title" className="relative overflow-clip py-[var(--section-y)]">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-[var(--col-gap)]">
        <div className="lg:col-span-5">
          <Eyebrow index="04">Оценки</Eyebrow>
          <h2 id="ratings-title" className="t-h1 mt-6">
            Гости ставят пять звёзд
          </h2>
          <p className="t-lead mt-6 text-fg-muted">
            У&nbsp;{yandexSummary.salons} салонов сети есть карточки на Яндекс Картах. У {yandexSummary.top} из них средняя оценка 5,0, у остальных
            4,9. В&nbsp;2025&nbsp;году сеть получила премию {site.award}.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8">
            <div>
              <dt className="text-[0.85rem] text-fg-muted">Отзывов на Яндекс Картах</dt>
              <dd className="tabular mt-2 font-display text-[clamp(2rem,1.5rem+2vw,3.4rem)] leading-none text-fg">
                <Counter value={yandexSummary.reviews} />
              </dd>
            </div>
            <div>
              <dt className="text-[0.85rem] text-fg-muted">Мастеров в Петербурге</dt>
              <dd className="tabular mt-2 font-display text-[clamp(2rem,1.5rem+2vw,3.4rem)] leading-none text-fg">
                <Counter value={site.mastersInCity} />
              </dd>
            </div>
          </dl>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <p className="border border-line-strong p-5 text-[0.95rem]">
              <span className="t-eyebrow block text-brand">Счастливые часы</span>
              <span className="mt-3 block">
                {site.happyHours.days[0].toUpperCase() + site.happyHours.days.slice(1)} с {site.happyHours.from} до{" "}
                {site.happyHours.to}: скидка {site.happyHours.discount}% на программы от {site.happyHours.minMinutes} минут.
              </span>
            </p>
            <p className="border border-line-strong p-5 text-[0.95rem]">
              <span className="t-eyebrow block text-brand">День рождения</span>
              <span className="mt-3 block">
                Скидка {site.birthday.discount}% на программы от {site.birthday.minMinutes} минут в день рождения и две недели
                после.
              </span>
            </p>
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[40rem]">
            <ScrollRotate from={-35} to={145} className="absolute inset-0">
              <Mandala />
            </ScrollRotate>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div className="max-w-[46%]">
                <p className="tabular font-display text-[clamp(3.4rem,2.2rem+6vw,7.5rem)] leading-none text-brand">5,0</p>
                <p className="mt-3 text-[clamp(0.78rem,0.7rem+0.3vw,0.95rem)] leading-snug text-fg-muted">
                  у {yandexSummary.top} из {yandexSummary.salons} салонов на Яндекс Картах
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
