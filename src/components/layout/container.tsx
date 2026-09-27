import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Контейнер: max-width + поля с учётом safe-area */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("safe-x mx-auto w-full max-w-[var(--container)]", className)} {...props} />;
}
