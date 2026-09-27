/*
 * Загрузчик картинок для статической сборки (GitHub Pages): сервера оптимизации нет,
 * поэтому scripts/build-pages.mjs заранее нарезает каждое фото в WebP под все ширины
 * (<файл>.w<ширина>.webp рядом с оригиналом). Список ширин совпадает с next.config.ts.
 */
export default function pagesImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.includes("/_next/static/media/") || !/\.(jpe?g|png)$/i.test(src)) return src;
  return src.replace(/\.(jpe?g|png)$/i, `.w${width}.webp`);
}
