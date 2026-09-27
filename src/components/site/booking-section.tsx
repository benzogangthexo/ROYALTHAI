import Image from "next/image";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/layout/eyebrow";
import { photos } from "@/content/photos";
import { site } from "@/content/site";
import { nb, telHref } from "@/lib/utils";

export function BookingSection() {
  return (
    <section id="booking" aria-labelledby="booking-title" className="relative py-[var(--section-y)]">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--col-gap)]">
        <div className="lg:col-span-5">
          <Eyebrow index="08">Запись</Eyebrow>
          <h2 id="booking-title" className="t-h1 mt-6">
            Запись в любой салон сети
          </h2>
          <p className="t-lead mt-6 text-fg-muted">
            {nb("Программа, салон, день и время. Свободные окна считаются по часам выбранного салона.")}
          </p>
          <p className="mt-6 text-fg-muted">
            Голосом быстрее? Звоните{" "}
            <a href={telHref(site.phone)} className="tabular whitespace-nowrap text-fg underline decoration-brand underline-offset-4">
              {site.phone}
            </a>
            , {site.phoneHours}.
          </p>
          <div className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-t-[999px] lg:block">
            <Image
              src={photos.coupleMasters.src}
              alt={photos.coupleMasters.alt}
              fill
              quality={75}
              sizes="36vw"
              placeholder="blur"
              className="object-cover object-[40%_50%]"
            />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <BookingWizard successNote="Администратор салона перезвонит и подтвердит визит. Номер записи назовите на ресепшене." />
        </div>
      </Container>
    </section>
  );
}
