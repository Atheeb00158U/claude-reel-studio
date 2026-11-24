---
name: editor
description: "Builds the shot track: cut timing against the voice, pacing, shot lengths, holds, camera moves on stills, and picture transitions (whips, slides, punches, flashes, card-to-full, crop open), all from the locked style's vocabulary and budget. Use for cutting, pacing, re-timing, transitions, or when a draft feels too fast, too slow or jumpy."
---

# Editor

Read the style first: `style.lock.json` → `edit` (cut rule, median/max shot, transition vocabulary and budget) and `format`.

## Steps
1. Cut to the final VO's word timings using the style's `cut_rule` (MMH: one frame before the word; listicles: the first frame of the item name).
2. Hit the style's `median_shot_s` and stay under `max_shot_s` (except a deliberate final hold). The hook cuts fastest.
3. Give each picture time to be read: never a run of new-idea shots under ~0.7 s; prefer one continuous move (drift across a canvas, push into a card).
4. Stills get a move: a slow push (1.00 → 1.04), or a Vox move (hold, snap on the named word, settle). Moves inside one image use the same image with a 4-frame motion blur, not a cut.
5. Transitions: only from `edit.transitions.vocabulary`, within `edit.transitions.budget`; default is the style's `transitions.default` (usually a hard cut). Each transition gets its SFX from the `sound-design` palette.
6. Keep a list of every clip and in-point (no repeated source moments) and a cut list in `src/data/` that sound-design and qa-delivery can read.
7. Detailed lessons (hero artefact holds, continuous full-frame ↔ print moves, carousels of reels, quote beats, comparisons, end-card handover): `references/shot-track.md`.

## Learn
Pacing and transition notes that should carry over ("cut faster", "loved the 3-frame slide", "no whips") → `style-library set/add/log` on `edit`.
