import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { GrowMedia } from "@/components/motion/grow-media";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Button } from "@/components/ui/button";
import { photos } from "@/content/photos";
import { site } from "@/content/site";
import { formatPrice, nb, telHref } from "@/lib/utils";

const ways = [
  { t: "Бумажный", d: "забрать в любом салоне" },
  { t: "Электронный", d: "оформляется онлайн" },
  { t: "С курьером", d: "доставка на следующий день" },
];

/** Сертификаты: фото растёт от скролла, номиналы с royalthai.ru/certificates/deposits/ */
export function Gift() {
  return (
    <section id="gift" aria-labelledby="gift-title" className="relative py-[var(--section-y)]">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-[var(--col-gap)]">
        <div className="relative lg:col-span-6">
          <GrowMedia
            from={0.84}
            className="aspect-[4/5] rounded-t-[999px] sm:aspect-[4/3] sm:rounded-t-[var(--radius)] lg:aspect-[4/5] lg:rounded-t-[999px]"
          >
            <Image
              src={photos.certBox.src}
              alt={photos.certBox.alt}
              fill
              quality={75}
              sizes="(min-width: 1024px) 48vw, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </GrowMedia>
        </div>

        <div className="lg:col-span-6 lg:pl-[4%]">
          <Eyebrow index="06">Сертификаты</Eyebrow>
          <h2 id="gift-title" className="t-h1 mt-6">
            Подарить час тишины
          </h2>
          <p className="t-lead mt-6 text-fg-muted">
            {nb(
              "Сертификат на программу или на сумму. Дату, салон и программу получатель выберет сам. Сертификаты и абонементы принимают во всей сети.",
            )}
          </p>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-3">
            {ways.map((w) => (
              <li key={w.t} className="bg-bg p-4">
                <span className="block font-display text-[1.25rem]">{w.t}</span>
                <span className="mt-1 block text-[0.88rem] text-fg-muted">{w.d}</span>
              </li>
            ))}
          </ul>
          <p className="t-eyebrow mt-10 text-fg-muted">Сертификаты на сумму</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Номиналы сертификатов">
            {site.deposits.map((v) => (
              <li key={v} className="tabular rounded-[var(--radius-pill)] border border-line-strong px-4 py-2 text-[0.95rem]">
                {formatPrice(v)} ₽
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton asChild size="lg">
              <a href={site.certificatesUrl} target="_blank" rel="noopener noreferrer">
                Купить сертификат
              </a>
            </MagneticButton>
            <Button asChild variant="outline" size="lg">
              <a href={telHref(site.phone)} className="tabular">
                {site.phone}
              </a>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-5 border-t border-line pt-8">
            <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-[calc(var(--radius)-2px)] sm:w-36">
              <Image src={photos.certTray.src} alt={photos.certTray.alt} fill quality={75} sizes="144px" className="object-cover" />
            </div>
            <p className="text-[0.95rem] text-fg-muted">
              Корпоративным клиентам: сертификаты для сотрудников и партнёров по договору,{" "}
              <a href={`mailto:${site.salesEmail}`} className="text-fg underline decoration-brand underline-offset-4">
                {site.salesEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
