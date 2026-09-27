"use client";

import { Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { cn, telHref } from "@/lib/utils";

/**
 * Нижняя липкая панель на телефоне: появляется после hero, прячется у секции записи.
 * Двигается только transform; учитывает safe-area-inset-bottom.
 */
export function MobileCta({
  label,
  href = "#booking",
  phone,
  heroId = "hero",
  targetId = "booking",
  className,
}: {
  label: string;
  href?: string;
  phone?: string;
  heroId?: string;
  targetId?: string;
  className?: string;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [atTarget, setAtTarget] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const target = document.getElementById(targetId);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === target) setAtTarget(e.isIntersecting);
      }
    });
    if (hero) io.observe(hero);
    if (target) io.observe(target);
    return () => io.disconnect();
  }, [heroId, targetId]);

  const visible = pastHero && !atTarget;
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-4 pt-3 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
        className,
      )}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="flex items-center gap-3">
        <a
          href={href}
          className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-brand font-medium text-brand-ink"
        >
          {label}
        </a>
        {phone ? (
          <a
            href={telHref(phone)}
            aria-label={`Позвонить: ${phone}`}
            className="grid size-12 place-items-center rounded-full border border-line-strong text-fg"
          >
            <Phone aria-hidden="true" className="size-5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
