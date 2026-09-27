#!/usr/bin/env python3
"""royalthai.ru: все оригиналы из /upload/ (lazy-load, picture/source, слайдеры) + контакт-листы."""
import io
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps
from playwright.sync_api import sync_playwright

OUT = Path("out") / "royalthai-site"
RAW, META, SHEETS = OUT / "raw", OUT / "meta", OUT / "sheets"
for p in (RAW, META, SHEETS):
    p.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
BASE = "https://royalthai.ru/"
S = requests.Session()
S.headers.update({"User-Agent": UA, "Referer": BASE})
IMG_RE = re.compile(r"""((?:https?://(?:www\.)?royalthai\.ru)?/upload/[^"'()\s,<>]+?\.(?:jpe?g|png|webp))""", re.I)
SEEDS = ["/", "/corporate/", "/about/", "/masters/", "/certificates/", "/services/", "/massazh/", "/promo/",
         "/services/spa-for-two/", "/services/programmy-dlya-dvoikh/", "/services/traditsionnyy-tayskiy-massazh/",
         "/services/oil-massazhi-i-spa-programmy/", "/contacts/", "/abonements/", "/certificates/services/"]


def log(*a):
    print(*a, flush=True)


def original(u):
    m = re.search(r"/upload/resize_cache/(.+?)/\d+_\d+_\d+/([^/]+)$", u)
    return f"/upload/{m.group(1)}/{m.group(2)}" if m else u


urls, pages = {}, {}
with sync_playwright() as pw:
    br = pw.chromium.launch()
    page = br.new_context(user_agent=UA, locale="ru-RU", viewport={"width": 1600, "height": 1000}).new_page()
    queue, done = [urljoin(BASE, s) for s in SEEDS], set()
    while queue and len(done) < 110:
        u = queue.pop(0).split("#")[0]
        if u in done:
            continue
        done.add(u)
        try:
            page.goto(u, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(1500)
            h = page.evaluate("() => document.documentElement.scrollHeight")
            for y in range(0, h, 700):
                page.evaluate(f"window.scrollTo(0,{y})")
                page.wait_for_timeout(140)
            page.wait_for_timeout(800)
            html = page.content()
            extra = page.evaluate("""() => { const o = [];
              document.querySelectorAll('img,source').forEach(e => { ['src','data-src','srcset','data-srcset','data-lazy','data-bg'].forEach(a => { const v = e.getAttribute(a); if (v) o.push(v); }); if (e.currentSrc) o.push(e.currentSrc); });
              document.querySelectorAll('[style*=url],[data-bg],[data-background]').forEach(e => o.push(e.getAttribute('style') || '', e.getAttribute('data-bg') || '', e.getAttribute('data-background') || ''));
              return o.join(' '); }""")
            found = set(IMG_RE.findall(html + " " + extra))
            for f in found:
                full = urljoin(BASE, original(f.split(" ")[0]))
                urls.setdefault(full, urlparse(u).path)
            pages[u] = {"title": page.title(), "text": page.evaluate("() => document.body.innerText")[:15000], "imgs": len(found)}
            log(len(done), u, "imgs", len(found))
            for link in page.evaluate("() => [...document.querySelectorAll('a[href]')].map(a => a.href)"):
                p = urlparse(link)
                if p.netloc.endswith("royalthai.ru") and not p.query and not re.search(r"\.(pdf|jpe?g|png|zip)$", p.path):
                    if link.split("#")[0] not in done and len(queue) < 400:
                        queue.append(link.split("#")[0])
        except Exception as e:  # noqa: BLE001
            log("fail", u, e)
    br.close()

log("image urls:", len(urls))
index, hashes = [], []


def dhash(im):
    g = im.convert("L").resize((17, 16))
    px = list(g.getdata())
    v = 0
    for r in range(16):
        for c in range(16):
            v = (v << 1) | (px[r * 17 + c] > px[r * 17 + c + 1])
    return v


for u, where in urls.items():
    try:
        r = S.get(u, timeout=40)
        if r.status_code != 200 or len(r.content) < 15000:
            continue
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert("RGB")
    except Exception:  # noqa: BLE001
        continue
    ow, oh = im.size
    if min(ow, oh) < 700:
        continue
    h = dhash(im)
    dup = next((i for i, x in enumerate(hashes) if bin(h ^ x).count("1") <= 12), None)
    if dup is not None:
        if ow * oh <= index[dup]["ow"] * index[dup]["oh"]:
            continue
        pid = index[dup]["id"]
        index[dup].update({"url": u, "ow": ow, "oh": oh, "src": f"site:{where}"})
        hashes[dup] = h
    else:
        pid = f"p{len(index) + 1:03d}"
        index.append({"id": pid, "src": f"site:{where}", "url": u, "ow": ow, "oh": oh})
        hashes.append(h)
    im.thumbnail((3200, 3200), Image.LANCZOS)
    im.save(RAW / f"{pid}.jpg", "JPEG", quality=92, optimize=True, progressive=True)
log("saved", len(index))

try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 15)
except OSError:
    font = ImageFont.load_default()
per, cols, tw, th, lab = 30, 6, 256, 192, 22
for si in range(0, len(index), per):
    chunk = index[si:si + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * (th + lab)), (24, 24, 24))
    dr = ImageDraw.Draw(sheet)
    for k, it in enumerate(chunk):
        im = Image.open(RAW / f"{it['id']}.jpg")
        im.thumbnail((tw - 6, th - 6))
        x, y = (k % cols) * tw, (k // cols) * (th + lab)
        sheet.paste(im, (x + (tw - im.width) // 2, y + (th - im.height) // 2))
        small = max(it["ow"], it["oh"]) < 1000
        dr.text((x + 5, y + th + 2), f"{it['id']} {it['ow']}x{it['oh']}", fill=(255, 90, 90) if small else (235, 235, 235), font=font)
    sheet.save(SHEETS / f"site_sheet_{si // per + 1:02d}.jpg", quality=82)
(META / "site_index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
(META / "site_pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1), encoding="utf-8")
log("DONE", len(index))
