import { DrawOnScroll } from "@/components/motion/draw-path";
import { cn } from "@/lib/utils";

const ARCH = "M0 150V64C0 40 18 26 34 18C42 14 48 8 50 0C52 8 58 14 66 18C82 26 100 40 100 64V150";
const line = { stroke: "currentColor", strokeWidth: 1, fill: "none", vectorEffect: "non-scaling-stroke" as const };

/** Золотая линия-чертёж с аркой в центре: дорисовывается от скролла из центра к краям */
export function Ornament({ className }: { className?: string }) {
  return (
    <DrawOnScroll offset={["start 0.95", "start 0.45"]} className={cn("flex items-center gap-4 text-brand", className)}>
      <svg aria-hidden="true" viewBox="0 0 100 2" preserveAspectRatio="none" className="h-2 min-w-0 flex-1 opacity-70">
        <path data-draw d="M100 1H0" {...line} />
      </svg>
      <svg aria-hidden="true" viewBox="-4 -4 108 158" className="h-14 w-10 shrink-0">
        <path data-draw d={ARCH} {...line} />
        <path data-draw d="M50 58L64 76L50 94L36 76Z" {...line} />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 100 2" preserveAspectRatio="none" className="h-2 min-w-0 flex-1 opacity-70">
        <path data-draw d="M0 1H100" {...line} />
      </svg>
    </DrawOnScroll>
  );
}
