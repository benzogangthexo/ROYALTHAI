# Шаблон: API компонентов (читай вместо исходников)

Всё уже собрано и проверено (build + lint + QA на 10 ширинах чистые). Исходники открывай, только если меняешь поведение.

## Motion (`src/components/motion/`)
Все анимации: SSR и без JS контент видим; при `prefers-reduced-motion` статично. Скролл-анимации идут через `scroll()+animate()` из `motion` (нативный ScrollTimeline, композитор), transform/opacity.
- `SmoothScroll` (в layout): Lenis + перехват `a[href^="#"]`. `scrollToTarget("booking")`, `setScrollLocked(bool)`.
- `Cursor` (в layout): кольцо с lerp. Атрибуты на любом элементе: `data-cursor="view|link|hide"` + `data-cursor-label="Смотреть"`. Цвета: CSS `--cursor-color`, `--cursor-label-bg`, `--cursor-label-fg`.
- `Magnetic` (`strength`, `reach`) и `MagneticButton` (= Magnetic + Button, все пропсы Button, `wrapperClassName`). Ссылка: `<MagneticButton asChild><a href="#booking">…</a></MagneticButton>`.
- `MaskReveal lines={[...]} as="h1" immediate` : строки из-под маски. `immediate` = CSS на загрузке (hero; стартует после прелоадера). Без immediate: при входе в экран. Строки задаёшь сам (ноль висячих слов).
- CSS-классы для hero без JS-ожидания: `.fade-immediate` (+ `style={{"--d":"0.5s"}}` задержка).
- `WordReveal text="…" as="p" className accent={[2,5]}` : паттерн 2 (по словам, opacity+blur от скролла). Не в первом экране.
- `Parallax speed={0.3}` : паттерн 1. speed > 0 дальний план (отстаёт), < 0 ближний (обгоняет). Диапазон -0.5..0.5. Слои с отрицательным z-index: у секции ставь `isolate`.
- `ScrollRotate from={-40} to={140} scaleFrom scaleTo offset` : паттерн 3.
- `StickyStack top="…" step={14} shrink={0.05}` : паттерн 5, дети = карточки. Карточка обязана влезать в `100svh - top` (320x568!).
- `GrowMedia from={0.7} className="aspect-[16/9]"` : фото растёт от скролла (внутри `<Image fill>`).
- `HoverImageList items=[{id,title,meta,aside,image,alt,onSelect|href,cursorLabel}] previewClassName` : паттерн 4, превью плывёт за курсором (spring + наклон от скорости); на таче миниатюры в строках.
- `Reveal delay y` : мягкое появление ниже сгиба.
- `Preloader` (+ `headScript` в layout): шторка и счётчик на чистом CSS, раз за сессию. Внутрь SVG-марка, линии с `className="preloader__draw" pathLength={1}`. Цвета: `--preloader-bg`, `--preloader-fg`. Тайминги в globals.css (`pl-lift`, `pl-count`, `--mask-delay`).
- `ScrollMarquee items direction={1|-1} distance={30}` : бегущая строка только от скролла (не автоплей).
- `Counter value={4.9} decimals={1}` : финальное число в HTML, считает, если было ниже сгиба.
- `DrawOnScroll offset` : обёртка SVG; линии с `data-draw` дорисовываются от скролла.
- `GiantWordmark text="FRY" className letterClassName` : во всю ширину (JS подгоняет кегль), буквы выезжают от скролла, aria-hidden.

## Layout (`src/components/layout/`)
`Container` (max-w + safe-area поля), `Section labelledBy id` (вертикальный ритм `--section-y`), `Grid` (4/6/12), `Card`, `Eyebrow index="01"`, `Rule`, `MobileCta label phone heroId targetId` (нижняя панель на телефоне после hero, прячется у #booking; у футера оставь `pb-[calc(var(--mobile-cta-h)+env(safe-area-inset-bottom))] md:pb-…`).

## UI (`src/components/ui/`)
`Button` (cva: variant primary|outline|ghost|paper, size sm|md|lg|icon, `asChild`), `Skeleton`, `Dialog/DialogContent/DialogTitle/...` (Radix, Lenis на паузе), `Toaster` (sonner, в layout), `FilterChips options value onChange label` (адаптация 21st.dev Animated Background: подложка активного чипа плывёт, aria-pressed). `src/components/motion-primitives/progressive-blur.tsx` (ProgressiveBlur).

## Данные и бэкенд
- `src/lib/api/schemas.ts` (zod DTO), `client.ts` (`apiFetch(url,{schema,method,body,retries,signal})`, `ApiError`), `http.ts` (`ok/fail/invalid/latency/flaky`; `?chaos=1` в адресе страницы включает сбои для демонстрации error-состояний), `store.ts` (память процесса).
- `src/hooks/use-resource.ts`: `useResource(key|null, fetcher, {initial:{key,data}, isEmpty})` -> `{status: idle|loading|success|empty|error, data, error, retry, mutate}`. `initial` = данные с сервера: первый экран без запроса и без скелетона.
- Свои роуты (меню, услуги, салоны) делай по образцу `src/app/api/slots/route.ts`: zod-парсинг query, `await latency()`, `flaky(req)`, корректные статусы (200/404/422/503), общий фильтр в `src/lib/` (им же пользуется клиент для скелетона той же геометрии).
- Запись: `src/components/booking/booking-wizard.tsx` (`<BookingWizard successNote className/>`), конфиг `src/content/booking.ts` (тип `BookingConfig` в `src/lib/booking.ts`: `week` 0=вс..6=сб, close <= open = после полуночи, `scopeStep` + `scopes` = свои часы у салона/филиала, `steps` с опциями `{id,label,note,price,group,badge}` и `groups`). Предвыбор из любой кнопки: `presetBooking(stepId, optionId)` из `src/components/booking/preset.ts` (клиентский onClick). Роуты `/api/slots`, `/api/slots/hold` (409 если занято), `/api/booking` (201/422/409, идемпотентный requestId).

## Стили (`src/app/globals.css`)
Токены в `:root` (меняешь значения, имена не трогай): `--bg --bg-2 --surface --surface-2 --line --line-strong --fg --fg-muted --brand --brand-ink --brand-2 --brand-3 --paper --paper-ink --danger --ok --radius`, шкала `--fs-*`, `--gutter`, `--section-y`. Tailwind-цвета: `bg-bg text-fg text-fg-muted bg-surface border-line bg-brand text-brand-ink bg-paper text-paper-ink …`. Шрифты: `font-display` (`--ff-display`), `font-sans` (`--ff-body`), `font-hand` (`--ff-hand`). Утилиты: `t-hero t-h1 t-h2 t-h3 t-lead t-eyebrow tabular safe-x`. Классы: `.grain` (на body), `.field` (поля форм), `.skeleton`, `.mask-line`, `.fade-immediate`.
