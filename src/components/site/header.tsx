import { Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Logo } from "@/components/site/logo";
import { nav, site } from "@/content/site";
import { telHref } from "@/lib/utils";

/** Шапка не липкая: лежит поверх первого экрана и уезжает со скроллом */
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Разделы" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="inline-flex min-h-11 items-center px-3 text-[0.95rem] text-fg-muted transition-colors duration-300 hover:text-fg"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <a
            href={telHref(site.phone)}
            className="tabular hidden min-h-11 items-center text-[0.95rem] text-fg transition-colors duration-300 hover:text-brand md:inline-flex"
          >
            {site.phone}
          </a>
          <a
            href={telHref(site.phone)}
            aria-label={`Позвонить: ${site.phone}`}
            className="grid size-11 place-items-center rounded-full border border-line-strong text-fg md:hidden"
          >
            <Phone aria-hidden="true" className="size-[1.1rem]" />
          </a>
          <MagneticButton asChild size="sm" wrapperClassName="hidden sm:inline-flex">
            <a href="#booking">Записаться</a>
          </MagneticButton>
        </div>
      </Container>
    </header>
  );
}
