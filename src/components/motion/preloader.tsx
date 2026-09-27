import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Прелоадер-шторка со счётчиком 0-100: чистый CSS (@property), не держит LCP и TBT,
 * уезжает сам даже без JS. Один раз за сессию (класс pl-skip ставит скрипт в <head>).
 * Внутрь передай марку: SVG с классом preloader__draw на линиях (pathLength="1").
 */
export function Preloader({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("preloader", className)} aria-hidden="true">
      <div className="flex flex-col items-center gap-6">
        {children}
        <span className="preloader__count t-eyebrow tabular text-fg-muted" />
      </div>
    </div>
  );
}

/** Скрипт в <head>: js/rm/pl-skip до первой отрисовки (без мигания) */
export const headScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('rm');if(sessionStorage.getItem('pl-seen'))d.classList.add('pl-skip');else sessionStorage.setItem('pl-seen','1')}catch(e){}})();`;
