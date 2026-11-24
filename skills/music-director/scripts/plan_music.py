#!/usr/bin/env python3
"""Plan an emotional music score for a video: which track plays under each story section,
from which bar, and how each switch happens.

Usage:
  plan_music.py arc.json analysis/*.json [--out music_plan.json] [--top 6]

arc.json (written by the music director from the script/beats; see references/arc-and-transitions.md):
{
  "duration": 52.0,
  "rights": "copyright_free" | "copyrighted_ok",
  "cuts": [3.1, 7.4, ...],                 # picture cut times (s), optional: switches snap to them
  "vo_words": "words.json",                # optional: [{"start","end"}...]; switches avoid landing mid-word
  "min_section_s": 5, "max_switches_per_min": 4,
  "sections": [
    {"start": 0,  "end": 3.2, "mood": "intense",  "note": "hook"},
    {"start": 3.2,"end": 14,  "mood": "curious",  "energy": 0.45, "vo": true},
    {"start": 14, "end": 24,  "mood": "tense",    "shape": "build", "vo": true},
    {"start": 24, "end": 31,  "mood": "triumphant","vo": false, "note": "voiceless payoff"},
    {"start": 31, "end": 36,  "mood": "silence"},                      # music off (a deliberate stop)
    {"start": 36, "end": 52,  "mood": "warm", "vo": true, "note": "CTA"}
  ],
  "pin": {"2": {"track": "song_bigdawgs_instr", "src": 50.7}},         # optional: force a track/start per section index
  "allow_tracks": ["song_bigdawgs_instr"],                             # optional: restrict the candidates
  "mode": "arc" | "one_track"      # one_track = the style's "one popular track, no switches": best offset + strip-backs
}
"""
import argparse, glob, json, math, os, sys
import numpy as np

MOOD_ENERGY = {"calm": .25, "reflective": .28, "warm": .32, "dreamy": .30, "curious": .48, "playful": .52,
               "tense": .52, "dark": .56, "driving": .70, "intense": .75, "aggressive": .80, "hype": .80, "triumphant": .78}
FAMILY = {"calm": 0, "reflective": 0, "warm": 0, "dreamy": 0, "curious": 1, "playful": 1, "tense": 2, "dark": 2,
          "driving": 3, "intense": 3, "aggressive": 3, "hype": 4, "triumphant": 4}
# families on the arousal ladder: neighbours partly fit (curious~tense, intense~hype)
FAMILY_NEIGHBOURS = {0: {1}, 1: {0, 2}, 2: {1, 3}, 3: {2, 4}, 4: {3}}
FREE_RIGHTS = ("royalty-free", "cc-by", "cc0", "licensed", "purchased", "public domain", "youtube audio library", "client")


def camelot_compat(a, b):
    """1 same/adjacent/relative, 0.5 two steps (energy boost +2 / diagonal), 0 clash."""
    if not a or not b:
        return 0.5
    na, la, nb, lb = int(a[:-1]), a[-1], int(b[:-1]), b[-1]
    d = min((na - nb) % 12, (nb - na) % 12)
    if la == lb and d <= 1:
        return 1.0
    if na == nb:
        return 1.0  # relative major/minor
    if la == lb and d == 2:
        return 0.5
    if la != lb and d == 1:
        return 0.5
    return 0.0


def bpm_compat(x, y):
    r = max(x, y) / max(min(x, y), 1e-6)
    r = min(abs(r - 1), abs(r - 2))  # 2:1 blends work
    return 1.0 if r < 0.04 else (0.6 if r < 0.08 else 0.0)


def load_tracks(paths, rights):
    out = []
    for p in paths:
        d = json.load(open(p))
        if rights == "copyright_free" and not any(k in (d.get("rights") or "").lower() for k in FREE_RIGHTS):
            continue
        d["_id"] = os.path.splitext(os.path.basename(p))[0]
        d["_bar_t"] = np.array([b["t"] for b in d["bars"]])
        d["_bar_e"] = np.array([b["energy"] for b in d["bars"]])
        out.append(d)
    return out


def merge_sections(secs, min_len, max_per_min, duration):
    """Merge sections that are too short or too similar so the music doesn't switch too often."""
    s = [dict(x) for x in secs]
    for x in s:
        x["energy"] = x.get("energy", MOOD_ENERGY.get(x["mood"], 0.0 if x["mood"] == "silence" else .5))
        x["shape"] = x.get("shape", "flat")
        x["notes"] = [x.get("note")] if x.get("note") else []
    def similar(a, b):
        return a["mood"] != "silence" and b["mood"] != "silence" and FAMILY.get(a["mood"]) == FAMILY.get(b["mood"]) \
            and abs(a["energy"] - b["energy"]) < 0.15
    changed = True
    while changed:
        changed = False
        for i in range(len(s) - 1):
            a, b = s[i], s[i + 1]
            short = (b["end"] - b["start"] < min_len and b["mood"] != "silence") or (a["end"] - a["start"] < min_len and a["mood"] != "silence" and i > 0)
            if similar(a, b) or (short and a["mood"] != "silence" and b["mood"] != "silence" and i + 1 < len(s) - 1):
                w1, w2 = a["end"] - a["start"], b["end"] - b["start"]
                keep = a if w1 >= w2 else b
                m = dict(keep); m["start"], m["end"] = a["start"], b["end"]
                m["energy"] = (a["energy"] * w1 + b["energy"] * w2) / (w1 + w2)
                m["vo"] = a.get("vo", True) or b.get("vo", True)
                m["notes"] = a["notes"] + b["notes"]
                if a["shape"] == "build" or b["shape"] == "build": m["shape"] = "build"
                s[i:i + 2] = [m]; changed = True; break
    allowed = max(1, int(max_per_min * duration / 60))
    warn = None
    if len(s) - 1 > allowed:
        warn = f"{len(s)} music sections in {duration:.0f}s allow up to {len(s)-1} changes (limit {allowed} at {max_per_min}/min); the plan keeps a track through turns where it fits"
    return s, warn


def window_score(t, sec, start, L):
    """How well track t played from `start` for L seconds fits section `sec`."""
    if start + L > t["duration"] - 0.3:
        return -9, {}
    m = (t["_bar_t"] >= start - 1e-3) & (t["_bar_t"] < start + L)
    if m.sum() == 0:
        return -9, {}
    e = t["_bar_e"][m]
    mean_e = float(e.mean())
    score = -4.0 * abs(mean_e - sec["energy"])  # energy fit dominates; mood tags refine
    trend = float(e[-1] - e[0]) if len(e) > 1 else 0.0
    if sec["shape"] == "build":
        score += 1.2 * np.clip(trend, -0.3, 0.4)
    elif sec["shape"] == "fall":
        score += 1.2 * np.clip(-trend, -0.3, 0.4)
    else:
        score -= 1.0 * float(e.std())  # flat sections want a steady bed
    # mood tags of the track's sections overlapping this window
    tags = []
    for s in t["sections"]:
        ov = min(s["end"], start + L) - max(s["start"], start)
        if ov > 0:
            tags += s["moods"] * max(1, int(ov))
    mood = sec["mood"]
    if tags:
        exact = tags.count(mood) / len(tags)
        fam = sum(1 for x in tags if FAMILY.get(x) == FAMILY.get(mood)) / len(tags)
        near = sum(1 for x in tags if FAMILY.get(x) in FAMILY_NEIGHBOURS.get(FAMILY.get(mood), set())) / len(tags)
        score += 1.0 * exact + 0.6 * fam + 0.35 * near
    # the track's own breaks must not fall inside a voiced section
    for a, b in t.get("silences", []):
        if a < start + L and b > start and (b - a) > 0.25:
            score -= 2.0 if sec.get("vo", True) else 0.5
    if sec.get("vo", True) and t.get("has_vocals"):
        score -= 5.0
    # land the track's own drop on a story turn that rises (DJ "pre-drop" trick), its breakdown on a release
    for ev in t.get("events", []):
        if abs(ev["t"] - start) < 0.35:
            if ev["type"] == "drop" and sec.get("_rise", 0) >= 0.2:
                score += 0.8 * max(0.0, 1 - abs(mean_e - sec["energy"]) / 0.15)  # only if what follows the drop is big enough
            if ev["type"] == "breakdown" and sec.get("_rise", 0) <= -0.2:
                score += 0.5
    # starting on a 4-bar phrase sounds intentional
    if any(abs(start - p) < 0.05 for p in t.get("phrases_4bar", [])):
        score += 0.3
    return score, {"mean_energy": round(mean_e, 3), "trend": round(trend, 3)}


def plan_one_track(arc, tracks):
    """Style rule 'one track under everything': find the track + start offset whose own energy best follows
    the arc (its drop on the payoff, quieter bars under the talky setup), then automate strip-backs where
    it is still too hot. No switches."""
    dur = arc["duration"]
    secs, _ = merge_sections(arc["sections"], 0.01, 999, dur)
    for i in range(len(secs)):
        secs[i]["_rise"] = secs[i]["energy"] - secs[i - 1]["energy"] if i else 0
    best = (-1e9, None, None, None)
    for ti, t in enumerate(tracks):
        for st in t["downbeats"]:
            if st + dur > t["duration"] - 0.3:
                break
            tot, infos = 0.0, []
            for sec in secs:
                if sec["mood"] == "silence":
                    infos.append({}); continue
                sc, info = window_score(t, dict(sec, vo=sec.get("vo", True)), st + sec["start"], sec["end"] - sec["start"])
                tot += sc * (sec["end"] - sec["start"]) / dur * len(secs); infos.append(info)
            if tot > best[0]:
                best = (tot, ti, st, infos)
    sc, ti, st, infos = best
    t = tracks[ti]
    seg = {"section": 0, "start": 0.0, "end": dur, "mood": secs[0]["mood"], "target_energy": round(secs[0]["energy"], 3),
           "shape": "flat", "vo": True, "notes": [], "track": t["_id"], "file": t["file"], "title": t["title"],
           "rights": t.get("rights"), "src_start": round(st, 3), "bpm": t["bpm"], "camelot": t["camelot"], "fit": round(sc, 2),
           "mean_energy": infos[0].get("mean_energy"), "transition_in": {"type": "start", "fade_in_s": 0.0}, "automation": []}
    # relative shaping: the highest-target section plays the track as is; every other section is stripped back
    # by how much hotter it is than the arc asks for, relative to that peak (one track can't get louder than itself)
    live = [(sec, info) for sec, info in zip(secs, infos) if sec["mood"] != "silence" and info]
    peak_sec, peak_info = max(live, key=lambda x: x[0]["energy"])
    offset = peak_info["mean_energy"] - peak_sec["energy"]
    for k, (sec, info) in enumerate(zip(secs, infos)):
        if sec["mood"] == "silence":
            seg["automation"].append({"t": sec["start"], "type": "mute", "until": sec["end"], "gain_db": -60})
            continue
        d = sec["energy"] - (info.get("mean_energy", sec["energy"]) - offset)
        if d < -0.12:
            a = {"t": sec["start"], "type": "strip_back", "delta": round(d, 3), "lpf_hz": int(np.clip(3500 + d * 6000, 1200, 3500)), "gain_db": round(max(d * 6, -4), 1)}
        else:
            a = {"t": sec["start"], "type": "hold", "delta": round(d, 3), "lpf_hz": None, "gain_db": 0.0}
        if k == 0:
            seg["start_automation"] = a  # applied from the first frame
            if a["type"] != "hold":
                seg["automation"].append(dict(a, t=0.0))
        else:
            seg["automation"].append(a)
    seg["section_fit"] = [{"start": s["start"], "end": s["end"], "mood": s["mood"], "target": round(s["energy"], 2), "measured": i.get("mean_energy")}
                          for s, i in zip(secs, infos)]
    return {"duration": dur, "rights": arc.get("rights"), "mode": "one_track", "segments": [seg], "cues": [], "notes": [], "switches": 0}


def plan(arc, tracks, top=6):
    if arc.get("mode") == "one_track":
        return plan_one_track(arc, tracks)
    dur = arc["duration"]
    secs, warn = merge_sections(arc["sections"], arc.get("min_section_s", 5), arc.get("max_switches_per_min", 4), dur)
    pins = {int(k): v for k, v in arc.get("pin", {}).items()}
    for i in range(len(secs)):
        secs[i]["_rise"] = secs[i]["energy"] - secs[i - 1]["energy"] if i and secs[i - 1]["mood"] != "silence" else 0
    cands = []  # per section: list of (score, track_idx, start, info)
    for i, sec in enumerate(secs):
        L = sec["end"] - sec["start"]
        if sec["mood"] == "silence":
            cands.append([(0.0, None, None, {})]); continue
        lst = []
        for ti, t in enumerate(tracks):
            if i in pins and pins[i]["track"] != t["_id"]:
                continue
            starts = [pins[i]["src"]] if i in pins else t["downbeats"]
            best = []
            for st in starts:
                sc, info = window_score(t, sec, st, L)
                best.append((sc, ti, st, info))
            best.sort(key=lambda x: -x[0])
            # keep the best 2 windows per track, spread apart
            kept = []
            for b in best:
                if all(abs(b[2] - k[2]) > 8 for k in kept):
                    kept.append(b)
                if len(kept) == 2:
                    break
            lst += kept
        lst.sort(key=lambda x: -x[0])
        cands.append(lst[:top])

    # add "continue the previous track" candidates (one track can carry several sections)
    for i in range(1, len(secs)):
        if secs[i]["mood"] == "silence":
            continue
        L = secs[i]["end"] - secs[i]["start"]
        extra = []
        for (_, ti, st, _) in cands[i - 1]:
            if ti is None:
                continue
            nst = st + (secs[i - 1]["end"] - secs[i - 1]["start"])
            sc, info = window_score(tracks[ti], secs[i], nst, L)
            if sc > -9:
                info["continued"] = True
                extra.append((sc, ti, nst, info))
        cands[i] += extra

    # Viterbi over sections
    n = len(secs)
    V = [{} for _ in range(n)]
    for j, c in enumerate(cands[0]):
        V[0][j] = (c[0], None)
    for i in range(1, n):
        for j, c in enumerate(cands[i]):
            best = (-1e9, None)
            for k, (pv, _) in V[i - 1].items():
                p = cands[i - 1][k]
                tr = transition_value(p, c, secs[i - 1], secs[i], tracks)
                if pv + c[0] + tr > best[0]:
                    best = (pv + c[0] + tr, k)
            V[i][j] = best
    j = max(V[-1], key=lambda k: V[-1][k][0])
    path = []
    for i in range(n - 1, -1, -1):
        path.append(j); j = V[i][j][1]
    path.reverse()

    cuts = sorted(arc.get("cuts", []))
    words = []
    if arc.get("vo_words") and os.path.exists(arc["vo_words"]):
        w = json.load(open(arc["vo_words"]))
        words = w.get("words", w) if isinstance(w, dict) else w
    segs, cues, notes = [], [], []
    if warn:
        notes.append(warn)
    for i, j in enumerate(path):
        sc, ti, st, info = cands[i][j]
        sec = secs[i]
        t0 = sec["start"]
        if i > 0:
            t0 = snap_switch(sec["start"], cuts, words, notes)
        seg = {"section": i, "start": round(t0, 3), "end": round(sec["end"], 3), "mood": sec["mood"],
               "target_energy": round(sec["energy"], 3), "shape": sec["shape"], "vo": sec.get("vo", True), "notes": sec["notes"]}
        if ti is None:
            seg.update(track=None)
        else:
            t = tracks[ti]
            seg.update(track=t["_id"], file=t["file"], title=t["title"], rights=t.get("rights"),
                       src_start=round(st, 3), bpm=t["bpm"], camelot=t["camelot"],
                       fit=round(sc, 2), **info)
        segs.append(seg)
    # fix ends to next start, decide transitions
    for i in range(len(segs)):
        if i + 1 < len(segs):
            segs[i]["end"] = segs[i + 1]["start"]
    merged = []
    for s in segs:  # merge continued segments of one track into one playing segment
        if merged and s.get("continued") and merged[-1].get("track") == s.get("track"):
            prev = merged[-1]
            prev.setdefault("automation", []).append(level_move(prev, s))
            prev["end"] = s["end"]; prev["notes"] += s["notes"]
            continue
        merged.append(s)
    for i in range(1, len(merged)):
        a, b = merged[i - 1], merged[i]
        b["transition_in"] = choose_transition(a, b, tracks)
        tt = b["transition_in"]["type"]
        if tt == "stop_drop":
            cues.append({"t": b["start"], "type": "impact", "why": "music re-enters after the stop"})
            cues.append({"t": round(b["start"] - tt_beats(a, 2), 3), "type": "riser_or_reverse", "len_s": round(tt_beats(a, 2), 3)})
        elif tt == "hard_cut" and b["target_energy"] - a["target_energy"] > 0.15:
            cues.append({"t": b["start"], "type": "impact"})
        elif tt == "echo_out":
            cues.append({"t": b["start"], "type": "whoosh_soft_or_none"})
        elif tt == "to_silence":
            cues.append({"t": b["start"], "type": "reverb_tail_or_hit", "why": "deliberate stop: let the line land"})
    if merged and merged[0].get("track"):
        merged[0]["transition_in"] = {"type": "start", "fade_in_s": 0.0 if merged[0]["target_energy"] > 0.6 else 0.25}
    for s in merged:
        if s.get("track") and s.get("mean_energy") is not None:
            s["gain_db"] = round((s["target_energy"] - 0.5) * 6, 1)  # deliberate +-3 dB around the bed level
    return {"duration": dur, "rights": arc.get("rights"), "segments": merged, "cues": cues, "notes": notes,
            "switches": sum(1 for s in merged[1:] if s.get("transition_in", {}).get("type") not in (None,))}


def tt_beats(seg, n):
    return n * 60.0 / seg.get("bpm", 100) if seg.get("track") else 0.5


def level_move(prev, s):
    """Same track continues into a section with a different target: automate filter/level (strip back / open up)."""
    d = s["target_energy"] - prev["target_energy"]
    kind = "strip_back" if d < -0.12 else ("open_up" if d > 0.12 else "hold")
    return {"t": s["start"], "type": kind, "delta": round(d, 3),
            "lpf_hz": int(np.clip(3500 + d * 6000, 1200, 3500)) if kind == "strip_back" else None,
            "gain_db": round(max(min(d * 6, 2), -5), 1) if kind != "hold" else 0.0}


def transition_value(p, c, sa, sb, tracks):
    """Viterbi edge value between two consecutive section choices."""
    if p[1] is None or c[1] is None:
        return 0.0
    if p[1] == c[1]:
        contiguous = abs(c[2] - (p[2] + (sa["end"] - sa["start"]))) < 0.6
        if not contiguous:
            return -0.2  # internal jump inside one track (cut on a downbeat)
        # carrying one track through a story turn only pays if the track itself turns there
        return 0.5 if abs(sb["energy"] - sa["energy"]) < 0.15 else 0.0
    ta, tb = tracks[p[1]], tracks[c[1]]
    v = -0.35  # every switch costs a little: switch only when the story turns
    de = abs(sb["energy"] - sa["energy"])
    if de < 0.15:  # similar mood: a blend, so key and tempo matter
        v += 0.4 * camelot_compat(ta["camelot"], tb["camelot"]) + 0.3 * bpm_compat(ta["bpm"], tb["bpm"]) - 0.3
    else:
        v += 0.1 * camelot_compat(ta["camelot"], tb["camelot"])
    return v


def choose_transition(a, b, tracks):
    if b.get("track") is None:
        return {"type": "to_silence", "tail": "echo" if a.get("track") else None, "beats": 3}
    if a.get("track") is None:
        return {"type": "from_silence", "fade_in_s": 0.0}
    de = b["target_energy"] - a["target_energy"]
    ka = camelot_compat(a.get("camelot"), b.get("camelot"))
    kb = bpm_compat(a.get("bpm", 100), b.get("bpm", 100))
    if de >= 0.25:
        return {"type": "stop_drop", "gap_beats": 0.5, "why": f"energy jump +{de:.2f}: a short stop then the drop lands on the switch"}
    if de <= -0.25:
        return {"type": "echo_out", "echo_beats": 1, "repeats": 3, "decay": 0.45, "incoming_fade_bars": 0.5,
                "why": f"energy release {de:.2f}: outgoing echoes away, calm bed fades under"}
    if ka >= 0.5 and kb >= 0.6:
        return {"type": "filter_blend", "bars": 1, "max_s": 2.5, "why": "similar energy, compatible key/tempo: low-pass out, high-pass in, bass swap"}
    return {"type": "hard_cut", "xfade_ms": 25, "why": "similar energy but key/tempo clash: cut on the downbeat (and a picture cut)"}


def snap_switch(t, cuts, words, notes):
    near = [c for c in cuts if abs(c - t) <= 0.4]
    if near:
        return min(near, key=lambda c: abs(c - t))
    for w in words:
        if w["start"] + 0.02 < t < w["end"] - 0.02:
            gap_end = w["end"]
            notes.append(f"switch at {t:.2f}s moved to {gap_end:.2f}s (was inside a word)")
            return gap_end
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arc")
    ap.add_argument("analyses", nargs="+")
    ap.add_argument("--out", default="music_plan.json")
    ap.add_argument("--top", type=int, default=6)
    a = ap.parse_args()
    arc = json.load(open(a.arc))
    paths = [p for g in a.analyses for p in glob.glob(g)]
    tracks = load_tracks(paths, arc.get("rights", "copyright_free"))
    if arc.get("allow_tracks"):
        tracks = [t for t in tracks if t["_id"] in arc["allow_tracks"]]
    if not tracks:
        sys.exit("no tracks allowed for this rights mode")
    res = plan(arc, tracks, a.top)
    json.dump(res, open(a.out, "w"), indent=1)
    print(f"{len(tracks)} tracks allowed ({arc.get('rights')}); plan -> {a.out}\n")
    for s in res["segments"]:
        tr = s.get("transition_in", {}).get("type", "")
        if s.get("track"):
            auto = "".join(f"  [{m['type']} @{m['t']}]" for m in s.get("automation", []))
            print(f"{s['start']:6.2f}-{s['end']:6.2f}  {s['mood']:10} E{s['target_energy']:.2f}  <{tr:12}> {s['track']} @ {s['src_start']:.2f}s "
                  f"(measured E{s['mean_energy']}, fit {s['fit']}){auto}")
        else:
            print(f"{s['start']:6.2f}-{s['end']:6.2f}  {'silence':10}        <{tr:12}>")
    for c in res["cues"]:
        print(f"  cue {c['t']:6.2f}s  {c['type']}")
    for n in res["notes"]:
        print("  note:", n)


if __name__ == "__main__":
    main()
