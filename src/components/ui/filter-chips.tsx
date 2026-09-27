"use client";

import { motion } from "motion/react";
import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Чипы-фильтры с «плывущей» подложкой активного пункта.
 * Адаптация Animated Background (21st.dev, ibelick / motion-primitives): motion/react, aria-pressed, без any.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  chipClassName,
  activeClassName = "text-brand-ink",
  highlightClassName = "bg-brand",
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
  chipClassName?: string;
  activeClassName?: string;
  highlightClassName?: string;
}) {
  const layoutId = useId();
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative isolate inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-line px-4 text-sm transition-colors duration-300",
              active ? activeClassName : "text-fg hover:border-line-strong",
              chipClassName,
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className={cn("absolute inset-0 -z-10 rounded-[inherit]", highlightClassName)}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            {o.label}
            {typeof o.count === "number" ? <span className="tabular opacity-60">{o.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
