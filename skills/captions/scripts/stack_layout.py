#!/usr/bin/env python3
"""Jigsaw caption stacks: size, align and space lines optically, check the rules, draw a preview sheet.

Input JSON:
{
  "fonts": {"sans": "InterDisplay-ExtraBold.otf", "accent": "TeXGyrePagella-Italic.otf"},
  "accent_scale": 1.16,          # accent face set larger so its x-height matches the sans
  "small_cap": 0.36,             # small lines are capped at this fraction of the big size (0.25-0.45)
  "small_min": 0.25,             # a small line may shrink to this x the big size to find a clean notch
  "min_words": 3,                # fewer words never stack
  "margin": 1.0,                 # small lines act as solid blocks widened by this x their cap height (no stray dots between words)
  "clear": 0.28,                 # air kept between interlocking ink, as a fraction of the small cap height
  "g_max": 0.55,                 # loosest optical gap (baseline -> next x-height) that still counts as a clean, tight fit
  "stacks": [
    {"id": "s1", "block_width": 720,
     "lines": [{"text": "started", "role": "small"},
               {"text": "writing", "role": "big", "face": "accent"},
               {"text": "about it.", "role": "small"}]}
  ]
}
Output: <out>.json (per line: face, size, x, baseline, ink box) and <out>.png (preview sheet).
Rules enforced (errors) and warned: see RULES below.
"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

RULES = """errors: fewer than 3 words; not exactly one big line; small line over 0.5x the big size; more than 3 lines;
         no clean fit (the tightest interlock found by sliding each small line across the block still leaves a loose gap
         because descenders and ascenders clash) -> don't stack
warnings: uneven gaps between the two pairs"""


def font(path, size):
    return ImageFont.truetype(path, max(4, int(round(size))))


def metrics(path, size):
    f = font(path, size)
    cap = -f.getbbox("H", anchor="ls")[1]
    xh = -f.getbbox("x", anchor="ls")[1]
    return f, cap, xh


def ink_width(path, size, text):
    b = font(path, size).getbbox(text, anchor="ls")
    return b[2] - b[0]


def fit_size(path, text, width, lo=8, hi=900):
    for _ in range(30):
        mid = (lo + hi) / 2
        if ink_width(path, mid, text) > width:
            hi = mid
        else:
            lo = mid
    return lo


def render_line(path, size, text):
    f = font(path, size)
    b = f.getbbox(text, anchor="ls")
    w, h = b[2] - b[0] + 4, b[3] - b[1] + 4
    im = Image.new("L", (w, h), 0)
    ImageDraw.Draw(im).text((2 - b[0], 2 - b[1]), text, font=f, fill=255, anchor="ls")
    return np.asarray(im) > 60, b  # mask, bbox relative to baseline-left


def profiles(mask, bbox, x0, width):
    """Per-column top and bottom ink offsets relative to the baseline (y down), on a block-wide grid."""
    top = np.full(width, np.inf); bot = np.full(width, -np.inf)
    cols = np.where(mask.any(0))[0]
    for c in cols:
        rows = np.where(mask[:, c])[0]
        X = int(round(x0 + bbox[0] - 2 + c))
        if 0 <= X < width:
            top[X] = min(top[X], bbox[1] - 2 + rows.min()); bot[X] = max(bot[X], bbox[1] - 2 + rows.max())
    return top, bot


def box_profile(mask, bbox, x0, width, margin, xh):
    """Exact glyph profile of a small line, plus its body band (x-height top to baseline) as a solid block across
    its span widened by `margin`: big-line letters may nest around it but never poke into its body, so no stray dot,
    ascender or descender ends up between its words."""
    top, bot = profiles(mask, bbox, x0, width)
    cols = np.where(mask.any(0))[0]
    a = int(round(x0 + bbox[0] - 2 + cols.min() - margin)); z = int(round(x0 + bbox[0] - 2 + cols.max() + margin))
    sl = slice(max(0, a), min(width, z + 1))
    top[sl] = np.minimum(top[sl], -xh); bot[sl] = np.maximum(bot[sl], 0)
    return top, bot


def pair_distance(up, lo, clear, xh_lo):
    """Smallest baseline-to-baseline distance so every column keeps `clear` px of air between the
    upper line's ink and the lower line's ink, and the lower line's x-height never rises above the upper baseline."""
    both = np.isfinite(up[1]) & np.isfinite(lo[0])
    d = clear + xh_lo
    if both.any():
        d = max(d, float((up[1][both] - lo[0][both]).max()) + clear)
    return d


def layout(spec, cfg):
    fonts = cfg["fonts"]; B = int(spec["block_width"]); W = B + 400
    errors, warns = [], []
    lines = spec["lines"]
    words = sum(len(l["text"].split()) for l in lines)
    roles = [l.get("role", "small") for l in lines]
    if len(lines) < 2: return {"id": spec["id"], "block_width": B, "lines": [], "errors": ["not a stack"], "warnings": []}
    if words < cfg.get("min_words", 3): errors.append(f"{words}-word stack: stacks need at least {cfg.get('min_words', 3)} words; set it on one line")
    if len(lines) > 3: errors.append("more than 3 lines")
    if roles.count("big") != 1: errors.append("a stack needs exactly one big line (two same-size lines don't read as a stack)")
    out = []
    for l in lines:
        face = fonts[l.get("face", "sans")]
        scale = cfg.get("accent_scale", 1.16) if l.get("face") == "accent" else 1.0
        out.append({"text": l["text"], "role": l.get("role", "small"), "face": l.get("face", "sans"), "path": face, "scale": scale})
    bigs = [o for o in out if o["role"] == "big"]
    big = fit_size(bigs[0]["path"], bigs[0]["text"], B) if bigs else fit_size(out[0]["path"], out[0]["text"], B)
    for o in out:
        if o["role"] == "big":
            o["size"] = fit_size(o["path"], o["text"], B)
        else:
            o["size"] = min(fit_size(o["path"], o["text"], B), big * cfg.get("small_cap", 0.36) * o["scale"])
            r = o["size"] / big
            if r > 0.5: errors.append(f"'{o['text']}' is {r:.2f}x the big line: not enough size contrast to read as a stack")
        _, o["cap"], o["xh"] = metrics(o["path"], o["size"])
        o["mask"], o["bbox"] = render_line(o["path"], o["size"], o["text"])
        o["ink_w"] = ink_width(o["path"], o["size"], o["text"])
    smalls = [o for o in out if o["role"] != "big"] or out
    cap_s = min(o["cap"] for o in smalls)
    clear = cfg.get("clear", 0.28) * cap_s           # the white channel between interlocking lines
    gmax = cfg.get("g_max", 0.55) * cap_s            # loosest optical gap (baseline -> x-height) still called tight
    bi = roles.index("big") if "big" in roles else 0
    out[bi]["x"] = (B - out[bi]["ink_w"]) / 2 - out[bi]["bbox"][0]
    prof = {bi: profiles(out[bi]["mask"], out[bi]["bbox"], out[bi]["x"] + 200, W)}
    dist = {}
    # place each small line by searching every x in the block for the tightest clean interlock
    order = list(range(bi - 1, -1, -1)) + list(range(bi + 1, len(out)))
    smin = cfg.get("small_min", 0.25)
    for i in order:
        o = out[i]; nb = i + 1 if i < bi else i - 1
        chosen = None
        # largest size (from small_cap down to small_min x the big size) that still interlocks cleanly
        sizes = [o["size"]] + [big * f * o["scale"] for f in np.arange(cfg.get("small_cap", 0.36) - 0.02, smin - 1e-6, -0.02)]
        for sz in sizes:
            if sz > o["size"] + 1e-6: continue
            _, cap, xh = metrics(o["path"], sz); mask, bbox = render_line(o["path"], sz, o["text"]); iw = ink_width(o["path"], sz, o["text"])
            best = None
            for x in range(0, max(1, int(B - iw)) + 1, 2):
                xx = x - bbox[0]
                pr = box_profile(mask, bbox, xx + 200, W, cfg.get("margin", 1.0) * cap, xh)
                d = pair_distance(pr, prof[nb], clear, out[nb]["xh"]) if i < nb else pair_distance(prof[nb], pr, clear, xh)
                key = (round(d, 0), min(x, B - iw - x))
                if best is None or key < best[0]: best = (key, xx, d, pr)
            gap = best[2] - (out[nb]["xh"] if i < nb else xh)
            cand = dict(size=sz, cap=cap, xh=xh, mask=mask, bbox=bbox, ink_w=iw, x=best[1], d=best[2], prof=best[3], gap=gap)
            if chosen is None or gap < chosen["gap"] - 1e-6: chosen = cand if chosen is None or gap <= gmax or cand["gap"] < chosen["gap"] else chosen
            if gap <= gmax: chosen = cand; break
        for k in ("size", "cap", "xh", "mask", "bbox", "ink_w", "x"): o[k] = chosen[k]
        dist[i], prof[i] = chosen["d"], chosen["prof"]
    # baselines
    base = {bi: 0.0}
    for i in order:
        base[i] = base[i + 1] - dist[i] if i < bi else base[i - 1] + dist[i]
    gaps = []
    for i in range(len(out) - 1):
        gaps.append(base[i + 1] - base[i] - out[i + 1]["xh"])   # optical gap: baseline -> next x-height top
    if max(gaps) > gmax:
        errors.append(f"no clean fit: the tightest interlock leaves a {max(gaps) / cap_s:.2f}x-cap gap (max {gmax / cap_s:.2f}); descenders/ascenders clash, so set it on one line or re-break it")
    if len(gaps) == 2 and min(gaps) > 0 and max(gaps) / min(gaps) > 1.8:
        warns.append(f"gaps uneven ({gaps[0] / cap_s:.2f} vs {gaps[1] / cap_s:.2f} x cap)")
    top = min(base[i] + o["bbox"][1] for i, o in enumerate(out))
    res = {"id": spec["id"], "block_width": B, "gap_cap_ratio": [round(g / cap_s, 2) for g in gaps],
           "lines": [{"text": o["text"], "role": o["role"], "face": o["face"], "size": o["size"], "x": o["x"],
                      "baseline": base[i] - top, "ink_w": o["ink_w"], "cap": o["cap"], "xh": o["xh"]} for i, o in enumerate(out)],
           "errors": errors, "warnings": warns}
    return res


def preview(results, cfg, path, ink="#fff", bg="#3a3f44"):
    tiles = []
    for r in results:
        H = int(max(l["baseline"] for l in r["lines"]) + 120) if r["lines"] else 200
        W = r["block_width"] + 120
        im = Image.new("RGB", (W, H + 60), bg); d = ImageDraw.Draw(im)
        for l in r["lines"]:
            d.text((60 + l["x"], 60 + l["baseline"]), l["text"], font=font(cfg["fonts"][l["face"]], l["size"]), fill=ink, anchor="ls")
        tag = r["id"] + ("  ERR: " + "; ".join(r["errors"]) if r["errors"] else "") + ("  warn: " + "; ".join(r["warnings"]) if r["warnings"] else "")
        d.text((10, 10), tag[:140], fill="#ffd34d")
        tiles.append(im)
    W = max(t.width for t in tiles); Ht = sum(t.height for t in tiles)
    sheet = Image.new("RGB", (W, Ht), bg); y = 0
    for t in tiles: sheet.paste(t, (0, y)); y += t.height
    sheet.save(path)


if __name__ == "__main__":
    if len(sys.argv) < 3: sys.exit("usage: stack_layout.py stacks.json out_prefix")
    cfg = json.load(open(sys.argv[1]))
    res = [layout(s, cfg) for s in cfg["stacks"]]
    json.dump(res, open(sys.argv[2] + ".json", "w"), indent=1)
    preview(res, cfg, sys.argv[2] + ".png")
    bad = [r for r in res if r["errors"]]
    for r in res:
        print(r["id"], f"gaps {r['gap_cap_ratio']}xcap", "ERR " + "; ".join(r["errors"]) if r["errors"] else "ok", ("| " + "; ".join(r["warnings"])) if r["warnings"] else "")
    sys.exit(1 if bad else 0)
