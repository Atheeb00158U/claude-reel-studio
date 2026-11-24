"""Platform safe zones for vertical video, at 1080 px wide (scaled by width/1080).

Each platform = a safe rectangle plus optional cut-outs (rectangles inside it that are still covered by UI).
Instagram Reels 9:16 follows Atheeb's reference graphic (Nov 21 2026): 220 px top, 450 px bottom,
35 px right (40 px left, measured from the graphic), and the like/comment/share rail: a 100 px column
inside the right edge from y ~1150 down to the bottom zone.
"""

ZONES = {
    "reels": {
        "safe": (40, 220, 1045, 1470),                       # x0, y0, x1, y1
        "cutouts": [("button rail (like/comment/share)", (945, 1150, 1080, 1470))],
        "danger_names": {"top": "top bar (back, audio, camera)", "bottom": "bottom bar (username, caption, audio)",
                         "left": "left edge", "right": "right edge"},
    },
    "tiktok": {
        "safe": (60, 108, 960, 1600),
        "cutouts": [("button rail (like/comment/share)", (930, 700, 1080, 1600))],
        "danger_names": {"top": "top bar (Following/For You)", "bottom": "bottom bar (username, caption, music)",
                         "left": "left edge", "right": "right edge"},
    },
    "shorts": {
        "safe": (48, 120, 984, 1620),
        "cutouts": [("button rail (like/dislike/comment)", (950, 900, 1080, 1620))],
        "danger_names": {"top": "top bar", "bottom": "bottom bar (title, channel)", "left": "left edge", "right": "right edge"},
    },
    # strictest of all three: use when one video goes everywhere
    "universal": {
        "safe": (60, 260, 960, 1470),
        "cutouts": [("button rail (like/comment/share)", (930, 700, 1080, 1470))],
        "danger_names": {"top": "top bar", "bottom": "bottom bar", "left": "left edge", "right": "right edge / rail"},
    },
    "landscape": {"safe": (96, 54, 1824, 1026), "cutouts": [], "danger_names": {"top": "top", "bottom": "bottom", "left": "left", "right": "right"}},
}


def zones_for(platform, W=1080, H=1920):
    z = ZONES.get(platform) or ZONES["universal" if H > W else "landscape"]
    k = W / (1920.0 if (platform == "landscape" or W > H) else 1080.0)
    s = tuple(v * k for v in z["safe"])
    cut = [(n, tuple(v * k for v in r)) for n, r in z["cutouts"]]
    return {"safe": s, "cutouts": cut, "names": z["danger_names"]}


def _overlap(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1])
    x1, y1 = min(a[2], b[2]), min(a[3], b[3])
    return max(0.0, x1 - x0) * max(0.0, y1 - y0)


def violations(box, platform="reels", W=1080, H=1920, tol=0.0):
    """box = (x, y, w, h). Returns a list of (zone name, fraction of the box inside that zone).
    tol: fraction of the box allowed to poke into a zone (e.g. 0.03 for a descender or a shadow)."""
    x, y, w, h = box
    b = (x, y, x + w, y + h)
    area = max(w * h, 1e-6)
    z = zones_for(platform, W, H)
    sx0, sy0, sx1, sy1 = z["safe"]
    out = []
    for name, region in (("top", (0, 0, W, sy0)), ("bottom", (0, sy1, W, H)), ("left", (0, sy0, sx0, sy1)), ("right", (sx1, sy0, W, sy1))):
        f = _overlap(b, region) / area
        if f > tol:
            out.append((z["names"][name], round(f, 3)))
    for name, r in z["cutouts"]:
        f = _overlap(b, r) / area
        if f > tol:
            out.append((name, round(f, 3)))
    return sorted(out, key=lambda z: -z[1])


def draw(img, platform="reels", alpha=0.28):
    """Overlay the danger zones (red) on a PIL image, for contact sheets."""
    from PIL import Image, ImageDraw
    W, H = img.size
    z = zones_for(platform, W, H)
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    sx0, sy0, sx1, sy1 = z["safe"]
    red = (230, 40, 40, int(255 * alpha))
    for r in ((0, 0, W, sy0), (0, sy1, W, H), (0, sy0, sx0, sy1), (sx1, sy0, W, sy1)):
        d.rectangle(r, fill=red)
    for _, r in z["cutouts"]:
        d.rectangle(r, fill=red)
    d.rectangle((sx0, sy0, sx1, sy1), outline=(255, 255, 255, 160), width=2)
    return Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
