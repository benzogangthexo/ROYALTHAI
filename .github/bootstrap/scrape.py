#!/usr/bin/env python3
"""Collect venue photos, reviews and facts (runs on GitHub Actions, output is a release asset)."""
import gzip
import io
import json
import re
import sys
import time
import traceback
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps
from playwright.sync_api import sync_playwright

VENUE = sys.argv[1]
OUT = Path("out") / VENUE
RAW, META, SHEETS = OUT / "raw", OUT / "meta", OUT / "sheets"
for p in (RAW, META, SHEETS):
    p.mkdir(parents=True, exist_ok=True)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36")
S = requests.Session()
S.headers.update({"User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.5"})
LOGF = open(META / "log.txt", "a", encoding="utf-8")
T0 = time.time()


def log(*a):
    msg = f"[{time.time() - T0:6.0f}s] " + " ".join(str(x) for x in a)
    print(msg, flush=True)
    LOGF.write(msg + "\n")
    LOGF.flush()


CFG = {
    "royalthai": {
        "yandex": ["173949800191"],
        "ysearch": ("https://yandex.ru/maps/2/saint-petersburg/search/Royal%20Thai/", "royal thai", 10),
        "site": ("https://royalthai.ru/", ["/", "/massazh/", "/services/", "/spa/", "/certificates/",
                                           "/abonements/", "/contacts/", "/about/", "/corporate/", "/masters/"]),
        "yphotos": 45,
    },
    "fry": {
        "yandex": ["85009102432"],
        "gis": [("novosibirsk", "70000001032413907")],
        "vk": ["public56257981"],
        "extra": ["https://novosibirsk.flamp.ru/firm/fry_street_food_pub-70000001032413907"],
        "yphotos": 120,
    },
    "iren": {
        "yandex": ["209039784813", "1264153834"],
        "vk": ["vipiren_ru", "public56257981"],
        "yc": ["339238", "84468"],
        "yphotos": 120,
    },
    "izba": {
        "yandex": ["57047655220"],
        "gis": [("ulyanovsk", "70000001112681557")],
        "vk": ["club235279739"],
        "extra": ["https://zoon.ru/ulyanovsk/restaurants/kafe_krivaya_izba/",
                  "https://zoon.ru/ulyanovsk/restaurants/kafe_krivaya_izba/photo/"],
        "yphotos": 120,
    },
}[VENUE]

FACTS = {}
INDEX = []
SEEN = set()


# ---------- images ----------
def dhash(im):
    g = im.convert("L").resize((17, 16), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for r in range(16):
        for c in range(16):
            bits = (bits << 1) | (px[r * 17 + c] > px[r * 17 + c + 1])
    return bits


def save_img(url, src, prefix, album=None, min_side=500):
    key = url.split("?")[0] if "userapi.com" not in url else url
    if key in SEEN:
        return None
    SEEN.add(key)
    try:
        r = S.get(url, timeout=40)
        if r.status_code != 200 or len(r.content) < 6000:
            return None
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert("RGB")
    except Exception as e:  # noqa: BLE001
        log("img fail", url[:120], e)
        return None
    ow, oh = im.size
    if min(ow, oh) < min_side:
        return None
    h = dhash(im)
    for it in INDEX:
        if bin(h ^ it["hash"]).count("1") <= 14:
            if ow * oh > it["ow"] * it["oh"]:
                big = im.copy()
                big.thumbnail((3200, 3200), Image.LANCZOS)
                big.save(RAW / f"{it['id']}.jpg", "JPEG", quality=92, optimize=True, progressive=True)
                it.update({"url": url, "src": src, "ow": ow, "oh": oh, "hash": h, "album": album or it.get("album")})
            return it["id"]
    n = sum(1 for it in INDEX if it["id"][0] == prefix) + 1
    pid = f"{prefix}{n:03d}"
    im.thumbnail((3200, 3200), Image.LANCZOS)
    im.save(RAW / f"{pid}.jpg", "JPEG", quality=92, optimize=True, progressive=True)
    INDEX.append({"id": pid, "src": src, "url": url, "ow": ow, "oh": oh, "album": album, "hash": h})
    return pid


def sheets():
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 15)
    except OSError:
        font = ImageFont.load_default()
    items = sorted(INDEX, key=lambda x: (x["id"][0], int(x["id"][1:])))
    per, cols, tw, th, lab = 30, 6, 256, 192, 22
    for si in range(0, len(items), per):
        chunk = items[si:si + per]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * (th + lab)), (24, 24, 24))
        dr = ImageDraw.Draw(sheet)
        for k, it in enumerate(chunk):
            im = Image.open(RAW / f"{it['id']}.jpg")
            im.thumbnail((tw - 6, th - 6))
            x, y = (k % cols) * tw, (k // cols) * (th + lab)
            sheet.paste(im, (x + (tw - im.width) // 2, y + (th - im.height) // 2))
            small = max(it["ow"], it["oh"]) < 1000
            tag = f"{it['id']} {it['ow']}x{it['oh']}" + (f" {it['album']}"[:14] if it.get("album") else "")
            dr.text((x + 5, y + th + 2), tag, fill=(255, 90, 90) if small else (235, 235, 235), font=font)
        sheet.save(SHEETS / f"sheet_{si // per + 1:02d}.jpg", quality=82)


# ---------- json helpers ----------
def walk(o):
    if isinstance(o, dict):
        yield o
        for v in o.values():
            yield from walk(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk(v)


def strings(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, dict):
        for v in o.values():
            yield from strings(v)
    elif isinstance(o, list):
        for v in o:
            yield from strings(v)


def reviews_from(obj):
    out, ids = [], set()
    for d in walk(obj):
        if isinstance(d.get("text"), str) and len(d["text"]) > 20 and "rating" in d and (
                "author" in d or "user" in d):
            a = d.get("author") or d.get("user") or {}
            rid = d.get("reviewId") or d.get("id") or d["text"][:40]
            if rid in ids:
                continue
            ids.add(rid)
            out.append({
                "author": a.get("name") if isinstance(a, dict) else str(a),
                "rating": d.get("rating"),
                "date": d.get("updatedTime") or d.get("date_created") or d.get("date_edited"),
                "text": d["text"],
                "reply": (d.get("businessComment") or {}).get("text") if isinstance(d.get("businessComment"), dict) else None,
            })
    return out


def dump_raw(name, data):
    with gzip.open(META / f"{name}.json.gz", "wt", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


SCROLL_JS = """() => {
  const els = [...document.querySelectorAll('div,section,ul,main,aside')].filter(e => {
    const s = getComputedStyle(e);
    return (s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 40;
  });
  els.forEach(e => { e.scrollTop = e.scrollHeight; });
  window.scrollTo(0, document.body.scrollHeight);
  return els.length;
}"""


def pw_open(page, url, json_pat, img_pat=None, rounds=20, wait=1300):
    caught, imgs = [], set()

    def on_resp(resp):
        u = resp.url
        try:
            if any(p in u for p in json_pat) and "json" in (resp.headers.get("content-type") or ""):
                caught.append({"url": u, "json": resp.json()})
        except Exception:  # noqa: BLE001
            pass

    def on_req(req):
        if img_pat and img_pat in req.url:
            imgs.add(req.url)

    page.on("response", on_resp)
    page.on("request", on_req)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(4500)
        if "captcha" in page.url or page.locator("text=Я не робот").count() > 0:
            log("CAPTCHA at", url)
            FACTS.setdefault("_blocked", []).append(url)
        for _ in range(rounds):
            page.evaluate(SCROLL_JS)
            page.wait_for_timeout(wait)
    except Exception as e:  # noqa: BLE001
        log("open fail", url, e)
    page.remove_listener("response", on_resp)
    page.remove_listener("request", on_req)
    return caught, imgs


def page_text(page):
    try:
        return page.evaluate("() => document.body ? document.body.innerText : ''")[:30000]
    except Exception:  # noqa: BLE001
        return ""


# ---------- yandex ----------
YIMG = re.compile(r"https://avatars\.mds\.yandex\.net/get-altay/\d+/[A-Za-z0-9_\-]+")


def yandex_state(page):
    try:
        raw = page.evaluate("() => { const s = document.querySelector('script.state-view'); return s ? s.textContent : null; }")
        return json.loads(raw) if raw else None
    except Exception:  # noqa: BLE001
        return None


def yandex_org(page, oid, max_photos):
    key = f"yandex_{oid}"
    info = {"id": oid}
    _, _ = pw_open(page, f"https://yandex.ru/maps/org/{oid}/", [], rounds=2)
    st = yandex_state(page)
    info["text_main"] = page_text(page)[:8000]
    if st:
        dump_raw(f"{key}_state", st)
        for d in walk(st):
            if "ratingData" in d and ("title" in d or "shortTitle" in d):
                keep = {k: d.get(k) for k in ("title", "shortTitle", "ratingData", "address", "fullAddress",
                                               "workingTimeText", "workingTime", "phones", "urls", "socialLinks",
                                               "features", "categories", "coordinates", "seoname", "description")
                        if k in d}
                info["biz"] = keep
                break
    caught, _ = pw_open(page, f"https://yandex.ru/maps/org/{oid}/reviews/", ["fetchReviews", "reviews"], rounds=18)
    st = yandex_state(page)
    revs = reviews_from([c["json"] for c in caught] + ([st] if st else []))
    info["reviews"] = revs
    info["text_reviews"] = page_text(page)[:6000]
    log(key, "reviews", len(revs))
    caught, imgs = pw_open(page, f"https://yandex.ru/maps/org/{oid}/gallery/", ["fetchPhotos", "photos"],
                           img_pat="get-altay", rounds=30)
    st = yandex_state(page)
    bases = []
    for s_ in list(strings([c["json"] for c in caught] + ([st] if st else []))) + list(imgs):
        for m in YIMG.findall(s_):
            if m not in bases:
                bases.append(m)
    log(key, "photo urls", len(bases))
    got = 0
    for b in bases:
        if got >= max_photos:
            break
        for size in ("orig", "XXXL", "XXL", "XL"):
            if save_img(f"{b}/{size}", f"yandex:{oid}", "y"):
                got += 1
                break
    info["photos_saved"] = got
    FACTS[key] = info


def yandex_search(page, url, match, limit):
    caught, _ = pw_open(page, url, ["search"], rounds=6)
    st = yandex_state(page)
    ids = []
    for d in walk([st] + [c["json"] for c in caught]):
        t = str(d.get("title") or d.get("name") or "")
        i = d.get("id") or d.get("businessId")
        if match in t.lower() and isinstance(i, (str, int)) and str(i).isdigit() and len(str(i)) > 6:
            if str(i) not in ids:
                ids.append(str(i))
    log("search ids", ids)
    FACTS["yandex_search_ids"] = ids
    return ids[:limit]


# ---------- 2gis ----------
GIMG = re.compile(r"https://i\d+\.photo\.2gis\.com/[^\"'\s)]+")


def gis_org(page, city, fid):
    key = f"2gis_{fid}"
    info = {"id": fid}
    caught, imgs = pw_open(page, f"https://2gis.ru/{city}/firm/{fid}/tab/photos",
                           ["photo", "catalog", "items", "byid"], img_pat="photo.2gis.com", rounds=30)
    dump_raw(f"{key}_photos_api", [c for c in caught][:40])
    info["text_main"] = page_text(page)[:6000]
    album_of = {}
    for d in walk([c["json"] for c in caught]):
        alb = None
        for k, v in d.items():
            if "album" in k.lower() and isinstance(v, str):
                alb = v
        for s_ in strings(d):
            for m in GIMG.findall(s_):
                if alb and m not in album_of:
                    album_of[m] = alb
    urls = []
    for s_ in list(strings([c["json"] for c in caught])) + list(imgs):
        for m in GIMG.findall(s_):
            m = m.split("?")[0]
            if m not in urls:
                urls.append(m)
    log(key, "photo urls", len(urls))
    got = 0
    for u in urls:
        alb = album_of.get(u)
        full = re.sub(r"_\d*x\d*(?=\.\w+$)", "", u)
        full = re.sub(r"/\d+x\d+/", "/", full)
        if save_img(full, f"2gis:{fid}", "g", alb) or save_img(u, f"2gis:{fid}", "g", alb):
            got += 1
    info["photos_saved"] = got
    caught, _ = pw_open(page, f"https://2gis.ru/{city}/firm/{fid}/tab/reviews", ["reviews"], rounds=15)
    dump_raw(f"{key}_reviews_api", [c for c in caught][:20])
    info["reviews"] = reviews_from([c["json"] for c in caught])
    for d in walk([c["json"] for c in caught]):
        if "branch_rating" in d or "branch_reviews_count" in d:
            info["meta"] = {k: d.get(k) for k in ("branch_rating", "branch_reviews_count", "total_count")}
            break
    info["text_reviews"] = page_text(page)[:6000]
    caught, _ = pw_open(page, f"https://2gis.ru/{city}/firm/{fid}/tab/info", ["items", "byid", "catalog"], rounds=2)
    dump_raw(f"{key}_info_api", [c for c in caught][:10])
    info["text_info"] = page_text(page)[:8000]
    log(key, "reviews", len(info["reviews"]))
    FACTS[key] = info


# ---------- generic pages ----------
def collect_dom_images(page):
    try:
        return page.evaluate("""() => {
          const out = new Set();
          document.querySelectorAll('img').forEach(i => {
            if (i.currentSrc) out.add(i.currentSrc);
            ['src','data-src','data-lazy','data-original'].forEach(a => { const v = i.getAttribute(a); if (v) out.add(new URL(v, location.href).href); });
            const ss = i.getAttribute('srcset') || i.getAttribute('data-srcset');
            if (ss) ss.split(',').forEach(p => { const u = p.trim().split(' ')[0]; if (u) out.add(new URL(u, location.href).href); });
          });
          document.querySelectorAll('*').forEach(e => {
            const b = getComputedStyle(e).backgroundImage;
            if (b && b.startsWith('url(')) { const m = b.match(/url\\(["']?([^"')]+)/); if (m) out.add(new URL(m[1], location.href).href); }
          });
          return [...out];
        }""")
    except Exception:  # noqa: BLE001
        return []


def generic_page(page, url, prefix, src, min_side=700):
    pw_open(page, url, [], rounds=6)
    txt = page_text(page)
    n = 0
    for u in collect_dom_images(page):
        if u.startswith("data:") or u.endswith(".svg"):
            continue
        if save_img(u, src, prefix, min_side=min_side):
            n += 1
    FACTS.setdefault("pages", {})[url] = {"title": page.title(), "text": txt[:15000], "images": n}
    log("page", url, "imgs", n)


def site_crawl(page, base, seeds, limit=40):
    host = urlparse(base).netloc
    queue = [urljoin(base, s) for s in seeds]
    done = set()
    while queue and len(done) < limit:
        u = queue.pop(0).split("#")[0]
        if u in done:
            continue
        done.add(u)
        generic_page(page, u, "s", f"site:{urlparse(u).path}")
        try:
            links = page.evaluate("() => [...document.querySelectorAll('a[href]')].map(a => a.href)")
        except Exception:  # noqa: BLE001
            links = []
        for link in links:
            p = urlparse(link)
            if p.netloc == host and not p.query and not re.search(r"\.(pdf|jpg|png|zip)$", p.path) and link not in done:
                if len(queue) < 200:
                    queue.append(link)


def vk_group(page, g):
    generic_page(page, f"https://m.vk.com/{g}", "v", f"vk:{g}", min_side=500)
    generic_page(page, f"https://vk.com/{g}", "v", f"vk:{g}", min_side=500)


def yclients(page, cid):
    for url in (f"https://n{cid}.yclients.com/company/{cid}/personal/select-services",
                f"https://yc.gl/book/{cid}"):
        caught, _ = pw_open(page, url, ["yclients", "api"], rounds=4)
        try:
            page.get_by_text("Выбрать услуги").first.click(timeout=5000)
            page.wait_for_timeout(5000)
        except Exception:  # noqa: BLE001
            pass
        dump_raw(f"yc_{cid}_{len(caught)}", caught[:40])
        FACTS.setdefault("yclients", {})[url] = page_text(page)[:15000]
        log("yclients", url, len(caught))


# ---------- main ----------
def step(name, fn, *a):
    try:
        log("==", name)
        fn(*a)
    except Exception:  # noqa: BLE001
        log("STEP FAIL", name, traceback.format_exc()[-800:])


with sync_playwright() as pw:
    br = pw.chromium.launch(args=["--disable-blink-features=AutomationControlled"])
    ctx = br.new_context(user_agent=UA, locale="ru-RU", timezone_id="Europe/Moscow",
                         viewport={"width": 1440, "height": 900})
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    page = ctx.new_page()
    if "site" in CFG:
        step("site", site_crawl, page, CFG["site"][0], CFG["site"][1])
    ids = list(CFG.get("yandex", []))
    if "ysearch" in CFG:
        u, m, lim = CFG["ysearch"]
        found = []
        step("ysearch", lambda: found.extend(yandex_search(page, u, m, lim)))
        ids += [i for i in found if i not in ids]
    for i, oid in enumerate(ids):
        step(f"yandex {oid}", yandex_org, page, oid, CFG["yphotos"] if i < 2 else 12)
    for city, fid in CFG.get("gis", []):
        step(f"2gis {fid}", gis_org, page, city, fid)
    for g in CFG.get("vk", []):
        step(f"vk {g}", vk_group, page, g)
    for cid in CFG.get("yc", []):
        step(f"yc {cid}", yclients, page, cid)
    for u in CFG.get("extra", []):
        step(f"extra {u}", generic_page, page, u, "x", f"extra:{urlparse(u).netloc}")
    br.close()

for it in INDEX:
    it.pop("hash", None)
(META / "photos_index.json").write_text(json.dumps(INDEX, ensure_ascii=False, indent=1), encoding="utf-8")
(META / "facts.json").write_text(json.dumps(FACTS, ensure_ascii=False, indent=1), encoding="utf-8")
step("sheets", sheets)
log("DONE photos:", len(INDEX))
