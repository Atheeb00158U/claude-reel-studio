#!/usr/bin/env python3
"""Check a video's sourced assets for quality and rights before the edit.

Usage:
  check_assets.py <video folder> [--mode copyright_free|copyrighted_ok] [--credits] [--json out.json]

Reads  <video folder>/01_source/sources.json  (list of entries, see below) and ffprobes every
clip/still/music file under 01_source/ (and _Global library paths named in sources.json).
The mode defaults to style.lock.json -> footage.rights (03_project/style.lock.json), else copyright_free.

sources.json entry:
  {"file": "clips/traffic_tl.mp4", "kind": "clip|still|music|logo|doc",
   "use": "hero|broll|inset|print|card|archive|bed", "line": "what line it serves",
   "source": "youtube|moving_image_archive|pexels|...", "url": "...", "id": "GWij9M53E8w",
   "title": "...", "creator": "DroneWorldHD", "license": "CC BY|public domain|Pexels|commentary|cc-remix, composition not cleared|...",
   "variant": "v2160", "in": 12.0, "out": 18.5,
   "risk_accepted": false}   # true only when Atheeb OKs a cc-remix/uncleared item for this video

Exit code 1 if anything FAILS. WARN lines don't fail.
"""
import argparse, json, os, subprocess, sys

VIDEO_EXT = {".mp4", ".mov", ".mkv", ".webm", ".m4v"}
STILL_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
AUDIO_EXT = {".mp3", ".m4a", ".wav", ".aac", ".flac", ".ogg", ".opus"}

CF_OK = ("cc by", "cc0", "public domain", "pexels", "pixabay", "mixkit", "youtube audio library",
         "client-owned", "own", "generated", "licensed", "purchased", "nasa")


def probe(path):
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path],
                             capture_output=True, text=True, timeout=60).stdout
        return json.loads(out or "{}")
    except Exception as e:
        return {"error": str(e)}


def floors(kind, use):
    """(min short side px, min video kbps) for the use."""
    if kind == "still" or kind == "logo":
        return (1600 if use in ("hero", "broll", None) else 1000), None
    if use in ("inset", "print", "card", "split"):
        return 720, 1500
    if use == "archive":
        return 0, None
    return 1080, 4000  # hero / broll / full frame


def license_ok(lic, mode):
    l = (lic or "").lower()
    if mode == "copyrighted_ok":
        return bool(l), "missing licence/source note" if not l else ""
    if not l:
        return False, "no licence recorded"
    if any(b in l for b in ("commentary", "cc-remix", "unknown", "reference")):
        return False, f"'{lic}' is not allowed in copyright_free mode"
    if "-nc" in l or "-nd" in l or "noncommercial" in l or "no deriv" in l:
        return False, f"'{lic}' forbids commercial use or edits"
    if not any(k in l for k in CF_OK):
        return None, f"licence '{lic}' not recognised: confirm it allows commercial reuse"
    return True, ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("--mode", choices=["copyright_free", "copyrighted_ok"])
    ap.add_argument("--credits", action="store_true", help="print attribution text for CC BY assets")
    ap.add_argument("--json")
    a = ap.parse_args()

    src_dir = os.path.join(a.folder, "01_source")
    mode = a.mode
    lock = os.path.join(a.folder, "03_project", "style.lock.json")
    if not mode and os.path.exists(lock):
        try:
            mode = json.load(open(lock)).get("footage", {}).get("rights")
        except Exception:
            pass
    mode = mode or "copyright_free"

    sj = os.path.join(src_dir, "sources.json")
    entries = json.load(open(sj)) if os.path.exists(sj) else []
    by_file = {os.path.normpath(e["file"]): e for e in entries if e.get("file")}

    files = []
    for root, _, names in os.walk(src_dir):
        if "reference" in root.split(os.sep):
            continue  # reference material never reaches a render
        for n in names:
            ext = os.path.splitext(n)[1].lower()
            if ext in VIDEO_EXT | STILL_EXT | AUDIO_EXT:
                files.append(os.path.relpath(os.path.join(root, n), src_dir))
    for f in by_file:
        if f not in files and os.path.isabs(f):
            files.append(f)

    rows, fails, warns = [], 0, 0
    print(f"Rights mode: {mode}   files: {len(files)}   sources.json entries: {len(entries)}\n")
    for f in sorted(files):
        path = f if os.path.isabs(f) else os.path.join(src_dir, f)
        ext = os.path.splitext(f)[1].lower()
        e = by_file.get(os.path.normpath(f), {})
        kind = e.get("kind") or ("clip" if ext in VIDEO_EXT else "still" if ext in STILL_EXT else "music")
        use = e.get("use")
        issues, notes = [], []
        info = probe(path)
        v = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
        au = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), None)
        r = {"file": f, "kind": kind, "use": use}

        if kind in ("clip", "still", "logo") and v:
            w, h = int(v.get("width", 0)), int(v.get("height", 0))
            short = min(w, h)
            r.update(w=w, h=h)
            min_short, min_kbps = floors(kind, use)
            if short < min_short:
                issues.append(f"{w}x{h} below {min_short}p floor for '{use or 'full frame'}'")
            if kind == "clip":
                br = v.get("bit_rate") or info.get("format", {}).get("bit_rate")
                kbps = int(br) / 1000 if br else None
                r["kbps"] = round(kbps) if kbps else None
                fr = v.get("avg_frame_rate", "0/1").split("/")
                fps = float(fr[0]) / float(fr[1]) if len(fr) == 2 and float(fr[1]) else 0
                r["fps"] = round(fps, 2)
                if min_kbps and kbps and kbps < min_kbps * (short / 1080) ** 2 * 0.9:
                    issues.append(f"{kbps:.0f} kbps is starved for {short}p (want ≥ {min_kbps * (short/1080)**2:.0f})")
                if fps and fps < 23:
                    issues.append(f"{fps:.2f} fps")
                if v.get("field_order") not in (None, "progressive", "unknown"):
                    notes.append(f"interlaced ({v.get('field_order')}): deinterlace")
                if use in ("hero", "broll", None) and w > h and short < 1440:
                    notes.append("16:9 source under 1440p: a 9:16 crop will be soft; prefer v1440/v2160 or use as card/inset")
        elif kind == "music" and au:
            sr = int(au.get("sample_rate", 0))
            br = au.get("bit_rate") or info.get("format", {}).get("bit_rate")
            kbps = int(br) / 1000 if br else None
            r.update(sr=sr, kbps=round(kbps) if kbps else None)
            if sr and sr < 44100:
                issues.append(f"{sr} Hz sample rate")
            if ext == ".mp3" and kbps and kbps < 190:
                issues.append(f"{kbps:.0f} kbps mp3: find a better copy (m4a/wav)")
        elif "error" in info or (not v and not au):
            issues.append("ffprobe could not read the file")

        if not e:
            issues.append("not in sources.json (source + licence unknown)")
        else:
            ok, why = license_ok(e.get("license"), mode)
            if ok is False and e.get("risk_accepted"):
                notes.append(why + " (risk accepted by Atheeb for this video; never in a paid ad)")
            elif ok is False:
                issues.append(why)
            elif ok is None:
                notes.append(why)
            if "cc by" in (e.get("license") or "").lower() and not e.get("creator"):
                issues.append("CC BY needs the creator's name for the credit")
            if not (e.get("url") or e.get("source")):
                issues.append("no source URL")

        status = "FAIL" if issues else ("WARN" if notes else "ok")
        fails += status == "FAIL"
        warns += status == "WARN"
        r.update(status=status, issues=issues, notes=notes)
        rows.append(r)
        dims = f"{r.get('w')}x{r.get('h')}" if r.get("w") else (f"{r.get('sr')}Hz" if r.get("sr") else "")
        print(f"[{status:4}] {f}  {dims} {str(r.get('kbps') or '') + ' kbps' if r.get('kbps') else ''}")
        for x in issues:
            print(f"        ✗ {x}")
        for x in notes:
            print(f"        · {x}")

    # repeated source moments
    seen = {}
    for e in entries:
        if e.get("id") and e.get("in") is not None:
            for (sid, i0, o0, f0) in seen.get(e["id"], []):
                if e["in"] < o0 and e.get("out", e["in"]) > i0:
                    print(f"[FAIL] same source moment used twice: {e['file']} and {f0} ({e['id']} {e['in']}–{e.get('out')})")
                    fails += 1
            seen.setdefault(e["id"], []).append((e["id"], e["in"], e.get("out", e["in"]), e["file"]))

    oks = sum(r["status"] == "ok" for r in rows)
    print(f"\n{fails} fail, {warns} warn, {oks} ok")

    if a.credits:
        cc = [e for e in entries if "cc by" in (e.get("license") or "").lower() or "attribution" in (e.get("license") or "").lower()]
        print("\nCredits (post caption / description + DELIVERY_NOTES):")
        done = set()
        for e in cc:
            key = e.get("url") or e["file"]
            if key in done:
                continue
            done.add(key)
            print(f'- "{e.get("title", e["file"])}" by {e.get("creator", "?")}, {e.get("url", "")}, licensed under {e.get("license")}')
        if not cc:
            print("- none needed")
    if a.json:
        json.dump({"mode": mode, "rows": rows, "fails": fails, "warns": warns}, open(a.json, "w"), indent=2)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
