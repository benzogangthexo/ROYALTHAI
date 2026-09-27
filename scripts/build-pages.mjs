#!/usr/bin/env node
/**
 * Статическая сборка для GitHub Pages: pnpm build:pages
 * 1) API-роуты на время сборки убираются из src/app (их обработчики работают в браузере через src/lib/api/local.ts);
 * 2) next build с PAGES_BASE=/<репозиторий> (output: export, basePath);
 * 3) каждое фото нарезается в WebP под все ширины (загрузчик src/lib/image-loader.ts);
 * 4) результат копируется в docs/ (+ .nojekyll, иначе Pages не отдаст папку _next).
 * В настройках репозитория: Settings -> Pages -> Deploy from a branch -> <ветка> / docs.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const remote = execSync("git remote get-url origin").toString().trim();
const [, owner, repo] = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/) ?? [];
if (!owner || !repo) throw new Error(`Не понял адрес репозитория: ${remote}`);
const base = `/${repo}`;
const site = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${owner.toLowerCase()}.github.io${base}`;
const widths = [64, 96, 128, 256, 384, 360, 414, 640, 768, 1024, 1280, 1536, 1920];

const api = path.resolve("src/app/api");
const stash = path.resolve(".pages-api-stash");
if (fs.existsSync(stash)) throw new Error("Осталась папка .pages-api-stash: верните её в src/app/api");
if (fs.existsSync(api)) fs.renameSync(api, stash);
try {
  execSync("node node_modules/next/dist/bin/next build", {
    stdio: "inherit",
    env: { ...process.env, PAGES_BASE: base, NEXT_PUBLIC_SITE_URL: site },
  });
} finally {
  if (fs.existsSync(stash)) fs.renameSync(stash, api);
}

const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");
const media = path.resolve("out/_next/static/media");
let made = 0;
for (const file of fs.readdirSync(media).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const src = path.join(media, file);
  const { width: w0 } = await sharp(src).metadata();
  for (const w of widths) {
    const out = src.replace(/\.(jpe?g|png)$/i, `.w${w}.webp`);
    await sharp(src).resize({ width: Math.min(w, w0), withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(out);
    made += 1;
  }
}

fs.rmSync("docs", { recursive: true, force: true });
fs.cpSync("out", "docs", { recursive: true });
fs.writeFileSync("docs/.nojekyll", "");
console.log(`GitHub Pages: docs/ готова (${made} WebP), адрес ${site}/`);
