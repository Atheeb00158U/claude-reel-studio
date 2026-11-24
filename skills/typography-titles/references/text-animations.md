# Headline grammar and text animations (from the @artzenmedia study, `claude/bible-text.md`)

## Headline stacks
- 1–3 words, a few per reel (≤ 3 per 60 s): a **small line in a script, serif or blackletter face (often the accent colour) set over or overlapping a BIG condensed bold sans** in white. Examples: "Whip / TRANSITION", "effect / DOOM SCROLL", "how to / OVERLAP / text", "comment / 'GLOW'", "you spend hours on the / EDIT".
- The small line overlaps the top of the big word by 20–40% of its own height (it sits *on* it).
- Two colours max: white + one accent (red ≈ #E8343A, warm yellow ≈ #F4D23C, or a neon cyan→violet gradient for CTAs).
- Placement: above the head (y 0.08–0.22), behind the head (text-behind-subject), or full frame on a plate.
- House mapping (MMH styles): small line = Apple Garamond Italic; big = Helvetica Bold or Condensed Bold.

## Animations
| # | Animation | Look | Build (raea/Remotion) | Timing |
| --- | --- | --- | --- | --- |
| A1 | Type-on | letters appear left to right, optional caret | slice the string by `floor((f-f0)/k)`, k = 1–2 f per letter | done in ≤ 0.6 s; typing ticks |
| A2 | Word pop | each word pops on its spoken word | per-word scale 1.12→1 + opacity 0→1 over 3 f | on `wf(i)` |
| A3 | Stretch | letters slide up, then stretch tall | `scaleY 1→2.2`, origin bottom, ease-in; 1 f per-letter slide-up stagger | 8–12 f |
| A4 | Boil | hand-drawn jitter | `feTurbulence` + `feDisplacementMap`, seed stepped every 3–4 f | 6–8 fps boil |
| A5 | Gap cut | an upper title cuts a clean gap out of the title beneath | mask the lower title with the upper title's glyphs dilated 8 px (`feMorphology`), inverted | static |
| A6 | Text as window | video seen through the letters of a colour plate | SVG `<mask>` (white rect + black text) over a coloured rect, video beneath | plate holds, text can move |
| A7 | Colour shift | a stressed word goes white → accent over ~6 f | interpolate `color` | on the stressed syllable |
| A8 | Path text | a line flows along an arc following the shot's motion | SVG `<textPath>`, startOffset 0→100% | runs with the line |
| A9 | Text on a surface | corner-pinned onto a wall or screen | `matrix3d` homography (+ blend) | static or tracked |
| A10 | Text behind subject | headline occluded by the person | subject matte over the text | 1.5–3 s hold |
| A11 | Neon CTA | "comment 'WORD'" with gradient and glow | `background-clip:text` gradient + 2 drop-shadows (8, 24 px) | holds 3–5 s |
| A12 | Counter | numbers tick up (620K → 1M) | interpolate an integer with a K/M formatter, ease-out | 1–1.5 s |
| A13 | Blur-reveal (showcase) | each word appears blurred at ~50%, sharpens | blur 6→0 px + opacity 0.5→1 over 2–3 f; exit blur+fade 3 f | per word |

Every text entrance is short (2–4 f pop or a type-on within 0.6 s) and gets a tick or typing sound from `sound-design`.
