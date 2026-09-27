import { cn } from "@/lib/utils";

/**
 * ProgressiveBlur (motion-primitives): плавное размытие к краю поверх фото.
 * Тяжёлый backdrop-filter: не больше 1-2 на экран.
 */
export function ProgressiveBlur({
  direction = "bottom",
  layers = 5,
  intensity = 0.6,
  className,
}: {
  direction?: "top" | "bottom";
  layers?: number;
  intensity?: number;
  className?: string;
}) {
  const angle = direction === "bottom" ? 180 : 0;
  const seg = 1 / (layers + 1);
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative", className)}>
      {Array.from({ length: layers }, (_, i) => {
        const stops = [i * seg, (i + 1) * seg, (i + 2) * seg, (i + 3) * seg].map((p) => `${(p * 100).toFixed(1)}%`);
        const mask = `linear-gradient(${angle}deg, transparent ${stops[0]}, black ${stops[1]}, black ${stops[2]}, transparent ${stops[3]})`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ maskImage: mask, WebkitMaskImage: mask, backdropFilter: `blur(${(i * intensity).toFixed(2)}px)` }}
          />
        );
      })}
    </div>
  );
}
