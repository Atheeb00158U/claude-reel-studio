# Emotion map: story beat → mood → measurable music

The music director turns each story section into a **mood** and a **target energy** (0–1), then picks music whose measured features match. Mood names are the shared vocabulary for scripts, styles and `arc.json`.

## Mood vocabulary

| Mood | Target energy | What it should sound like (pick by ear and by numbers) | Typical story beat |
| --- | --- | --- | --- |
| calm | 0.25 | sparse drums or none, soft attack, low brightness (centroid < 1000 Hz), few onsets (< 3/s) | explanation, aftermath |
| reflective | 0.28 | calm + minor/ambiguous harmony, warm low-mids | "what it means", lesson, sad turn |
| warm | 0.32 | calm + major harmony, gentle groove | CTA, brand love, human moment |
| dreamy | 0.30 | long reverb tails, bright pads, slow movement | nostalgia, vision, "imagine" |
| curious | 0.48 | steady mid-tempo groove (90–110 BPM), plucks, light percussion | setup, "here's the thing", who/what |
| playful | 0.52 | bouncy, syncopated, major, staccato | quirky fact, funny reveal |
| tense | 0.52 | minor or unresolved, pulsing bass, rising filter, fewer melodic notes | the problem, stakes, countdown |
| dark | 0.56 | low register, minor/diminished, heavy sub, dim top end | villain, failure, scandal |
| driving | 0.70 | four-on-the-floor or hard boom-bap, dense hats, full range | momentum, montage, "then it took off" |
| intense | 0.75 | dense, loud, bright, strong low end | hook, climax |
| aggressive | 0.80 | distorted, hard hits, fast | conflict, takedown |
| hype | 0.80 | major/bright, big drums, anthemic | win, record, launch |
| triumphant | 0.78 | hype + big harmonic lift (drop, chorus) | payoff, the result |
| silence | 0 | music off (a deliberate stop) | the stat that must land, a dramatic quote |

Families (used for fit, and for merging sections): calm/reflective/warm/dreamy → curious/playful → tense/dark → driving/intense/aggressive → hype/triumphant. Neighbouring families partly fit.

## How energy is measured (`analyze_track.py`)

Per bar: `energy = 0.40·onset density (1.5–7 /s) + 0.30·spectral centroid (400–2600 Hz) + 0.30·RMS (−24…−8 dBFS)`. Rhythmic density and brightness carry most of the weight because every mastered track is loud. Calibrated on our library (Nov 21 2026):

| Track | Energy (mean / range) | Read as |
| --- | --- | --- |
| Lo-Fi 04, Jazz Lo-Fi (YuraSoop), Melodic Hip-Hop | ~0.3 (0.05–0.5) | calm / reflective |
| Indian Boom-Bap, Luxurious Layer, Superhero (instr) | ~0.55 | curious |
| New Bass 02 | 0.15–0.6 | tense / dark |
| Deep Urban, Big Dawgs (instr), Money Trees (instr) | 0.7–0.9 at their peaks | driving / intense |

Big Dawgs' own break at 48.6–50.7 s was detected automatically, matching the gap we found by hand for Fevicol.

Key detection (Krumhansl profiles → Camelot) is often low-confidence on hip-hop and lo-fi (`key_confidence` < 0.12); then major/minor is ignored for mood and only used as a soft blend hint. BPM is folded into 70–160; `bpm_alt` keeps the half/double reading (Money Trees reads 143.5; it is felt at ~72). 2:1 tempos still blend.

## Mapping the story to moods (do this from the script, before searching)

1. Mark the beats: hook, setup, each turn, number/fact moments, quote, payoff, CTA (script-and-voice gives them as `beats.json`).
2. Give each beat a mood from the table. Ask of each line: what should the viewer feel *right now*: curiosity, worry, relief, awe? The music says it before the words do.
3. Contrast drives retention. The arc needs at least one clear rise (≥ +0.25) into the payoff, and a dip (calm or a stop) before it. Five minutes of "intense" is just loud.
4. Voiced sections sit 0.1–0.2 lower than the voiceless beat after them, so the payoff can open up.
5. The hook is high (intense/hype) or a held, eerie tense bed. Never calm.
6. The CTA/end card resolves (warm or triumphant), it doesn't fade into nothing.
