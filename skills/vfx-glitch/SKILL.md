---
name: vfx-glitch
description: "Designs and schedules engagement VFX in the locked style: invert glitches, shape/block glitches, RGB split, strip glitches, face flicker, white flashes, zoom punches, grade strobes and other pattern interrupts, each synced to cuts and key words with its own glitch sound. Use for glitches, \"crazy\" or attention-grabbing effects, pattern interrupts, hooks that need a jolt, or when asked to make a video more engaging."
---

# VFX glitch (engagement punches)

Read the style first: `style.lock.json` → `vfx_glitch` (default type, allowed types with frame counts, frequency, SFX; budget; rules). If the style has no glitch types (e.g. Berribot explainers), don't add any unless Atheeb asks, then log his answer.

## Default glitch: ShapeGlitch
Atheeb set the cold brew v2 glitch as the default (Nov 21 2026). Whenever a video uses glitches and the style doesn't name another type, use **ShapeGlitch** (the Metro Media House block glitch, ref editbymmh DaXuhxvBQw_): for 12 frames the frame breaks into rectangles (offset/rescaled copies of the outgoing shot, blocks of the incoming shot, dark and white solids), re-rolled every 2 frames, densest mid-burst (3 + 6·sin tiles), on 6–8 punches per 50 s (title word, a named person's entrance, the turn, number reveals, the payoff word, the CTA), each with an electric glitch SFX at about −15 dB from the burst's first frame (`sfx_g_electric_buzz_glitch_n`, `sfx_g_small_electric_glitch_n`, `sfx_g_glitch_static_n`).
- raea component: `assets/ShapeGlitch.tsx` (copy in `_Global library/raea_kit/glitch/`). Render it above shots and captions, below grain; pass the outgoing shot and the incoming shot frozen on its first frames; keep the outgoing Sequence alive 14 frames past the cut so its tiles survive. Test sheet: `assets/shapeglitch_burst_12f.jpg`.
- InvertGlitch (2–4 f invert bands, 20–25 per 45 s) is the second option, used when the style or Atheeb asks for it.

## Schedule, then build
1. Make a schedule file `src/data/glitch.json` (frame, type, duration, seed). Both the picture and the sound mix read it, so every burst gets its SFX exactly.
2. Place bursts on cuts and key words, at the style's frequency (e.g. InvertGlitch 20–25 per 45 s; ShapeGlitch on 6–8 punches per 50 s: title word, named-person entrance, turn, numbers, payoff, CTA).
3. Never stack a burst on a cut that already has a flash, invert punch or whip.
4. Render every frame of every burst on a contact sheet and check: a new layout each frame, overlaps invert back, captions invert too (glitch layer above captions and grain).

## Recipes
`references/glitch-recipes.md`: InvertGlitch (`backdropFilter: 'invert(1)'` bands and blocks for 2–4 f, tested in raea), ShapeGlitch (12-frame rectangle breakup re-rolled every 2 f, tiles rendering offset copies of the in/out shots, `Freeze` on the incoming shot, 14 extra frames on the outgoing Sequence). Also in the MMH kit: RGB split, strip glitch, face flicker, invert flash, zoom punch, white flash, blur-bloom, light leak (`_Global library/remotion_kit/src/Fx.tsx`, port on first use and check a still).
- Grade strobe recap (listicle grade reels): 2–3 f per look across ~1.5 s, with one sub hit.
- **When Atheeb names a reference glitch, download it and step through its frames first** (shape, frames, what inverts, its sound); rebuilding from a verbal description failed before (white blocks instead of true inversion).

## Learn
If he likes a glitch, run it through the whole video (varied) and `add` it to `vfx_glitch.types`; rejections → `log --kind rejected`.
