---
name: video-effects
description: "Builds compositing video effects in the locked style from subject mattes: cut-outs with background swaps, text behind the subject, paper-cut stickers, doodle outlines, orbiting cards, frame breaks, green screen, depth scatter, sticky (tracked) labels, before/after wipes, document pull-backs, mosaics and split screens. Use for any matte-based or compositing effect, \"put text behind me\", \"make me break out of the frame\", or effects on a talking head."
---

# Video effects (compositing)

Read the style first: `style.lock.json` → `video_effects` (allowed vocabulary, budget, rules). Glitches and engagement punches belong to `vfx-glitch`; grades to `color-grading`.

## The one move behind most effects
Duplicate the shot, put the subject cut-out on top, put something between (text, glow, cards, a frame, a new background).

## Mattes
- MediaPipe `selfie_multiclass_256x256.tflite` (`_Global library/models/`). Sum the person classes (hair, body skin, face skin, clothes) instead of using 1 − background; threshold ~0.55–0.85; keep the largest component; flood-fill holes (a held glass leaves one); erode 2–3 px and feather 1 px so no colour rim shows.
- Per frame for video → PNG sequence; check 3–4 frames at full size; when the clean range is shorter than the shot, make a dedicated clip and matte that frame for frame.
- Track points for sticky labels with MediaPipe pose (shoulder/chest landmarks), smoothed.

## Effect recipes
- Showcase-format effects (paper cut, doodle boil, depth scatter, sticky text, before/after light bar, frame break, orbit, green screen, digital zoom) with frame timings: the `listicle` section of `references/compositing-recipes.md` and the built stills in `ui-motion-graphics/assets/showcase-lab.tsx`.
- MMH vocabulary (Cutout + white streak, Halftone plate, Mosaic pull-out, DocPull, Split, Mono, StretchIn, Flicker, Wall, Slam, FramedPrint), the effect budget, and the kit to port: `references/compositing-recipes.md`.

## Approved defaults (Nov 2026)
- **Text behind the subject / inverted (difference) words are off by default.** Atheeb found them distracting. Use them only when he asks. When a big word is removed, put that word back into the caption chunks.
- **Graphics behind the speaker** for brand or claim lines: keep the A-roll and draw the animation on the background plate before the grade, so the room's look sits on it.
  - Bars rise on the wall either side of him (cream → terracotta, 7 bars, 0.16 s apart, 0.45 s ease-out each).
  - A counter climbs above his head (Inter Display Black, about 150 px).
  - A growth line joins the bar tops.
  - Recipe: `scripts/behind_speaker_gfx.py`.
- **Green-screen key:** static plate, speaker fixed at 1.03 over-scale to hide edges. No gimbal parallax: Atheeb removed it.

## Steps
1. Pick effects only from the style's vocabulary, each with a story reason, inside the budget (default: one hook effect, ≤2 hero effects, one payoff effect, 3–5 s of plain footage between).
2. The first time an effect or kit component is used in raea, render one still and compare with the reference.
3. Hand each effect's frames to `sound-design` for its SFX.

## Learn
Effects Atheeb likes or rejects → `style-library add <id> video_effects.vocabulary …` or `log --kind rejected`.
