#!/usr/bin/env python3
"""Catch captions, stats and other important text sitting in a platform's danger zones (UI overlays).

Usage:
  zone_check.py render.mp4 [--platform reels|tiktok|shorts|universal] [--fps 2]
                [--captions captions.json] [--elements elements.json] [--ignore 47.5-52] [--out-dir qa/]

Two checks:
1. Declared boxes (exact): every caption chunk in captions.json and every element in elements.json
   ([{"name": "stat 4.2x", "kind": "stat|caption|title|cta|logo|artefact|ui", "box": [x, y, w, h], "start": s, "end": e}])
   must stay out of the danger zones. Any overlap > 3 % of the box = FAIL.
2. What is really on screen (OCR): frames sampled at --fps are read with tesseract (normal + inverted-bright pass).
   Text that stays put for >= 2 samples is an overlay, not footage. FAIL if it is a stat (digits, %, ₹, $, x)
   or readable-size text (>= 28 px tall at 1080 wide) in a danger zone; WARN for small or moving text (often signage in
   the footage: check the sheet).
Writes <out-dir>/zone_report.json and zone_sheet.jpg (each flagged moment with the danger zones in red). Exit 1 on FAIL.
"""
import argparse, json, os, re, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from safe_zones import violations, draw  # noqa: E402

STAT = re.compile(r"(\d|%|₹|\$|€|£|\b\d+x\b|\bx\d)")


def probe(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                          "-of", "json", video], capture_output=True, text=True).stdout
    j = json.loads(out)
    return int(j["streams"][0]["width"]), int(j["streams"][0]["height"]), float(j["format"]["duration"])


def ocr(img):
    """tesseract word boxes on two renderings of the frame; returns [(text, conf, x, y, w, h)]."""
    words = []
    g = ImageOps.grayscale(img)
    bright = g.point(lambda v: 0 if v > 185 else 255)  # white captions -> black on white
    for im in (g, bright):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
            im.save(f.name)
            p = f.name
        try:
            tsv = subprocess.run(["tesseract", p, "-", "--psm", "11", "tsv"], capture_output=True, text=True, timeout=120).stdout
        finally:
            os.unlink(p)
        for ln in tsv.splitlines()[1:]:
            c = ln.split("\t")
            if len(c) < 12 or not c[11].strip():
                continue
            conf = float(c[10])
            txt = c[11].strip()
            x, y, w, h = map(int, c[6:10])
            alnum = re.sub(r"[^\w%₹$€£]", "", txt)
            if conf < 55 or len(alnum) < 2 and not STAT.search(txt):
                continue
            if h < 12 or w < 8 or h > img.size[1] * 0.25:
                continue
            words.append((txt, conf, x, y, w, h))
    # merge duplicates from the two passes
    merged = []
    for wd in sorted(words, key=lambda z: -z[1]):
        if all(iou(wd[2:], m[2:]) < 0.5 for m in merged):
            merged.append(wd)
    return merged


def iou(a, b):
    ax0, ay0, aw, ah = a; bx0, by0, bw, bh = b
    x0, y0, x1, y1 = max(ax0, bx0), max(ay0, by0), min(ax0 + aw, bx0 + bw), min(ay0 + ah, by0 + bh)
    inter = max(0, x1 - x0) * max(0, y1 - y0)
    return inter / max(aw * ah + bw * bh - inter, 1e-6)


def cover(a, b):
    """fraction of box a inside box b"""
    ax0, ay0, aw, ah = a; bx0, by0, bw, bh = b
    x0, y0, x1, y1 = max(ax0, bx0), max(ay0, by0), min(ax0 + aw, bx0 + bw), min(ay0 + ah, by0 + bh)
    return max(0, x1 - x0) * max(0, y1 - y0) / max(aw * ah, 1e-6)


def in_ranges(t, ranges):
    return any(a <= t <= b for a, b in ranges)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--platform", default="reels")
    ap.add_argument("--fps", type=float, default=2.0)
    ap.add_argument("--captions")
    ap.add_argument("--elements")
    ap.add_argument("--ignore", action="append", default=[], help="time range a-b to skip (e.g. the end card)")
    ap.add_argument("--out-dir", default="qa")
    ap.add_argument("--min-text-px", type=float, default=28)
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    W, H, dur = probe(a.video)
    k = W / 1080.0
    ignore = [tuple(map(float, r.split("-"))) for r in a.ignore]
    findings = []

    # 1. declared boxes
    declared = []
    if a.captions:
        C = json.load(open(a.captions))
        for c in C.get("chunks", []):
            declared.append({"name": " / ".join(c["lines"]), "kind": "caption", "box": c["box"], "start": c["start"], "end": c["end"]})
    if a.elements:
        declared += json.load(open(a.elements))
    for e in declared:
        if in_ranges((e["start"] + e["end"]) / 2, ignore):
            continue
        v = violations(e["box"], a.platform, W, H, tol=0.03)
        if v:
            findings.append({"level": "FAIL", "source": "declared", "kind": e.get("kind"), "text": e["name"], "start": e["start"],
                             "end": e["end"], "box": e["box"], "zones": v})

    # 2. OCR of the real frames
    tmp = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", a.video, "-vf", f"fps={a.fps}", os.path.join(tmp, "f%05d.png")], check=True)
    frames = sorted(os.listdir(tmp))
    times = [(i + 0.5) / a.fps for i in range(len(frames))]

    def job(i):
        if in_ranges(times[i], ignore):
            return i, []
        return i, ocr(Image.open(os.path.join(tmp, frames[i])).convert("RGB"))

    with ThreadPoolExecutor(max_workers=max(1, (os.cpu_count() or 2))) as ex:
        res = dict(ex.map(job, range(len(frames))))

    # track words across samples (same text, same place)
    tracks = []
    for i in range(len(frames)):
        for (txt, conf, x, y, w, h) in res[i]:
            key = re.sub(r"\W", "", txt.lower())
            hit = None
            for t in tracks:
                if t["last"] == i - 1 and t["key"] == key and iou(t["box"], (x, y, w, h)) > 0.5:
                    hit = t; break
            if hit:
                hit["last"] = i; hit["n"] += 1; hit["moves"] = max(hit["moves"], abs(hit["box"][0] - x) + abs(hit["box"][1] - y))
            else:
                tracks.append({"key": key, "text": txt, "box": (x, y, w, h), "first": i, "last": i, "n": 1, "moves": 0, "conf": conf})
    for t in tracks:
        v = violations(t["box"], a.platform, W, H, tol=0.03)
        if not v:
            continue
        stable = t["n"] >= 2 and t["moves"] <= 12 * k
        is_stat = bool(STAT.search(t["text"]))
        big = t["box"][3] >= a.min_text_px * k
        level = "FAIL" if stable and (is_stat or big) else "WARN"
        if any(f["source"] == "declared" and cover(t["box"], f["box"]) > 0.5 for f in findings):
            continue  # already reported exactly
        findings.append({"level": level, "source": "ocr", "kind": "stat" if is_stat else "text", "text": t["text"],
                         "start": round(t["first"] / a.fps, 2), "end": round((t["last"] + 1) / a.fps, 2),
                         "box": list(t["box"]), "zones": v, "stable": stable, "frame": frames[(t["first"] + t["last"]) // 2]})

    # merge OCR words of one line into one finding (same time span, same zone, close boxes)
    findings.sort(key=lambda f: (f["level"] != "FAIL", f["start"], f["box"][1], f["box"][0]))
    merged = []
    for f in findings:
        m = next((g for g in merged if g["source"] == "ocr" == f["source"] and g["level"] == f["level"] and abs(g["start"] - f["start"]) < 0.6
                  and abs(g["box"][1] - f["box"][1]) < 0.8 * max(g["box"][3], f["box"][3]) and g["zones"][0][0] == f["zones"][0][0]), None)
        if m:
            m.setdefault("_words", [(m["box"][0], m["text"])]).append((f["box"][0], f["text"]))
            m["text"] = " ".join(w for _, w in sorted(m["_words"]))
            x0, y0 = min(m["box"][0], f["box"][0]), min(m["box"][1], f["box"][1])
            x1 = max(m["box"][0] + m["box"][2], f["box"][0] + f["box"][2]); y1 = max(m["box"][1] + m["box"][3], f["box"][1] + f["box"][3])
            m["box"] = [x0, y0, x1 - x0, y1 - y0]; m["end"] = max(m["end"], f["end"]); m["kind"] = "stat" if "stat" in (m["kind"], f["kind"]) else m["kind"]
        else:
            merged.append(f)
    for f in merged:
        f.pop("_words", None)
    findings = merged

    nf = sum(f["level"] == "FAIL" for f in findings); nw = sum(f["level"] == "WARN" for f in findings)
    print(f"{a.platform} danger zones, {len(frames)} frames at {a.fps} fps, {len(declared)} declared boxes: {nf} FAIL, {nw} WARN")
    for f in findings:
        z = ", ".join(f"{n} {int(p * 100)}%" for n, p in f["zones"])
        print(f"[{f['level']}] {f['start']:6.2f}-{f['end']:6.2f}s  {f['kind']:7} '{f['text'][:48]}'  in {z}  ({f['source']})")
    json.dump({"platform": a.platform, "fail": nf, "warn": nw, "findings": findings}, open(os.path.join(a.out_dir, "zone_report.json"), "w"), indent=1)

    # contact sheet of flagged moments
    flagged = [f for f in findings][:24]
    if flagged:
        th_w = 270; th_h = int(th_w * H / W)
        cols = min(6, len(flagged)); rows = (len(flagged) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * (th_w + 10) + 10, rows * (th_h + 54) + 10), (24, 24, 24))
        try:
            fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
        except Exception:
            fnt = None
        for n, f in enumerate(flagged):
            t = (f["start"] + f["end"]) / 2
            idx = min(len(frames) - 1, int(t * a.fps))
            im = draw(Image.open(os.path.join(tmp, frames[idx])).convert("RGB"), a.platform)
            d = ImageDraw.Draw(im)
            x, y, w, h = f["box"]
            d.rectangle((x - 6, y - 6, x + w + 6, y + h + 6), outline=(255, 230, 0) if f["level"] == "FAIL" else (0, 200, 255), width=6)
            im = im.resize((th_w, th_h))
            cx, cy = 10 + (n % cols) * (th_w + 10), 10 + (n // cols) * (th_h + 54)
            sheet.paste(im, (cx, cy))
            dd = ImageDraw.Draw(sheet)
            dd.text((cx, cy + th_h + 4), f"{f['level']} {f['start']:.1f}s {f['kind']}", fill=(255, 90, 90) if f["level"] == "FAIL" else (120, 200, 255), font=fnt)
            dd.text((cx, cy + th_h + 22), f"{f['text'][:30]} | {f['zones'][0][0][:22]}", fill=(230, 230, 230), font=fnt)
        p = os.path.join(a.out_dir, "zone_sheet.jpg")
        sheet.save(p, quality=88)
        print(f"-> {p}")
    sys.exit(1 if nf else 0)


if __name__ == "__main__":
    main()
