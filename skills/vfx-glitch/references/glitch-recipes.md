# Glitch recipes (learned on the MMH videos)

- **InvertGlitch** (the user's favourite; reference DbkET8uuQ5I):
  - For 2–4 frames, bands and blocks of the frame become a negative, using `<div style={{backdropFilter: 'invert(1)'}}>`. This works in raea (tested) and in Remotion's Chromium.
  - Overlapping shapes invert back. One frame of a burst can invert the whole picture.
  - A new random layout every frame: full-width bands, edge-anchored partial bands and blocks.
  - Put it above captions and grain, so the captions invert too.
  - Schedule about 20–25 bursts per 45 s, on cuts and key words, listed in `src/data/glitch.json`. The mixer reads the same file and lays one short Mixkit glitch SFX per burst, trimmed to its length (`_Global library/sfx/originals/glitch_mixkit`).
  - Don't stack a burst on a cut that already has an InvertPunch or a flash.
- **ShapeGlitch** (the Metro Media House glitch, which the user asked for; reference editbymmh DaXuhxvBQw_; built in the cold brew project's `src/Video.tsx`):
  - For about 12 frames the frame breaks into rectangles: offset and rescaled copies of the shot, blocks of the incoming or outgoing shot, and dark and white solid blocks. The pattern re-rolls every 2 frames and is densest mid-burst (3 + 6·sin-envelope tiles).
  - Tiles render the shot's own Sequence inside a clipped, offset div. Before the cut, the next shot is frozen on its first frames (`Freeze`). Give the outgoing shot's Sequence 14 extra frames so its tiles survive past the cut.
  - Use it on about 6–8 punches per 50 s: the title word, the entrance of a named person, the turn of the argument, number reveals, the payoff word and the CTA.
  - Pair each burst with an **electric glitch SFX** ("electrocution" sound): `sfx_g_electric_buzz_glitch_n`, `sfx_g_small_electric_glitch_n` or `sfx_g_glitch_static_n` at about −15 dB, from the burst start, trimmed to the burst.
