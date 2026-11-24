#!/usr/bin/env python3
"""Analyse a music track for emotional scoring: tempo, beat/bar/phrase grid, key (Camelot),
per-bar energy, breaks/silences, energy sections with mood tags.

Usage:
  analyze_track.py track.mp3 [more.mp3 ...] [--out-dir analysis/] [--force] [--root "<_Global library>/music"]
                   [--has-vocals yes|no] [--rights royalty-free|commercial|cc-by] [--title "..."]

Writes <out-dir>/<stem>.json (cached by file size+mtime; --force recomputes).
Ideas adapted from AI-DJ-Mixing-System (MIT): BPM half/double correction, energy-curve
buildup/drop detection, phrase snapping, Camelot compatibility. Code is our own.
"""
import argparse, json, os, sys, warnings
import numpy as np

warnings.filterwarnings("ignore")
import librosa

SR = 22050
HOP = 512

# Krumhansl-Kessler key profiles
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
# Camelot: major keys -> nB, minor -> nA
CAMELOT_MAJ = {"B": 1, "F#": 2, "C#": 3, "G#": 4, "D#": 5, "A#": 6, "F": 7, "C": 8, "G": 9, "D": 10, "A": 11, "E": 12}
CAMELOT_MIN = {"G#": 1, "D#": 2, "A#": 3, "F": 4, "C": 5, "G": 6, "D": 7, "A": 8, "E": 9, "B": 10, "F#": 11, "C#": 12}


def norm(x, lo, hi):
    return float(np.clip((x - lo) / (hi - lo), 0, 1))


def estimate_key(y):
    chroma = librosa.feature.chroma_cqt(y=y, sr=SR, hop_length=HOP * 4)
    prof = chroma.mean(axis=1)
    best = (-2, None, None)
    scores = []
    for i in range(12):
        for mode, P in (("maj", MAJ), ("min", MIN)):
            r = np.corrcoef(prof, np.roll(P, i))[0, 1]
            scores.append(r)
            if r > best[0]:
                best = (r, NOTES[i], mode)
    r, note, mode = best
    srt = sorted(scores, reverse=True)
    conf = float(srt[0] - srt[1])
    cam = f"{CAMELOT_MAJ[note]}B" if mode == "maj" else f"{CAMELOT_MIN[note]}A"
    return {"key": note + ("" if mode == "maj" else "m"), "mode": mode, "camelot": cam,
            "key_confidence": round(conf, 3), "key_r": round(float(r), 3)}


def beat_grid(y, dur):
    oenv = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=SR, hop_length=HOP, units="frames")
    tempo = float(np.atleast_1d(tempo)[0])
    bt = librosa.frames_to_time(beats, sr=SR, hop_length=HOP)
    # half/double correction into 70-160 BPM (hip-hop/lofi often detected double)
    corrected = None
    if len(bt) > 8:
        ibi = np.median(np.diff(bt))
        bpm = 60.0 / ibi
        if bpm >= 160:
            bt = bt[::2]; bpm /= 2; corrected = "halved"
        elif bpm < 70:
            mids = (bt[:-1] + bt[1:]) / 2
            bt = np.sort(np.concatenate([bt, mids])); bpm *= 2; corrected = "doubled"
    else:
        bpm = tempo
    # downbeat phase: bar position whose beats carry the most low-frequency onset energy (kick)
    S = np.abs(librosa.stft(y, hop_length=HOP)) ** 2
    freqs = librosa.fft_frequencies(sr=SR)
    low = S[freqs < 150].sum(axis=0)
    low_on = np.maximum(0, np.diff(low, prepend=low[0]))
    bf = librosa.time_to_frames(bt, sr=SR, hop_length=HOP)
    bf = np.clip(bf, 0, len(low_on) - 1)
    vals = low_on[bf]
    phase = int(np.argmax([vals[k::4].sum() for k in range(4)])) if len(vals) >= 8 else 0
    downbeats = bt[phase::4]
    return float(bpm), corrected, bt, downbeats, oenv


def analyse(path, has_vocals=None, rights=None, title=None):
    y, _ = librosa.load(path, sr=SR, mono=True)
    dur = len(y) / SR
    bpm, corrected, beats, downbeats, oenv = beat_grid(y, dur)
    key = estimate_key(y)

    # per-bar features (bars = downbeat to downbeat)
    edges = list(downbeats) + [dur]
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    cent = librosa.feature.spectral_centroid(y=y, sr=SR, hop_length=HOP)[0]
    S = np.abs(librosa.stft(y, hop_length=HOP)) ** 2
    freqs = librosa.fft_frequencies(sr=SR)
    lowshare = S[freqs < 150].sum(axis=0) / (S.sum(axis=0) + 1e-12)
    onsets = librosa.onset.onset_detect(onset_envelope=oenv, sr=SR, hop_length=HOP, units="time")
    ft = librosa.frames_to_time(np.arange(len(rms)), sr=SR, hop_length=HOP)
    bars = []
    for i in range(len(edges) - 1):
        a, b = edges[i], edges[i + 1]
        m = (ft >= a) & (ft < b)
        if m.sum() < 2:
            continue
        r_db = float(20 * np.log10(np.sqrt(np.mean(rms[m] ** 2)) + 1e-9))
        c = float(np.median(cent[m]))
        ls = float(np.mean(lowshare[m]))
        od = float(((onsets >= a) & (onsets < b)).sum() / max(b - a, 1e-3))
        # arousal proxy, comparable across mastered tracks: rhythmic density + brightness + loudness
        # (calibrated Nov 21 2026 on the library: lofi beds ~0.3-0.4, boom-bap ~0.55, Deep Urban / Big Dawgs ~0.8)
        energy = 0.40 * norm(od, 1.5, 7) + 0.30 * norm(c, 400, 2600) + 0.30 * norm(r_db, -24, -8)
        bars.append({"t": round(float(a), 3), "end": round(float(b), 3), "rms_db": round(r_db, 1), "onsets_per_s": round(od, 2),
                     "centroid_hz": round(c), "low_share": round(ls, 3), "energy": round(energy, 3)})

    # silences / breaks (>= 0.25 s below -40 dBFS) — a track's own stops must not land under a talky part
    rdb = 20 * np.log10(rms + 1e-9)
    quiet = rdb < -40
    sil, start = [], None
    for i, q in enumerate(quiet):
        t = ft[i]
        if q and start is None:
            start = t
        if (not q or i == len(quiet) - 1) and start is not None:
            if t - start >= 0.25:
                sil.append([round(float(start), 2), round(float(t), 2)])
            start = None

    # energy sections: smooth per-bar energy, split where the level changes by >= 0.12 for >= 2 bars
    e = np.array([b["energy"] for b in bars]) if bars else np.zeros(0)
    sections = []
    if len(e):
        k = 3
        es = np.convolve(np.pad(e, (k // 2, k // 2), mode="edge"), np.ones(k) / k, mode="valid")
        cur = 0
        for i in range(1, len(es)):
            seg_mean = es[cur:i].mean()
            if abs(es[i] - seg_mean) >= 0.12 and (i + 1 < len(es) and abs(es[i + 1] - seg_mean) >= 0.12) and i - cur >= 2:
                sections.append((cur, i)); cur = i
        sections.append((cur, len(es)))
    sec_out = []
    for (a, b) in sections:
        seg = bars[a:b]
        em = float(np.mean([s["energy"] for s in seg]))
        trend = float(seg[-1]["energy"] - seg[0]["energy"]) if len(seg) > 1 else 0.0
        bright = float(np.mean([s["centroid_hz"] for s in seg]))
        sec_out.append({"start": seg[0]["t"], "end": seg[-1]["end"], "bars": len(seg), "energy": round(em, 3),
                        "trend": round(trend, 3), "shape": "build" if trend > 0.15 else ("fall" if trend < -0.15 else "flat"),
                        "moods": mood_tags(em, key["mode"] if key["key_confidence"] >= 0.12 else None, bright, bpm, trend)})
    # buildups (3+ bars rising) and drops (jump up after a low bar) / breakdowns (jump down)
    events = []
    for i in range(1, len(e)):
        d = e[i] - e[i - 1]
        if d >= 0.18:
            events.append({"t": bars[i]["t"], "type": "drop", "delta": round(float(d), 3)})
        elif d <= -0.18:
            events.append({"t": bars[i]["t"], "type": "breakdown", "delta": round(float(d), 3)})
    for i in range(len(e) - 3):
        if all(np.diff(e[i:i + 4]) > 0.02):
            events.append({"t": bars[i]["t"], "type": "buildup", "until": bars[i + 3]["end"]})

    stem = os.path.splitext(os.path.basename(path))[0]
    if has_vocals is None and ("instr" in stem.lower() or "instrumental" in stem.lower()):
        has_vocals = False
    return {
        "file": os.path.abspath(path), "title": title or stem, "duration": round(dur, 2), "rights": rights,
        "has_vocals": has_vocals, "bpm": round(bpm, 2), "bpm_correction": corrected,
        "bpm_alt": round(bpm / 2 if bpm >= 120 else bpm * 2 if bpm < 85 else bpm, 2),  # half/double ambiguity; 2:1 still blends
        **key, "mode_reliable": key["key_confidence"] >= 0.12,
        "beats": [round(float(b), 3) for b in beats], "downbeats": [round(float(b), 3) for b in downbeats],
        "phrases_4bar": [round(float(b), 3) for b in downbeats[::4]], "phrases_8bar": [round(float(b), 3) for b in downbeats[::8]],
        "bars": bars, "silences": sil, "sections": sec_out, "events": sorted(events, key=lambda x: x["t"]),
        "energy_mean": round(float(e.mean()), 3) if len(e) else None,
        "energy_range": [round(float(e.min()), 3), round(float(e.max()), 3)] if len(e) else None,
        "moods": mood_tags(float(e.mean()) if len(e) else 0.4, key["mode"] if key["key_confidence"] >= 0.12 else None,
                           float(np.median(cent)), bpm, 0),
    }


def mood_tags(energy, mode, bright, bpm, trend):
    """Rule-based mood tags (see references/emotion-map.md). Several can apply."""
    tags = []
    minor = mode == "min"
    if energy < 0.40:
        tags += ["calm"] + (["reflective"] if minor else ["warm"] if mode == "maj" else [])
        if bright > 2600: tags.append("dreamy")
    elif energy < 0.62:
        tags += ["tense"] if minor else ["curious"]
        if bpm >= 95 and mode == "maj": tags.append("playful")
        if minor and bright < 1800: tags.append("dark")
    else:
        tags += ["intense"]
        if minor:
            tags += ["dark", "aggressive"] if bright < 2200 else ["driving"]
        elif mode == "maj":
            tags += ["driving", "hype", "triumphant"]
        else:  # key unreliable: bright + energetic reads as hype, dull + energetic as driving
            tags += ["driving"] + (["hype"] if bright > 1800 else [])
    if trend > 0.15: tags.append("rising")
    if trend < -0.15: tags.append("releasing")
    return sorted(set(tags))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tracks", nargs="+")
    ap.add_argument("--out-dir", default="analysis")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--has-vocals", choices=["yes", "no"])
    ap.add_argument("--rights")
    ap.add_argument("--title")
    ap.add_argument("--root", help="store file paths relative to this folder (e.g. _Global library/music) so the cache works on any machine")
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    for p in a.tracks:
        stem = os.path.splitext(os.path.basename(p))[0]
        out = os.path.join(a.out_dir, stem + ".json")
        st = os.stat(p)
        sig = f"{st.st_size}:{int(st.st_mtime)}"
        if os.path.exists(out) and not a.force:
            try:
                if json.load(open(out)).get("_sig") == sig:
                    print(f"cached  {out}"); continue
            except Exception:
                pass
        hv = None if a.has_vocals is None else a.has_vocals == "yes"
        d = analyse(p, hv, a.rights, a.title if len(a.tracks) == 1 else None)
        d["_sig"] = sig
        if a.root:
            d["file"] = os.path.relpath(os.path.abspath(p), os.path.abspath(a.root))
        json.dump(d, open(out, "w"), indent=1)
        print(f"{stem}: {d['bpm']} BPM{' ('+d['bpm_correction']+')' if d['bpm_correction'] else ''}, {d['key']} = {d['camelot']} "
              f"(conf {d['key_confidence']}), energy {d['energy_range']}, {len(d['sections'])} sections, "
              f"{len(d['silences'])} breaks, moods {d['moods']}")


if __name__ == "__main__":
    main()
