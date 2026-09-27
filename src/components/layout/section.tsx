import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Секция с вертикальным ритмом; labelledBy связывает с заголовком для скринридеров */
export function Section({
  className,
  labelledBy,
  ...props
}: ComponentProps<"section"> & { labelledBy?: string }) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("relative py-[var(--section-y)]", className)}
      {...props}
    />
  );
}
