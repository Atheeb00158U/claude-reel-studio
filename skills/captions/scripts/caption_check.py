#!/usr/bin/env python3
"""Check a caption track against the reading, timing, placement and contrast rules.

usage: caption_check.py captions.json [--video clean_pass.mp4] [--rules rules.json] [--out report.md]

--video must be a render with the CAPTION TEXT HIDDEN but scrims/boxes/plates visible (a "clean pass"),
otherwise the white text itself is measured as background.

captions.json:
{"fps": 30, "width": 1080, "height": 1920, "platform": "reels",
 "chunks": [{"id": "c1", "start": 1.20, "end": 1.95,             # seconds on screen
             "lines": ["they'd pay you a", "lakh."],
             "box": [180, 1010, 720, 330],                         # x, y, w, h of the text block in px
             "ink": "#FFFFFF", "treatment": "shadow",              # none | shadow | stroke | scrim | box
             "mode": "phrase"}]}                                   # word | phrase | stack | title

rules.json (optional; the locked style's captions section can supply these) overrides DEFAULTS.
Checks: words per chunk, characters per line, lines per chunk, reading speed (CPS and s/word),
min/max duration, flicker gaps, safe zone, contrast of ink vs the real frames under the box
(WCAG ratio on the brightest 10% of background pixels), and face overlap (MediaPipe selfie
multiclass face class) at the start, middle and end of each chunk.
"""
import argparse, json, os, subprocess, sys
import numpy as np

DEFAULTS = {
    "words": {"word": [1, 1], "phrase": [1, 5], "stack": [3, 8], "title": [1, 6], "block": [1, 14]},
    "max_lines": {"word": 1, "phrase": 1, "stack": 3, "title": 2, "block": 2},
    "synced_modes": ["word", "phrase", "stack"],   # words switch on as spoken: reading speed = speech speed
    "max_chars_per_line": 32,          # social; broadcast subtitles allow 37-42
    "max_cps": 17,                     # characters per second (Netflix English adult: 17-20)
    "min_s_per_word": 0.15,            # synced chunks: below this the chunk is gone before it can be read (~400 wpm)
    "block_min_s_per_word": 0.30,      # block subtitles (whole chunk at once): BBC 0.30-0.33 s/word
    "min_duration_s": 0.20,            # a chunk shorter than this flickers; block subtitles: 0.83 s (Netflix 5/6 s)
    "max_duration_s": 7.0,
    "min_gap_frames": 0,               # 0 = chunks may butt; gaps of exactly 1 frame are always flagged
    "contrast": {"none": 4.5, "shadow": 3.0, "stroke": 2.0, "scrim": 4.5, "box": 4.5},  # min ratio ink vs measured background (scrim/box are in the measured pass)
    "face_overlap_max": 0.02,
    "safe": {"reels": [220, 450, 40, 35],  # fallback only; real geometry (incl. the button rail) in safe_zones.py "tiktok": [108, 320, 60, 120], "shorts": [120, 300, 48, 96],
             "universal": [260, 420, 90, 120], "landscape": [54, 54, 96, 96]},   # top, bottom, left, right px at 1080 wide
}


try:  # shared zone geometry (safe rectangle + button-rail cut-out) from qa-delivery
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "qa-delivery", "scripts"))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import safe_zones as _zones
except Exception:
    _zones = None


def rel_lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def ratio(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)


def hex_rgb(h):
    h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def frame_at(video, t, w, h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1",
                          "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3) if len(raw) == w * h * 3 else None


_seg = None
def face_mask(img):
    global _seg
    try:
        import mediapipe as mp
        from mediapipe.tasks import python as mpt
        from mediapipe.tasks.python import vision
        if _seg is None:
            model = os.environ.get("SELFIE_MODEL", "selfie_multiclass_256x256.tflite")
            if not os.path.exists(model): return None
            _seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
                base_options=mpt.BaseOptions(model_asset_path=model), output_confidence_masks=True))
        r = _seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(img)))
        return np.squeeze(np.array(r.confidence_masks[3].numpy_view())) > 0.5
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("captions"); ap.add_argument("--video"); ap.add_argument("--rules"); ap.add_argument("--out")
    a = ap.parse_args()
    C = json.load(open(a.captions)); R = json.loads(json.dumps(DEFAULTS))
    if a.rules: R.update(json.load(open(a.rules)))
    fps, W, H = C.get("fps", 30), C.get("width", 1080), C.get("height", 1920)
    k = W / 1080.0
    safe = [v * k for v in R["safe"].get(C.get("platform", "universal" if H > W else "landscape"))]
    rows, fails = [], 0
    chunks = sorted(C["chunks"], key=lambda c: c["start"])
    for i, c in enumerate(chunks):
        issues = []
        mode = c.get("mode", "phrase"); text = " ".join(c["lines"]); nw = len(text.split()); nc = len(text.replace(" ", ""))
        dur = c["end"] - c["start"]
        lo, hi = R["words"].get(mode, [1, 8])
        if not lo <= nw <= hi: issues.append(f"{nw} words (mode {mode}: {lo}-{hi})")
        if len(c["lines"]) > R["max_lines"].get(mode, 2): issues.append(f"{len(c['lines'])} lines (max {R['max_lines'].get(mode)})")
        for ln in c["lines"]:
            if len(ln) > R["max_chars_per_line"] and mode != "title": issues.append(f"line '{ln}' {len(ln)} chars > {R['max_chars_per_line']}")
        if dur < R["min_duration_s"]: issues.append(f"on screen {dur:.2f}s < {R['min_duration_s']}s")
        if dur > R["max_duration_s"]: issues.append(f"on screen {dur:.2f}s > {R['max_duration_s']}s")
        synced = mode in R["synced_modes"]
        if not synced and dur > 0 and nc / dur > R["max_cps"]: issues.append(f"{nc / dur:.1f} chars/s > {R['max_cps']}")
        floor = R["min_s_per_word"] if synced else R["block_min_s_per_word"]
        if mode != "word" and dur / max(nw, 1) < floor: issues.append(f"{dur / nw:.2f}s per word < {floor}")
        if i + 1 < len(chunks):
            gap = round((chunks[i + 1]["start"] - c["end"]) * fps)
            if gap < 0: issues.append(f"overlaps next chunk by {-gap} f")
            elif gap == 1 or (0 < gap < R["min_gap_frames"]): issues.append(f"{gap}-frame gap before next chunk (flicker)")
        x, y, w, h = c["box"]
        if _zones:
            v = _zones.violations((x, y, w, h), C.get("platform", "universal" if H > W else "landscape"), W, H, tol=0.03)
            if v: issues.append("in danger zone: " + ", ".join(f"{n} {int(p * 100)}%" for n, p in v))
        else:
            t, b, l, r_ = safe
            if y < t or y + h > H - b or x < l or x + w > W - r_: issues.append("outside the platform safe zone")
        contrast_note = ""
        if a.video:
            need = R["contrast"].get(c.get("treatment", "none"), 4.5); ink = rel_lum(hex_rgb(c.get("ink", "#FFFFFF")))
            worst, face_hit = 99, 0
            for tt in (c["start"] + 0.02, (c["start"] + c["end"]) / 2, c["end"] - 0.02):
                fr = frame_at(a.video, tt, W, H)
                if fr is None: continue
                pad = int(0.15 * h)
                reg = fr[max(0, y - pad):min(H, y + h + pad), max(0, x - pad):min(W, x + w + pad)].reshape(-1, 3).astype(float)
                L = rel_lum(reg)
                bg = np.percentile(L, 90) if ink > 0.5 else np.percentile(L, 10)
                worst = min(worst, ratio(ink, bg))
                fm = face_mask(fr)
                if fm is not None:
                    face_hit = max(face_hit, fm[y:y + h, x:x + w].mean())
            if worst < need: issues.append(f"contrast {worst:.1f}:1 under {c.get('treatment','none')} (needs >= {need}:1 raw; strengthen the treatment or move/scrim)")
            contrast_note = f"{worst:.1f}:1"
            if face_hit > R["face_overlap_max"]: issues.append(f"covers a face ({face_hit * 100:.0f}% of the box)")
        fails += bool(issues)
        rows.append(f"| {c['id']} | {c['start']:.2f}-{c['end']:.2f} | {' / '.join(c['lines'])} | {contrast_note} | {'; '.join(issues) or 'ok'} |")
    rep = "# Caption check\n\n| id | time | text | contrast | issues |\n| --- | --- | --- | --- | --- |\n" + "\n".join(rows) + f"\n\n{fails} of {len(chunks)} chunks need work.\n"
    if a.out: open(a.out, "w").write(rep)
    print(rep); sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
