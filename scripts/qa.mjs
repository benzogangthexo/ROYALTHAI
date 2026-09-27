#!/usr/bin/env node
/**
 * QA на 10 ширинах: горизонтальный скролл, вылеты за край, тач-таргеты < 44, обрезанный текст,
 * битые картинки, ошибки консоли, CLS. Листы кадров в qa-out/.
 * node scripts/qa.mjs http://localhost:3101 [--shots=375,1440] [--frames=6] [--reduced] [--nojs]
 *   [--widths=320,375] [--path=/] [--from=0.4] (кадры начиная с доли высоты страницы)
 */
import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
const args = Object.fromEntries(
  process.argv.slice(3).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "1"];
  }),
);
const WIDTHS = args.widths ? args.widths.split(",").map(Number) : [320, 375, 390, 414, 768, 834, 1024, 1280, 1440, 1920];
const SHOTS = args.shots ? args.shots.split(",").map(Number) : [];
const FRAMES = Number(args.frames ?? 6);
const FROM = Number(args.from ?? 0);
const OUT = path.resolve("qa-out");
fs.mkdirSync(OUT, { recursive: true });

const heightFor = (w) => (w === 320 ? 568 : w < 500 ? 844 : w < 1100 ? 1024 : w >= 1900 ? 1080 : 900);
const exe = process.env.CHROME_PATH || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch({ executablePath: exe, args: ["--hide-scrollbars"] });
const mode = args.nojs ? "nojs" : args.reduced ? "reduced" : "normal";

const CHECKS = () => {
  const vw = window.innerWidth;
  const IGN = ".cursor, .hover-preview, .preloader, [data-qa-ignore], script, style, noscript, br";
  const sel = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls === "." ? "" : cls} "${txt}"`;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    if (cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)") return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const clippedX = (el) => {
    for (let p = el.parentElement; p && p !== document.documentElement && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") {
        const r = p.getBoundingClientRect();
        if (r.left >= -1 && r.right <= vw + 1) return true;
      }
    }
    return false;
  };
  const all = [...document.body.querySelectorAll("*")].filter((el) => !el.closest(IGN) && !(el instanceof SVGElement && !(el instanceof SVGSVGElement)));

  window.scrollTo(9999, window.scrollY);
  const hscroll = window.scrollX > 0 || document.documentElement.scrollWidth > vw + 1 ? 1 : 0;
  window.scrollTo(0, window.scrollY);

  const bleed = all
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 1 || r.left < -1) && visible(el) && getComputedStyle(el).position !== "fixed" && !clippedX(el);
    })
    .map(sel);

  const tap = [...document.querySelectorAll("a[href], button, [role=button], [role=radio], input:not([type=hidden]), select, textarea, summary, label[for]")]
    .filter((el) => !el.closest(IGN) && visible(el))
    .filter((el) => {
      if (el.tagName === "A" && getComputedStyle(el).display === "inline" && el.parentElement?.closest("p, li, dd, blockquote")) return false;
      const r = el.getBoundingClientRect();
      if (el.matches("input[type=checkbox], input[type=radio]")) return false;
      return Math.min(r.width, r.height) < 43.5;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return `${sel(el)} ${Math.round(r.width)}x${Math.round(r.height)}`;
    });

  const cut = all
    .filter((el) => {
      if (!el.childNodes.length || !visible(el)) return false;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!hasText) return false;
      const cs = getComputedStyle(el);
      if (cs.webkitLineClamp && cs.webkitLineClamp !== "none") return false;
      const clipX = cs.overflowX !== "visible";
      return (clipX && el.scrollWidth > el.clientWidth + 2) || cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth;
    })
    .map(sel);

  const heads = [...document.querySelectorAll("h1, h2, h3, .t-hero, .t-h1, .t-h2")]
    .filter((el) => visible(el) && !el.closest(IGN))
    .filter((el) => el.getBoundingClientRect().right > vw + 1 || el.scrollWidth > el.clientWidth + 2)
    .map(sel);

  const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src").slice(0, 80));
  const hidden = [...document.querySelectorAll("[data-motion]")].filter((el) => Number(getComputedStyle(el).opacity) < 0.05).length;
  return { hscroll, bleed, tap, cut: [...cut, ...heads], imgs, hiddenMotion: hidden, height: document.documentElement.scrollHeight };
};

const rows = [];
for (const w of WIDTHS) {
  const h = heightFor(w);
  const mobile = w <= 834;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: args.reduced ? "reduce" : "no-preference",
    javaScriptEnabled: !args.nojs,
  });
  await ctx.addInitScript(() => {
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* старый движок */
    }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url().slice(0, 100)}`));
  await page.goto(base + (args.path ?? "/"), { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(args.reduced ? 400 : 2400);

  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let y = 0; y <= total; y += Math.round(h * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);

  const res = await page.evaluate(CHECKS);
  const cls = mode === "nojs" ? 0 : await page.evaluate(() => window.__cls ?? 0);

  if (SHOTS.includes(w)) {
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const pics = [];
    for (let i = 0; i < FRAMES; i += 1) {
      const y = Math.round(max * (FROM + ((1 - FROM) * i) / Math.max(1, FRAMES - 1)));
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(900);
      pics.push((await page.screenshot({ type: "jpeg", quality: 70 })).toString("base64"));
    }
    const cw = Math.min(w, w > 700 ? 620 : w);
    const cols = Math.max(1, Math.min(FRAMES, Math.floor(1920 / (cw + 8))));
    const sheet = await ctx.newPage();
    await sheet.setViewportSize({ width: cols * (cw + 8), height: 400 });
    await sheet.setContent(
      `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px">` +
        pics.map((p) => `<img style="width:${cw}px;display:block" src="data:image/jpeg;base64,${p}">`).join("") +
        "</body>",
    );
    await sheet.waitForTimeout(300);
    const file = path.join(OUT, `sheet-${w}${mode === "normal" ? "" : "-" + mode}${FROM ? "-from" + FROM : ""}.jpg`);
    await sheet.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 72 });
    await sheet.close();
  }

  rows.push({ w, ...res, cls: Number(cls.toFixed(3)), console: [...new Set(errors)] });
  await ctx.close();
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
console.log(`QA ${base} mode=${mode}`);
console.log(pad("width", 7) + pad("hscroll", 9) + pad("bleed", 7) + pad("tap<44", 8) + pad("cut", 5) + pad("img", 5) + pad("console", 9) + pad("cls", 7) + (mode !== "normal" ? "hiddenMotion" : ""));
for (const r of rows) {
  console.log(
    pad(r.w, 7) + pad(r.hscroll, 9) + pad(r.bleed.length, 7) + pad(r.tap.length, 8) + pad(r.cut.length, 5) + pad(r.imgs.length, 5) + pad(r.console.length, 9) + pad(r.cls, 7) + (mode !== "normal" ? r.hiddenMotion : ""),
  );
}
const details = rows.filter((r) => r.hscroll || r.bleed.length || r.tap.length || r.cut.length || r.imgs.length || r.console.length || r.cls > 0.05);
for (const r of details) {
  console.log(`\n--- ${r.w}px`);
  if (r.bleed.length) console.log("bleed:", r.bleed.slice(0, 6).join(" | "));
  if (r.tap.length) console.log("tap<44:", r.tap.slice(0, 6).join(" | "));
  if (r.cut.length) console.log("cut:", r.cut.slice(0, 6).join(" | "));
  if (r.imgs.length) console.log("img:", r.imgs.slice(0, 4).join(" | "));
  if (r.console.length) console.log("console:", r.console.slice(0, 4).join(" | "));
}
fs.writeFileSync(path.join(OUT, `report-${mode}.json`), JSON.stringify(rows, null, 1));
