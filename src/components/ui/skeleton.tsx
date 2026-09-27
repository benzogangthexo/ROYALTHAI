import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Скелетон: задавай ту же геометрию, что у контента (CLS = 0) */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("skeleton", className)} {...props} />;
}
