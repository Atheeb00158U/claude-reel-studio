#!/usr/bin/env python3
"""Render a music_plan.json (from plan_music.py) into the music bus: segments level-matched to their
target energy, switches made with DJ transitions (hard cut, filter blend with bass swap, stop-drop,
echo-out, to/from silence), same-track automation (strip back / open up).

Usage:
  score_mix.py music_plan.json [--out music_bus.wav] [--vo vo.wav --duck-db 10.5] [--plot energy.png] [--sr 48000]

The bus is unmastered (peaks <= -1 dBFS, bed at about -20 dBFS RMS). sound-design's mixer takes it as the
music stem (keep ducking there) — or pass --vo for a quick ducked preview.
Transition ideas adapted from AI-DJ-Mixing-System (MIT): progressive EQ, echo transition, phrase/downbeat
alignment. Code is our own.
"""
import argparse, json, os, sys, warnings
import numpy as np

warnings.filterwarnings("ignore")
import librosa, soundfile as sf

N_FFT, HOP = 2048, 512
BED_RMS_DB = -20.0
_cache = {}


MUSIC_ROOT = os.environ.get("MUSIC_ROOT", "")


def resolve(path):
    """Analysis files store paths relative to the library music folder: resolve via --music-root / $MUSIC_ROOT."""
    if os.path.exists(path):
        return path
    for root in (MUSIC_ROOT, os.getcwd()):
        q = os.path.join(root, path)
        if root and os.path.exists(q):
            return q
    sys.exit(f"track not found: {path} (set --music-root to the library's music folder)")


def load(path, sr):
    path = resolve(path)
    if path not in _cache:
        y, _ = librosa.load(path, sr=sr, mono=False)
        if y.ndim == 1:
            y = np.vstack([y, y])
        _cache[path] = y.astype(np.float32)
    return _cache[path]


def take(y, a, b):
    """Samples [a, b) of y, zero-padded outside the track."""
    n = y.shape[1]
    out = np.zeros((2, max(0, b - a)), np.float32)
    s, e = max(a, 0), min(b, n)
    if e > s:
        out[:, s - a:e - a] = y[:, s:e]
    return out


def tv_filter(x, sr, cut_hz, kind="low"):
    """Time-varying low/high-pass via an STFT mask. cut_hz: array (one value per STFT frame) or scalar."""
    out = np.zeros_like(x)
    f = librosa.fft_frequencies(sr=sr, n_fft=N_FFT)[:, None]
    for ch in range(x.shape[0]):
        X = librosa.stft(x[ch], n_fft=N_FFT, hop_length=HOP)
        c = np.broadcast_to(np.atleast_1d(cut_hz), (X.shape[1],)) if np.ndim(cut_hz) else np.full(X.shape[1], cut_hz)
        c = np.interp(np.arange(X.shape[1]), np.linspace(0, X.shape[1] - 1, len(c)), c)[None, :]
        k = np.clip((np.log2(f + 1) - np.log2(c + 1)) * 6, -30, 30)  # ~6 dB/oct-ish soft knee in log-frequency
        m = 1 / (1 + np.exp(k)) if kind == "low" else 1 / (1 + np.exp(-k))
        out[ch] = librosa.istft(X * m, hop_length=HOP, length=x.shape[1])
    return out


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def ramp(n, a, b, shape="lin"):
    t = np.linspace(0, 1, max(n, 1), dtype=np.float32)
    if shape == "pow_in":
        return np.sin(t * np.pi / 2) ** 1 * (b - a) + a if a < b else np.cos(t * np.pi / 2) * (a - b) + b
    return a + (b - a) * t


def render(plan, sr=48000):
    dur = plan["duration"]
    N = int((dur + 4) * sr)
    bus = np.zeros((2, N), np.float32)
    segs = plan["segments"]
    S = lambda t: int(round(t * sr))
    log = []
    for i, s in enumerate(segs):
        if not s.get("track"):
            continue
        y = load(s["file"], sr)
        beat_in = 60.0 / s.get("bpm", 100)
        tin = s.get("transition_in", {"type": "start"})
        nxt = segs[i + 1] if i + 1 < len(segs) else None
        tout = (nxt or {}).get("transition_in", {"type": "end"})
        start, end = s["start"], s["end"]
        pre = 0.0
        if tin["type"] == "filter_blend":
            pre = min(tin.get("bars", 1) * 4 * beat_in, tin.get("max_s", 2.5))
        elif tin["type"] == "hard_cut":
            pre = tin.get("xfade_ms", 25) / 2000
        post = 0.0
        if tout["type"] in ("hard_cut",):
            post = tout.get("xfade_ms", 25) / 2000
        if tout["type"] == "end":
            post = 0.0
        a_t, b_t = start - pre, end + post
        src0 = s["src_start"] - pre
        x = take(y, S(src0), S(src0) + S(b_t - a_t))
        # level: body RMS to the bed level, then the deliberate offset for this section's energy
        body = x[:, S(pre):S(pre + (end - start))]
        g_db = BED_RMS_DB - rms_db(body) + s.get("gain_db", 0.0)
        x *= 10 ** (g_db / 20)
        n = x.shape[1]
        env = np.ones(n, np.float32)
        # ---- incoming side
        if tin["type"] == "filter_blend":
            k = S(pre)
            hp = np.concatenate([np.linspace(400, 400, k // 2), np.linspace(400, 20, k - k // 2), np.full(n - k, 20)])
            hp_frames = hp[::HOP][: n // HOP + 1]
            x = tv_filter(x, sr, hp_frames, "high")
            env[:k] = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
        elif tin["type"] == "hard_cut":
            k = max(1, S(2 * pre)); env[:k] = np.linspace(0, 1, k)
        elif tin["type"] in ("start", "from_silence", "stop_drop"):
            k = max(1, S(tin.get("fade_in_s", 0.005))); env[:k] = np.linspace(0, 1, k)
        elif tin["type"] == "echo_out":
            k = max(1, S(tin.get("incoming_fade_bars", 0.5) * 4 * beat_in)); env[:k] = np.linspace(0, 1, k) ** 1.5
        # ---- same-track automation: strip back (low-pass + dip), open up (filter off + lift), mute (deliberate stop)
        if s.get("automation"):
            cut = np.full(n, 20000.0); gdb = np.zeros(n)
            cur_c, cur_g = 20000.0, 0.0
            events = []
            for m in sorted(s["automation"], key=lambda m: m["t"]):
                if m["type"] == "mute":
                    events.append((m["t"], cur_c, -60.0, 0.03)); events.append((m["until"], cur_c, cur_g, 0.005))
                else:
                    cur_c = float(m.get("lpf_hz") or 20000.0); cur_g = float(m.get("gain_db", 0.0))
                    events.append((m["t"], cur_c, cur_g, beat_in))
            pc, pg = 20000.0, 0.0
            for (tt, c, g, rl) in events:
                k0 = S(pre + (tt - start)); kr = max(1, S(rl))
                if k0 >= n:
                    break
                k1 = min(n, k0 + kr)
                cut[k0:k1] = np.geomspace(pc, c, k1 - k0); cut[k1:] = c
                gdb[k0:k1] = np.linspace(pg, g, k1 - k0); gdb[k1:] = g
                pc, pg = c, g
            if cut.min() < 19000:
                x = tv_filter(x, sr, cut[::HOP][: n // HOP + 1], "low")
            env *= (10 ** (gdb / 20)).astype(np.float32)
        # ---- outgoing side
        tail = None
        if tout["type"] == "filter_blend":
            beat_nx = 60.0 / nxt.get("bpm", 100)
            o = min(tout.get("bars", 1) * 4 * beat_nx, tout.get("max_s", 2.5))
            k0, k1 = S(pre + (end - start) - o), S(pre + (end - start))
            cut = np.full(n, 20000.0); cut[k0:k1] = np.geomspace(16000, 300, k1 - k0); cut[k1:] = 300
            x = tv_filter(x, sr, cut[::HOP][: n // HOP + 1], "low")
            env[k0:k1] *= np.cos(np.linspace(0, np.pi / 2, k1 - k0)) ** 2; env[k1:] = 0
        elif tout["type"] == "hard_cut":
            k = max(1, S(2 * post)); env[-k:] *= np.linspace(1, 0, k)
        elif tout["type"] == "stop_drop":
            gap = float(np.clip(tout.get("gap_beats", 0.5) * beat_in, 0.2, 0.6))
            k1 = S(pre + (end - start) - gap); kf = S(0.03)
            env[k1 - kf:k1] *= np.linspace(1, 0, kf); env[k1:] = 0
        elif tout["type"] in ("echo_out", "to_silence"):
            k1 = S(pre + (end - start)); kf = S(0.02)
            reps = tout.get("repeats", tout.get("beats", 3)); dec = tout.get("decay", 0.45)
            src = x[:, max(0, k1 - S(beat_in)):k1] * env[max(0, k1 - S(beat_in)):k1]
            src = tv_filter(src, sr, 2500, "low")
            tl = S(beat_in) * (reps + 1)
            tail = np.zeros((2, tl), np.float32)
            for r in range(reps):
                o = S(beat_in) * r
                piece = src * (dec ** (r + 1))
                piece[:, -S(0.05):] *= np.linspace(1, 0, S(0.05))
                tail[:, o:o + piece.shape[1]] += piece[:, : tl - o]
            env[k1 - kf:k1] *= np.linspace(1, 0, kf); env[k1:] = 0
        elif tout["type"] == "end":
            k = S(min(1.5, end - start)); env[-k:] *= np.linspace(1, 0, k) ** 1.5
        x *= env
        a = S(a_t)
        lo, hi = max(a, 0), min(a + n, N)
        bus[:, lo:hi] += x[:, lo - a:hi - a]
        if tail is not None:
            t0 = S(end)
            bus[:, t0:t0 + tail.shape[1]] += tail[:, : N - t0]
        log.append(f"{start:6.2f}-{end:6.2f} {s['track']} @{s['src_start']:.2f}  gain {g_db:+.1f} dB  in:{tin['type']} out:{tout['type']}")
    bus = bus[:, : S(dur)]
    pk = np.abs(bus).max()
    if pk > 0.89:
        bus *= 0.89 / pk
    return bus, log


def duck(bus, vo, sr, duck_db=10.5, att=0.01, rel=0.25):
    v = np.abs(vo).max(axis=0) if vo.ndim == 2 else np.abs(vo)
    v = np.pad(v, (0, max(0, bus.shape[1] - len(v))))[: bus.shape[1]]
    a_c, r_c = np.exp(-1 / (att * sr)), np.exp(-1 / (rel * sr))
    env = np.zeros_like(v); e = 0.0
    hop = 64
    vv = v[::hop]; ee = np.zeros_like(vv)
    a_h, r_h = a_c ** hop, r_c ** hop
    for i, s in enumerate(vv):
        c = a_h if s > e else r_h
        e = c * e + (1 - c) * s; ee[i] = e
    env = np.repeat(ee, hop)[: bus.shape[1]]
    gate = np.clip((20 * np.log10(env + 1e-9) + 45) / 15, 0, 1)  # VO present above ~-45 dBFS
    return bus * 10 ** (-duck_db * gate / 20)


def energy_curve(x, sr, win=0.5):
    y = librosa.to_mono(x) if x.ndim == 2 else x
    y = librosa.resample(y, orig_sr=sr, target_sr=22050)
    hop = int(22050 * win)
    rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
    cent = librosa.feature.spectral_centroid(y=y, sr=22050, hop_length=hop)[0]
    oenv = librosa.onset.onset_strength(y=y, sr=22050, hop_length=512)
    on = librosa.onset.onset_detect(onset_envelope=oenv, sr=22050, hop_length=512, units="time")
    t = np.arange(len(rms)) * win
    od = np.array([((on >= a) & (on < a + 2)).sum() / 2 for a in t])
    nr = lambda v, lo, hi: np.clip((v - lo) / (hi - lo), 0, 1)
    r_db = 20 * np.log10(rms + 1e-9) + (-8 - (BED_RMS_DB + 3))  # map bed level to the analysis scale
    m = min(len(t), len(cent))
    e = 0.40 * nr(od[:m], 1.5, 7) + 0.30 * nr(cent[:m], 400, 2600) + 0.30 * nr(r_db[:m], -24, -8)
    e[r_db[:m] < -40] = 0.0  # silence reads as zero energy
    return t[:m], e


def plot(plan, bus, sr, path):
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    t, e = energy_curve(bus, sr)
    k = 5
    es = np.convolve(np.pad(e, (k // 2, k // 2), mode="edge"), np.ones(k) / k, mode="valid")
    fig, ax = plt.subplots(figsize=(13, 4.2), dpi=130)
    y = librosa.to_mono(bus)[::200]
    ax.fill_between(np.arange(len(y)) * 200 / sr, -np.abs(y) * 0.9 + 0.0, np.abs(y) * 0.9, color="#ddd", lw=0, zorder=0)
    if plan.get("mode") == "one_track":
        for r in plan["segments"][0].get("section_fit", []):
            ax.hlines(r["target"], r["start"], r["end"], colors="#d33", lw=3, zorder=3)
            ax.text((r["start"] + r["end"]) / 2, 0.93, r["mood"], ha="center", fontsize=7.5, color="#d33")
    for s in plan["segments"]:
        if plan.get("mode") != "one_track":
            ax.hlines(s["target_energy"], s["start"], s["end"], colors="#d33", lw=3, zorder=3)
        lbl = (f"{s['mood']}\n" if plan.get("mode") != "one_track" else "") + f"{(s.get('title') or '—')[:22]}"
        ax.text((s["start"] + s["end"]) / 2, 1.04, lbl, ha="center", va="bottom", fontsize=7.5)
        if s.get("transition_in") and s["start"] > 0:
            ax.axvline(s["start"], color="#36c", lw=1, ls="--", zorder=2)
            ax.text(s["start"] + 0.2, 0.03, s["transition_in"]["type"], rotation=90, fontsize=7, color="#36c", va="bottom")
        for m in s.get("automation", []):
            ax.axvline(m["t"], color="#8a2", lw=1, ls=":")
            ax.text(m["t"] + 0.2, 0.03, m["type"], rotation=90, fontsize=7, color="#8a2", va="bottom")
    ax.plot(t, es, color="#222", lw=1.6, zorder=4, label="measured energy (music bus)")
    ax.plot([], [], color="#d33", lw=3, label="target energy (story arc)")
    ax.set_xlim(0, plan["duration"]); ax.set_ylim(0, 1.25); ax.set_xlabel("seconds"); ax.set_yticks([0, .25, .5, .75, 1])
    ax.legend(loc="lower right", fontsize=8); ax.set_title("Music arc: target vs measured", fontsize=10, loc="left")
    fig.tight_layout(); fig.savefig(path); plt.close(fig)
    # how well the music follows the arc, per segment
    rep = []
    rows = plan["segments"][0].get("section_fit") if plan.get("mode") == "one_track" else None
    rows = [{"start": r["start"], "end": r["end"], "mood": r["mood"], "target_energy": r["target"], "track": True} for r in rows] if rows else plan["segments"]
    for s in rows:
        m = (t >= s["start"] + 0.5) & (t < s["end"] - 0.25)
        if m.sum() and s.get("track") and s["mood"] != "silence":
            rep.append((s["start"], s["end"], s["mood"], s["target_energy"], float(e[m].mean())))
    return rep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan")
    ap.add_argument("--out", default="music_bus.wav")
    ap.add_argument("--vo")
    ap.add_argument("--duck-db", type=float, default=10.5)
    ap.add_argument("--plot")
    ap.add_argument("--sr", type=int, default=48000)
    ap.add_argument("--music-root", help="the library's music folder (for relative track paths)")
    a = ap.parse_args()
    global MUSIC_ROOT
    if a.music_root:
        MUSIC_ROOT = a.music_root
    plan = json.load(open(a.plan))
    bus, log = render(plan, a.sr)
    print("\n".join(log))
    sf.write(a.out, bus.T, a.sr, subtype="PCM_24")
    print(f"-> {a.out}  ({bus.shape[1]/a.sr:.1f}s, peak {20*np.log10(np.abs(bus).max()+1e-9):.1f} dBFS)")
    if a.vo:
        vo, _ = librosa.load(a.vo, sr=a.sr, mono=False)
        vo = np.vstack([vo, vo]) if vo.ndim == 1 else vo
        d = duck(bus, vo, a.sr, a.duck_db)
        L = max(d.shape[1], vo.shape[1])
        mix = np.zeros((2, L), np.float32); mix[:, :d.shape[1]] += d; mix[:, :vo.shape[1]] += vo
        mix *= 0.89 / max(np.abs(mix).max(), 1e-9)
        p = os.path.splitext(a.out)[0] + "_with_vo.wav"
        sf.write(p, mix.T, a.sr, subtype="PCM_24"); print(f"-> {p} (ducked {a.duck_db} dB)")
    if a.plot:
        rep = plot(plan, bus, a.sr, a.plot)
        print(f"-> {a.plot}")
        for s0, s1, mood, te, me in rep:
            flag = "" if abs(te - me) < 0.15 else "  <- off target"
            print(f"   {s0:6.2f}-{s1:6.2f} {mood:11} target {te:.2f}  measured {me:.2f}{flag}")


if __name__ == "__main__":
    main()
