import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Надзаголовок: номер секции + подпись + линия */
export function Eyebrow({ index, className, children, ...props }: ComponentProps<"p"> & { index?: string }) {
  return (
    <p className={cn("t-eyebrow flex items-center gap-3 text-fg-muted", className)} {...props}>
      {index ? <span className="tabular text-brand">{index}</span> : null}
      <span>{children}</span>
      <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-line" />
    </p>
  );
}
