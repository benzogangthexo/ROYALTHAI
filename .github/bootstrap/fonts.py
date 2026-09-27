#!/usr/bin/env python3
"""Download Google Fonts TTF and subset them to latin+cyrillic woff2 (runs on GitHub Actions)."""
import json
import re
import subprocess
import sys
from pathlib import Path

import requests

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "fonts")
OUT.mkdir(parents=True, exist_ok=True)

FONTS = {
    "forum": ["Forum"],
    "commissioner": ["Commissioner:wght@300;400;500;600;700"],
    "tenor-sans": ["Tenor Sans"],
    "sofia-sans-extra-condensed": [
        "Sofia Sans Extra Condensed:ital,wght@0,500;0,700;0,800;0,900;1,900",
        "Sofia Sans Extra Condensed:wght@1000",
    ],
    "geologica": ["Geologica:wght@300;400;500;600;700"],
    "dela-gothic-one": ["Dela Gothic One"],
    "yeseva-one": ["Yeseva One"],
    "brygada-1918": ["Brygada 1918:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500"],
    "ledger": ["Ledger"],
    "bona-nova": ["Bona Nova:ital,wght@0,400;0,700;1,400"],
    "alice": ["Alice"],
    "marck-script": ["Marck Script"],
    "ysabeau-office": ["Ysabeau Office:ital,wght@0,300;0,400;0,500;0,600;1,400"],
    "wix-madefor-text": ["Wix Madefor Text:ital,wght@0,400;0,500;0,600;0,700;1,400"],
    "kurale": ["Kurale"],
    "ruslan-display": ["Ruslan Display"],
    "kelly-slab": ["Kelly Slab"],
    "amatic-sc": ["Amatic SC:wght@400;700"],
    "neucha": ["Neucha"],
    "caveat": ["Caveat:wght@400;500;600;700"],
    "bad-script": ["Bad Script"],
    "literata": ["Literata:ital,wght@0,400;0,500;0,600;0,700;1,400"],
    "pt-serif": ["PT Serif:ital,wght@0,400;0,700;1,400"],
}

UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0300-0301,U+0304,U+0308,U+0329,U+0400-045F,U+0490-0491,U+04B0-04B1,"
    "U+2010-2027,U+2030-203A,U+2044,U+2070-2079,U+2080-2089,U+20AC,U+20BD,U+2116,"
    "U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+25CF,U+2605-2606,"
    "U+2713,U+FEFF,U+FFFD"
)

FACE = re.compile(r"@font-face\s*{([^}]*)}", re.S)
manifest = []
for slug, specs in FONTS.items():
    d = OUT / slug
    d.mkdir(exist_ok=True)
    for spec in specs:
        url = "https://fonts.googleapis.com/css2?family=" + spec.replace(" ", "+") + "&display=swap"
        try:
            css = requests.get(url, timeout=30)
            css.raise_for_status()
        except Exception as e:  # noqa: BLE001
            print("FAIL css", spec, e, flush=True)
            continue
        for block in FACE.findall(css.text):
            style = re.search(r"font-style:\s*(\w+)", block).group(1)
            weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
            src = re.search(r"url\((https://[^)]+)\)", block).group(1)
            name = f"{slug}-{weight}{'-italic' if style == 'italic' else ''}"
            ttf = d / f"{name}.ttf"
            ttf.write_bytes(requests.get(src, timeout=60).content)
            woff2 = d / f"{name}.woff2"
            subprocess.run(
                [
                    "pyftsubset", str(ttf), f"--unicodes={UNICODES}", "--layout-features=*",
                    "--flavor=woff2", "--no-hinting", "--desubroutinize", f"--output-file={woff2}",
                ],
                check=True,
            )
            ttf.unlink()
            manifest.append({"slug": slug, "family": spec.split(":")[0], "file": f"{slug}/{woff2.name}",
                             "weight": int(weight), "style": style, "bytes": woff2.stat().st_size})
            print("ok", woff2, woff2.stat().st_size, flush=True)

(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
print("fonts:", len(manifest))
