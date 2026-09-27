import { cn } from "@/lib/utils";

const PETAL = "M0 -3.4C-5.8 -8.6 -6.6 -15.8 0 -21.6C6.6 -15.8 5.8 -8.6 0 -3.4Z";

/** Четырёхлепестковый цветок из логотипа сети, перерисован вектором */
export function Flower({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="-24 -24 48 48" className={cn("overflow-visible", className)} aria-hidden="true" fill="none">
      {[45, 135, 225, 315].map((r) => (
        <path
          key={r}
          d={PETAL}
          transform={`rotate(${r})`}
          pathLength={draw ? 1 : undefined}
          className={draw ? "preloader__draw" : undefined}
          stroke="currentColor"
          strokeWidth={draw ? 0.9 : 1.5}
          fill={draw ? "none" : "currentColor"}
          fillOpacity={draw ? undefined : 0.22}
          strokeLinejoin="round"
        />
      ))}
      <rect x="-2.3" y="-2.3" width="4.6" height="4.6" transform="rotate(45)" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#hero"
      aria-label="ROYAL THAI, в начало страницы"
      className={cn("inline-flex min-h-11 items-center gap-3 text-fg", className)}
    >
      <Flower className="size-8 shrink-0 text-brand" />
      <span className="whitespace-nowrap font-display text-[1.1rem] leading-none tracking-[0.2em]">ROYAL THAI</span>
    </a>
  );
}
