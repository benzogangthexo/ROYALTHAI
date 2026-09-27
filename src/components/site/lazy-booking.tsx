"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

import { BOOKING_EVENT, type BookingPreset } from "@/components/booking/preset";
import { site } from "@/content/site";
import { telHref } from "@/lib/utils";

type WizardProps = { className?: string; successNote?: string };

/**
 * Форма записи грузится, когда секция в 1400 px от экрана или когда нажали «Выбрать»:
 * меньше JS на старте. Предвыбор, пришедший до загрузки, повторяется после монтирования.
 * Без JS видна подсказка с телефоном.
 */
export function LazyBooking({ successNote }: { successNote?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Wizard, setWizard] = useState<ComponentType<WizardProps> | null>(null);
  const pending = useRef<BookingPreset[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      import("@/components/booking/booking-wizard").then((m) => {
        if (alive) setWizard(() => m.BookingWizard);
      });
    const onPreset = (e: Event) => {
      if (Wizard) return;
      pending.current.push((e as CustomEvent<BookingPreset>).detail);
      load();
    };
    window.addEventListener(BOOKING_EVENT, onPreset);
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "1400px 0px" },
    );
    if (el && !Wizard) io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      window.removeEventListener(BOOKING_EVENT, onPreset);
    };
  }, [Wizard]);

  useEffect(() => {
    if (!Wizard || !pending.current.length) return;
    const list = pending.current;
    pending.current = [];
    for (const detail of list) window.dispatchEvent(new CustomEvent<BookingPreset>(BOOKING_EVENT, { detail }));
  }, [Wizard]);

  return (
    <div ref={ref} className="min-h-[34rem]">
      {Wizard ? (
        <Wizard successNote={successNote} />
      ) : (
        <div className="rounded-[var(--radius)] border border-line bg-surface p-6 sm:p-10">
          <p className="t-eyebrow text-fg-muted">Шаг 1 из 5</p>
          <p className="t-h3 mt-4">Программа</p>
          <div aria-hidden="true" className="mt-8 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="skeleton block h-16" />
            ))}
          </div>
          <p className="mt-8 text-fg-muted">
            Форма записи загружается. Можно записаться по телефону{" "}
            <a href={telHref(site.phone)} className="tabular whitespace-nowrap text-fg underline decoration-brand underline-offset-4">
              {site.phone}
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
