"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { MagneticButton } from "@/components/motion/magnetic-button";
import { MaskReveal } from "@/components/motion/mask-reveal";
import { useScrollAnim, type ScrollOffset } from "@/components/motion/use-scroll-anim";
import { Button } from "@/components/ui/button";
import { photos } from "@/content/photos";
import { minPrice, serviceById } from "@/content/services";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";

/* Арка тайского храма: острый верх (лотосовый бутон), 100x150 */
const ARCH = "M0 150V64C0 40 18 26 34 18C42 14 48 8 50 0C52 8 58 14 66 18C82 26 100 40 100 64V150Z";
const INNER = "M4.5 150V65.4C4.5 43.4 21 30.4 36.3 22.8C43.6 19.1 48 14.2 50 8.2C52 14.2 56.4 19.1 63.7 22.8C79 30.4 95.5 43.4 95.5 65.4V150";
const FRAME = `M-400 -400H500V550H-400Z${ARCH}`;
const OPEN: ScrollOffset = ["start end", "end end"];
const d = (s: string) => ({ "--d": s }) as CSSProperties;

/**
 * Первый экран-сцена. Паттерн 1, три плана с разной скоростью:
 * дальний: фото (медленный зум), средний: рамка с вырезом-аркой (раскрывается transform-ом, фото не мылится)
 * и текст, ближний: золотые линии-чертежи (уезжают быстрее всех). После раскрытия поверх фото
 * проезжает панель манифеста (children).
 */
export function Hero({ children }: { children?: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<SVGSVGElement>(null);
  const edge = useRef<SVGGElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);
  const thai = serviceById("thai");

  useScrollAnim(frame, { transform: ["scale(1)", "scale(1.7)", "scale(10)"] }, { target: track, offset: OPEN, times: [0, 0.4, 1] });
  useScrollAnim(edge, { opacity: [1, 0, 0] }, { target: track, offset: OPEN, times: [0, 0.3, 1] });
  useScrollAnim(photo, { transform: ["scale(1.14)", "scale(1)"] }, { target: track, offset: OPEN });
  useScrollAnim(
    copy,
    { opacity: [1, 0, 0], transform: ["translate3d(0,0,0)", "translate3d(0,-9vh,0)", "translate3d(0,-9vh,0)"] },
    { target: track, offset: OPEN, times: [0, 0.34, 1] },
  );
  useScrollAnim(
    near,
    { opacity: [1, 0, 0], transform: ["translate3d(0,0,0)", "translate3d(0,-32vh,0)", "translate3d(0,-32vh,0)"] },
    { target: track, offset: OPEN, times: [0, 0.45, 1] },
  );

  return (
    <div className="relative isolate">
      <div id="hero" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-svh" />
      <div className="sticky top-0 h-svh overflow-clip bg-bg">
        <div ref={photo} data-motion className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.14)" }}>
          <Image
            src={photos.hero.src}
            alt={photos.hero.alt}
            fill
            loading="eager"
            quality={75}
            sizes="(max-aspect-ratio: 3/2) 125vh, 100vw"
            placeholder="blur"
            className="object-cover object-[50%_60%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgb(7_26_19/0.55))]" />
        </div>

        <div className="safe-x relative z-10 mx-auto flex h-full max-w-[var(--container)] flex-col pt-[var(--header-h)] md:grid md:grid-cols-12 md:gap-[var(--col-gap)]">
          <div ref={copy} data-motion className="relative z-20 pt-[clamp(0.75rem,4svh,3rem)] md:col-span-7 md:self-center md:pt-0">
            <p className="t-eyebrow fade-immediate flex items-center gap-3 text-brand" style={d("0.05s")}>
              <span aria-hidden="true" className="h-px w-8 bg-brand" />
              Тишина, которую привезли
            </p>
            <MaskReveal
              as="h1"
              immediate
              className="t-hero mt-5 md:mt-7"
              lines={["Тайский массаж", "руками мастеров", "из Таиланда", "и Индонезии"]}
            />
            <p className="t-lead fade-immediate mt-5 max-w-[34ch] text-fg-muted md:mt-7" style={d("0.5s")}>
              Традиционный тайский от{" "}
              <span className="tabular whitespace-nowrap text-fg">{formatPrice(thai ? minPrice(thai) : 4890)} ₽</span> за 60
              минут. {site.salonsInCity}&nbsp;салонов в&nbsp;Петербурге, каждый день с&nbsp;10:00.
            </p>
            <div className="fade-immediate mt-6 flex flex-wrap items-center gap-3 md:mt-9" style={d("0.65s")}>
              <MagneticButton asChild size="lg">
                <a href="#booking">Записаться</a>
              </MagneticButton>
              <Button asChild variant="ghost" size="lg" className="px-5">
                <a href="#prices">Все цены</a>
              </Button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-end justify-center pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 md:col-span-5 md:items-center md:pb-0 md:pt-0">
            <div className="relative aspect-[2/3] h-full max-h-[64svh] md:h-auto md:max-h-[78svh] md:w-full">
              <svg
                ref={frame}
                data-motion
                viewBox="0 0 100 150"
                aria-hidden="true"
                className="absolute inset-0 size-full overflow-visible will-change-transform [transform-origin:50%_45%]"
              >
                <path d={FRAME} fillRule="evenodd" className="fill-bg" />
                <g ref={edge} data-motion className="text-brand">
                  <path
                    d={ARCH}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    className="arch-draw"
                  />
                  <path
                    d={INNER}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.45}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    className="arch-draw arch-draw--late"
                  />
                </g>
              </svg>
              <div ref={near} data-motion aria-hidden="true" className="pointer-events-none absolute -inset-x-7 -bottom-3 top-[12%] text-brand">
                <span className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(to_bottom,transparent,currentColor_30%,currentColor_70%,transparent)] opacity-60" />
                <span className="absolute inset-y-0 right-0 w-px bg-[linear-gradient(to_bottom,transparent,currentColor_30%,currentColor_70%,transparent)] opacity-60" />
                <span className="absolute left-0 top-[30%] size-2 -translate-x-1/2 rotate-45 border border-current bg-bg" />
                <span className="absolute right-0 top-[30%] size-2 translate-x-1/2 rotate-45 border border-current bg-bg" />
                <span className="absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(to_right,transparent,currentColor_20%,currentColor_80%,transparent)] opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={track} aria-hidden="true" className="hero-track h-[105svh]" />
      {children}
    </div>
  );
}
