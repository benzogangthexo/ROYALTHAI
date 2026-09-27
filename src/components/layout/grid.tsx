import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Сетка 4 / 6 / 12 колонок (телефон / планшет / десктоп) */
export function Grid({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-4 gap-x-[var(--col-gap)] gap-y-10 md:grid-cols-6 lg:grid-cols-12", className)}
      {...props}
    />
  );
}
