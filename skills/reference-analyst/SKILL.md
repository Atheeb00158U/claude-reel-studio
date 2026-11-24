---
name: reference-analyst
description: "Studies reference videos frame by frame (30 fps minimum) and turns what it measures into a draft style: structure, pacing, captions, UI motion, effects, glitches, colour, sound levels. Use when Atheeb sends reference reels, says \"learn this style\", \"analyse these videos\", \"replicate this look\", or wants a new client style built from examples."
---

# Reference analyst

Turns reference videos into numbers a style can hold. A worked example of a full analysis is `references/example-showcase-analysis.md` (4 showcase reels, Nov 21 2026).

## Steps
1. **Get the files.** Uploaded files are in the uploads folder. Instagram/YouTube/X references: see the `footage-research` skill. Keep references in `_Global library/references/<style-id>/` and note they are reference only.
2. **Probe:** resolution, fps, duration (`ffprobe`). Analyse at the native rate, never below 30 fps.
3. **Frames:** dump every frame small (`fps=30,scale=180:320`). Make a 2 fps overview sheet per video first, then 30 fps sheets (15 columns × 8 rows per sheet) for every section with something happening. Pull full-resolution frames to read text, lists, fonts and UI.
4. **Cuts and events:** frame-difference spikes (mean absolute luma difference > 4× the median) give cuts, flashes and effect starts. ffmpeg scene detection doesn't work in this build.
5. **Words:** transcribe with faster-whisper-small.en (`_Global library/models/faster-whisper-small.en/`; stage `parts/` and `cat` them; decode audio with ffmpeg to float32). Line each visual event up with the word it lands on: this is how "the effect lands on the first frame of the item name" was found.
6. **Measure, don't describe.** For each department, record numbers:
   - format and structure (beats with timestamps, % of runtime);
   - edit: shot/item lengths (mean, max), cut rule relative to words, transition types and frame counts;
   - captions: face (closest installed match), sizes as px at 1080 wide, case, tracking, colours (sample pixels), reveal/exit frames, positions as fractions of the frame;
   - UI motion: components, radii, borders, glass/blur, durations in frames, easing feel;
   - video effects and glitches: what moves, what is masked, frame counts, how often;
   - colour: look per section, whether it's a grade or relighting (AI), reference frames;
   - sound: separate voice/bed with UVR-MDX-NET-Voc_FT (`audio-separator`, model from the TRvlvr GitHub release); measure each with ffmpeg `ebur128`; spectrogram for SFX hits and music presence; note music style and level under the voice.
7. **Write the draft style.** `style-library` → `new <client>-<format> --name … --client … [--from closest style]`, then `set`/`add` every measured value with `--note "measured from <reel>"`, and write `STYLE.md` as the full study (like the example). Status stays `draft`.
8. **Prove it.** Rebuild 3–6 of the signature moments as stills or a short test in raea on our own or stock footage, put them beside reference frames, and show Atheeb. Log what he approves or rejects into the draft style.
9. **Save the study** as a project doc `claude/bible-<style-id>.md` and in `_Global library/references/bibles/`.

## Rules
- Reference videos are never republished; rebuild the look with our own material.
- If an effect can't be done honestly here (e.g. AI relighting), say so in the style and give the options; never fake it.
- Don't run code from cloned third-party repos; read for ideas only.
