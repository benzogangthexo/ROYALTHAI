import { Container } from "@/components/layout/container";
import { GiantWordmark } from "@/components/motion/giant-wordmark";
import { Logo } from "@/components/site/logo";
import { nav, site } from "@/content/site";
import { telHref } from "@/lib/utils";

const link = "inline-flex min-h-11 min-w-11 items-center transition-colors duration-300 hover:text-brand";

export function Footer() {
  return (
    <footer className="relative overflow-clip border-t border-line pb-[calc(var(--mobile-cta-h)+env(safe-area-inset-bottom)+1.5rem)] pt-[clamp(4rem,3rem+4vw,7rem)] md:pb-10">
      <Container className="grid gap-12 md:grid-cols-12 md:gap-[var(--col-gap)]">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-[26rem] text-fg-muted">
            {site.legalTagline}. В Петербурге с {site.founded} года.
          </p>
          <a href={telHref(site.phone)} className="tabular mt-8 inline-flex min-h-11 items-center font-display text-[clamp(1.8rem,1.3rem+2vw,3rem)] leading-none transition-colors hover:text-brand">
            {site.phone}
          </a>
          <p className="mt-1 text-[0.9rem] text-fg-muted">Каждый день {site.phoneHours}</p>
        </div>
        <nav aria-label="Разделы сайта" className="md:col-span-3">
          <p className="t-eyebrow text-fg-muted">Разделы</p>
          <ul className="mt-4">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className={link}>
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#booking" className={link}>
                Запись
              </a>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="t-eyebrow text-fg-muted">Связь</p>
          <ul className="mt-4">
            <li>
              <a href={`mailto:${site.email}`} className={link}>
                {site.email}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.feedbackEmail}`} className={link}>
                {site.feedbackEmail}
              </a>
              <span className="block text-[0.85rem] text-fg-muted">служба клиентского сервиса</span>
            </li>
            {site.socials.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.officialSite} target="_blank" rel="noopener noreferrer" className={link}>
                royalthai.ru
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <GiantWordmark text={"ROYAL THAI"} className="mt-16 font-display text-brand md:mt-24" />
      <Container className="mt-8 flex flex-col gap-2 text-[0.85rem] text-fg-muted sm:flex-row sm:justify-between">
        <p>© 2007-2026 ROYAL THAI</p>
        <p>Цены и адреса: royalthai.ru и Яндекс Карты, сентябрь 2026</p>
      </Container>
    </footer>
  );
}
