# Arcs, switches and transitions

Sources: our own reel work, plus ideas taken (not code) from two DJ projects. **dj-claude** (p-poss, AGPL-3.0: ideas only, no code copied) gave the mood → musical-decision vocabulary, the live-set arc of evolution moves (add layers → strip back → filter sweep → key change …) and "intensify by layers, calm by stripping back". **AI-DJ-Mixing-System** (kckDeepak, MIT) gave beat/downbeat/phrase alignment, BPM half/double correction, energy-curve buildup/drop detection, Camelot key compatibility, progressive EQ and the echo transition.

The big difference from a DJ set: a reel has a voice on top and 30–90 s total. DJ overlaps are 4–16 s; ours are **0–2.5 s**, and switches follow the **story**, not the song.

## Arc templates (pick one, then adjust per beat)

| Template | Sections (mood) | Use for |
| --- | --- | --- |
| **Story turn** (default for ad stories) | hook *intense* → setup *curious* → problem *tense, build* → payoff *triumphant, voiceless* → stop *silence* (0.5–1.5 s) → meaning *reflective* → CTA *warm* | "unusual ads that worked", case studies |
| **Rise** | hook *tense* → build *curious → driving* → peak *hype* → CTA *triumphant* | launches, wins, listicles that escalate |
| **Fall and rise** | hook *intense* → fall *dark/reflective* (the failure) → turn *silence* → rise *driving* → peak *triumphant* | comeback stories, before/after |
| **Steady bed** | one mood, small strip-backs only | explainers, client walkthroughs, tutorials |
| **One track** (`mode: one_track`) | the arc as a shape on a single song: the best start offset (its drop on the payoff), strip-backs under talky parts | Gridd's "one popular track, no switches" rule |

## When to switch music

- Only on a **story turn** (a new beat whose mood family changes). Not on every sentence.
- At most **3–4 switches per minute** (`max_switches_per_min`), sections ≥ 5 s. The planner merges similar neighbours and keeps one track through a turn when that track's own energy already turns there.
- Switch on a **picture cut** (snapped within ±0.4 s) and on the **incoming track's downbeat** (always: `src_start` is a downbeat, a 4-bar phrase start when possible).
- Never in the middle of a word: switches move to the end of the word (from `words.json`).
- Best moment of all: land the incoming track's own **drop** (an energy jump in its bars) exactly on the payoff cut. The planner rewards this.
- A track's own breaks/silences must not fall under a voiced section (they read as a glitch). They are fine, even great, under a voiceless beat.
- Tracks with vocals never go under the VO.

## Transition vocabulary (chosen automatically by the energy change; override per switch in `music_plan.json`)

| Type | When | Recipe | SFX cue for sound-design |
| --- | --- | --- | --- |
| `stop_drop` | energy jump ≥ +0.25 (calm/tense → payoff) | outgoing cuts dead ½ beat (0.2–0.6 s) before the switch; incoming lands on its downbeat at the cut | riser or reverse cymbal over the last 2 beats; impact on the switch |
| `echo_out` | energy release ≤ −0.25 (hook → setup, payoff → reflection) | outgoing's last beat repeats 3× at 1-beat spacing, ×0.45 each, low-passed at 2.5 kHz; incoming fades in over ½ bar | soft whoosh or nothing |
| `filter_blend` | similar energy, compatible key (Camelot ±1 or relative) and tempo (within 4–8% or 2:1) | 1 bar (≤ 2.5 s): outgoing low-pass 16 kHz → 300 Hz and fades; incoming pre-rolls high-passed 400 → 20 Hz (bass swap at the midpoint), so its downbeat still lands on the switch | none |
| `hard_cut` | similar energy but keys/tempos clash | 25 ms crossfade exactly on the downbeat and a picture cut | impact if the energy rises |
| `to_silence` | into a deliberate stop | echo tail of the last beat, then nothing | reverb tail or a single hit; let the line land |
| `from_silence` | out of a stop | incoming hits on its downbeat, no fade | often the impact |
| same track: `strip_back` / `hold` / `open_up` | one track carries several sections | low-pass to 1.2–3.5 kHz and −1…−4 dB over 1 beat for a calmer section; back to full for the peak | none |
| same track: `mute` | a stop inside one-track mode | −60 dB for the stop, back on at full level | as `to_silence` / `from_silence` |

Levels: every segment's body is matched to the bed level (−20 dBFS RMS on the music bus), then offset by `(target energy − 0.5) × 6 dB`, so a payoff is up to +1.7 dB louder on purpose and a calm bed −1.5 dB. Accidental jumps between tracks don't happen. The VO duck (10.5 dB, 10/250 ms) and the final master stay in sound-design.

## Checks before the mix goes to sound-design

- `score_mix.py --plot` draws target vs measured energy with every switch. A segment more than 0.15–0.2 off target is a wrong pick or needs a strip-back. Low-passing lowers the measured value more than it lowers what you hear, so read strip-back sections by shape, not by number.
- Listen with earshot where available (`earshot timeline` on the bus: section moods, downbeats). Without it, say the mix was checked by measurement only.
- Every switch on a downbeat and a cut; no switch inside a word; no track break under VO; no vocal track under VO; rights match the video's mode.
- Show Atheeb 2–3 alternative plans (`--top`, or pin different tracks) mixed on the same picture when the music isn't approved yet.
