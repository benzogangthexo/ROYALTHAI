# ROYAL THAI: сайт сети салонов тайского и балийского массажа (Санкт-Петербург)

Концепция «Тишина, которую привезли»: ночной тропический сад, глубокий зелёный, сусальное золото, медленные анимации. Одна страница: hero с аркой тайского храма, которая раскрывается в полный экран, мастера, ритуалы, прайс, оценки, 27 салонов, сертификаты, отзывы, запись.

## Запуск
```bash
pnpm i
pnpm dev                     # http://localhost:3000
pnpm build && pnpm start     # продакшен
pnpm lint
```
Без доступа к npm (офлайн-песочница) pnpm пытается скачать версию из `packageManager`: запускайте команды с `npm_config_manage_package_manager_versions=false`.

Переменные окружения: `.env.example` (`NEXT_PUBLIC_SITE_URL` для canonical, OG и JSON-LD).

## Стек
Next.js 16 (App Router, TS strict), Tailwind v4 + shadcn/ui, motion (`motion/react` и скролл-анимации через `scroll()` на ScrollTimeline), motion-primitives, Lenis, zod, lucide-react, next/image (AVIF/WebP), next/font/local (Forum + Commissioner, кириллица).

## Структура
```
src/
  app/            layout (метаданные, шрифты), page (порядок секций), api/ (services, branches, slots, booking), icon.svg, opengraph-image.jpg
  content/        ВЕСЬ КОНТЕНТ: site.ts (телефон, почта, акции), services.ts (программы и цены), branches.ts (27 салонов),
                  reviews.ts (отзывы Яндекса), booking.ts (шаги и часы записи), photos.ts (фото и alt)
  components/
    site/         секции: header, hero (арка), manifest, rituals, prices, lotus, salons, gift, reviews, booking-section, footer, json-ld
    motion/       шаблон анимаций (Parallax, WordReveal, StickyStack, HoverImageList, ScrollRotate, GrowMedia, DrawOnScroll, GiantWordmark, Preloader)
    booking/      мастер записи (шаги, слоты, удержание слота, заявка)
    layout/, ui/  примитивы (Container, Section, Eyebrow, MobileCta, Button, FilterChips)
  lib/            api/ (zod-схемы, apiFetch с ретраями, ok/fail/latency), catalog.ts (общие фильтры прайса и салонов), booking.ts (расписание)
  assets/photos/  обработанные фото (см. PHOTOS.md)
```

## Где менять контент
- Цены и программы: `src/content/services.ts` (длительность и цена, метки «для неё / для него / для двоих / СПА»).
- Салоны: `src/content/branches.ts` (адрес, метро, часы, id организации на Яндекс Картах). У 8 салонов адреса в источниках не нашлось: впишите `address`, карточка и JSON-LD подхватят.
- Акции, телефон, почта, соцсети: `src/content/site.ts`.
- Отзывы: `src/content/reviews.ts`.
- Часы записи по салонам собираются из `branches.ts` автоматически (`src/content/booking.ts`).

## API (симуляция бэкенда)
| Роут | Что делает | Статусы |
|---|---|---|
| `GET /api/services?for=all\|her\|him\|two\|spa` | программы с ценами | 200, 422 |
| `GET /api/branches?district=all\|center\|north\|south\|east\|islands&q=` | салоны по части города и поиску | 200 (пустой список = empty), 422 |
| `GET /api/slots?date=&scope=` | свободное время салона | 200, 404, 422 |
| `POST /api/slots/hold` | удержание слота | 201, 409 |
| `POST /api/booking` | заявка (идемпотентный requestId) | 201, 409, 422 |

Задержка 300-800 мс. `?chaos=1` в адресе страницы включает случайные 503: видно состояния ошибки с кнопкой «Повторить».

## QA
`node scripts/qa.mjs http://localhost:3101 --shots=375,1440` (10 ширин: горизонтальный скролл, вылеты, тач-таргеты, обрезанный текст, битые картинки, ошибки консоли, CLS), флаги `--reduced`, `--nojs`, `--widths=320`.
