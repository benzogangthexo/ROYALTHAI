import { cn } from "@/lib/utils";

/** Линия-разделитель на всю ширину контейнера */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("h-px w-full border-0 bg-line", className)} />;
}
