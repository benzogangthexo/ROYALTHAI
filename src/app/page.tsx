import { MobileCta } from "@/components/layout/mobile-cta";
import { Preloader } from "@/components/motion/preloader";
import { BookingSection } from "@/components/site/booking-section";
import { Footer } from "@/components/site/footer";
import { Gift } from "@/components/site/gift";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { Flower } from "@/components/site/logo";
import { Lotus } from "@/components/site/lotus";
import { Manifest } from "@/components/site/manifest";
import { Prices } from "@/components/site/prices";
import { Reviews } from "@/components/site/reviews";
import { Rituals } from "@/components/site/rituals";
import { Salons } from "@/components/site/salons";
import { site } from "@/content/site";
import { filterBranches, filterServices } from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <Preloader>
        <Flower draw className="size-20 text-brand" />
        <span className="font-display text-[1.05rem] tracking-[0.3em] text-fg">ROYAL THAI</span>
      </Preloader>
      <div className="relative">
        <Header />
        <main id="main">
          <Hero>
            <Manifest />
          </Hero>
          <Rituals />
          <Prices initial={filterServices("all")} />
          <Lotus />
          <Salons initial={filterBranches("all")} />
          <Gift />
          <Reviews />
          <BookingSection />
        </main>
      </div>
      <Footer />
      <MobileCta label="Записаться" phone={site.phone} />
      <JsonLd />
    </>
  );
}
