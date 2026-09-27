import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { WordReveal } from "@/components/motion/word-reveal";
import { photos } from "@/content/photos";
import { site } from "@/content/site";

const TEXT =
  "Первый салон ROYAL THAI открылся в 2007 году на Песочной набережной. Сейчас в Петербурге работают 78 мастеров из Таиланда и Индонезии, у каждого профильное образование и большой практический опыт. В салонах отмечают Сонгкран, Дивали и Галунган.";

/** Паттерн 2: панель поверх раскрытого фото, текст проявляется по словам от скролла */
export function Manifest() {
  return (
    <section aria-labelledby="manifest-title" className="relative z-20 pb-[16svh]">
      <Container>
        <div className="grid gap-8 border border-line bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] p-6 shadow-[var(--shadow-lift)] sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="lg:col-span-8">
            <Eyebrow index="01">Мастера</Eyebrow>
            <h2 id="manifest-title" className="sr-only">
              Кто делает массаж
            </h2>
            <WordReveal
              as="p"
              text={TEXT}
              accent={[6, 15, 16, 18, 20]}
              className="mt-8 font-display text-[clamp(1.45rem,1.05rem+1.9vw,2.85rem)] leading-[1.18]"
            />
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { k: "Первый салон", v: String(site.founded) },
                { k: "Мастеров в городе", v: String(site.mastersInCity) },
                { k: "Салонов в городе", v: String(site.salonsInCity) },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[0.8rem] leading-snug text-fg-muted">{s.k}</dt>
                  <dd className="tabular mt-2 font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] leading-none text-brand">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="lg:col-span-4 lg:self-end">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius)]">
              <Image
                src={photos.team.src}
                alt={photos.team.alt}
                fill
                quality={75}
                sizes="(min-width: 1024px) 28vw, 90vw"
                placeholder="blur"
                className="object-cover object-[50%_40%]"
              />
            </div>
            <figcaption className="mt-3 text-[0.85rem] text-fg-muted">Мастера сети на общем фото</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
